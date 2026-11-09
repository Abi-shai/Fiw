#!/usr/bin/env python3
"""Porte les composants du design system de Fiw (Client) vers Fiw Pro.

**Le Client fait source.** Tant que l'ADR 0004 n'est pas exécuté
(`packages/ui` partagé), Fiw Pro travaille sur des **copies**. La différence
avec `gen-pro-tokens.py` est importante :

- les **jetons** sont un miroir strict — on n'édite jamais le fichier Pro ;
- les **composants** sont des copies *qui ont le droit de diverger*, parce que
  l'app Pro rencontrera des besoins que le Client n'a pas.

Le risque est donc la divergence **silencieuse** : c'est exactement ce qu'il a
fallu six semaines de passes pour résorber côté Affiliation. D'où ce script, qui
sert deux usages :

    python3 scripts/sync-pro-components.py            # rapporte les écarts
    python3 scripts/sync-pro-components.py --apply    # écrase le Pro par le Client

`--apply` sans argument reporte TOUT le manifeste. Pour ne reprendre qu'un
composant : `--apply ListRow Button`.

Un fichier qui diverge n'est pas une faute en soi — c'est une décision à
connaître. Le rapport la rend visible ; il ne la corrige pas tout seul.
"""

from pathlib import Path
import filecmp
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "apps" / "fiw"
DST = ROOT / "apps" / "fiw-pro"

# ── Manifeste ─────────────────────────────────────────────────────────────
# Volontairement explicite : on porte ce dont la v1 Pro a besoin, pas les 58
# composants du Client. Ce qui manque s'ajoute ici au moment où un écran le
# demande — pas « au cas où ».
COMPONENTS = [
    # Atomes
    "Text", "Icon", "Button", "IconButton", "Avatar", "Divider", "Spinner",
    "Badge", "AlertBadge", "Medallion", "PlateChip", "ProgressBar", "Logo",
    # Contrôles
    "Toggle", "Checkbox", "Radio", "SegmentedControl", "ActionPill",
    "Field", "CountryPicker", "FlagChip", "CodeField", "SearchBar",
    "ActionTile",
    # Rangées & listes
    "ListRow", "List", "InfoRow", "StepList", "OptionCard",
    # Notes
    "Hint", "Callout", "InfoBanner", "Toast",
    # Surfaces
    "Sheet", "BottomSheet", "Scrim", "ScreenHeader", "ScreenFooter",
    "ResultState", "BrandSplash",
    # Métier repris tel quel
    "RouteCard", "GammeCard", "ReceiptCard", "StepProgress", "FauxQR",
    "LeafletMap",
]

# Non portés, et pourquoi — à garder écrit, sinon la question se repose.
EXCLUS = {
    "PaymentSheet":        "adossé à constants/data du Client",
    "LivraisonModeChoice": "adossé à constants/data du Client",
    "RapprochementChoice": "frais de rapprochement — côté Client uniquement",
    "AltSuggestCard":      "proposition de repli Livraison — hors v1 Pro",
    "PrestataireRow":      "vue CLIENT d'un Prestataire ; le Pro n'en affiche pas",
    "VehicleGroup":        "idem — le bloc véhicule est une vue Client",
    "AvatarStack":         "pile d'avatars de la recherche Client",
    "PlaceField":          "saisie d'un Lieu — le Pro ne commande pas de course",
    "ChipGroup":           "sans emploi courant, même côté Client",
    "WheelPicker":         "descopé avec la livraison planifiée",
    "CodePill":            "code de remise — Livraison, hors v1 Pro",
    "HandWithCash":        "illustration de l'Affiliation, côté Client",
    "PayLogo":             "logos d'opérateur — à porter quand le Wallet Pro les affichera",
    "ReceiptCard":         None,  # porté, placeholder pour mémoire
}

CONSTANTS = ["countries.ts", "flags.ts", "illustrations.ts"]
HOOKS = ["useSnapSheet.ts"]
# Les icônes d'application sont propres à chaque app : ne jamais les écraser.
ASSETS_SKIP = {"icon.png", "splash.png", "adaptive-icon.png"}


def pairs():
    """(source, destination, étiquette) pour tout le manifeste."""
    for name in COMPONENTS:
        yield SRC / "components" / f"{name}.tsx", DST / "components" / f"{name}.tsx", name
    for c in CONSTANTS:
        yield SRC / "constants" / c, DST / "constants" / c, f"constants/{c}"
    for h in HOOKS:
        yield SRC / "hooks" / h, DST / "hooks" / h, f"hooks/{h}"


def copy_assets(apply: bool) -> int:
    n = 0
    for src in sorted((SRC / "assets").rglob("*")):
        if src.is_dir() or src.name in ASSETS_SKIP:
            continue
        dst = DST / "assets" / src.relative_to(SRC / "assets")
        if dst.exists() and filecmp.cmp(src, dst, shallow=False):
            continue
        n += 1
        if apply:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
    return n


def main() -> None:
    args = sys.argv[1:]
    apply = "--apply" in args
    only = {a for a in args if not a.startswith("--")}

    manquants, diffs, ok = [], [], 0
    for src, dst, label in pairs():
        if only and label not in only and Path(label).stem not in only:
            continue
        if not src.exists():
            sys.exit(f"source introuvable : {src.relative_to(ROOT)}")
        if not dst.exists():
            manquants.append(label)
        elif not filecmp.cmp(src, dst, shallow=False):
            diffs.append(label)
        else:
            ok += 1
            continue
        if apply:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)

    assets = copy_assets(apply)
    verbe = "portés" if apply else "à porter"

    print(f"Identiques au Client : {ok}")
    if manquants:
        print(f"\nAbsents du Pro ({len(manquants)} {verbe}) :")
        for m in manquants:
            print(f"  + {m}")
    if diffs:
        print(f"\n⚠️  DIVERGENTS ({len(diffs)}) — "
              + ("écrasés par le Client." if apply else "le Pro a été modifié à la main."))
        for d in diffs:
            print(f"  ~ {d}")
    if assets:
        print(f"\nAssets : {assets} fichier(s) {verbe}.")
    if not apply and (manquants or diffs or assets):
        print("\nRelancer avec --apply pour aligner.")


if __name__ == "__main__":
    main()
