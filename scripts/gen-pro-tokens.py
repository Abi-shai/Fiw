#!/usr/bin/env python3
"""Génère les jetons de Fiw Pro depuis ceux de Fiw (Client).

**Les jetons du Client font source.** `apps/fiw-pro/constants/` en est un miroir
généré : on n'y édite rien à la main, on relance ce script.

Pourquoi un générateur plutôt qu'un paquet partagé — l'ADR 0004 prévoit
`packages/tokens` consommé par les deux apps. Il n'est pas construit, et le
dépôt n'a aujourd'hui ni workspaces ni `metro.config.js` : le monter demande de
toucher au bundling des deux applications. Ce script tient la promesse qui
compte (**une seule source**, pas de divergence entretenue à la main) sans ce
risque, et il se jette le jour où l'ADR 0004 est exécuté. Même parti pris que
`gen-style-guide-tokens.py`, qui dérive déjà `docs/style-guide.tokens.json` des
mêmes fichiers.

Ce qui change entre les deux apps — et c'est TOUT ce qui change :
la famille primaire. Le reste (gris, fonctionnelles, échelle bleue, typo,
espacement, rayons, liserés) est strictement commun, par décision du style guide.

    python3 scripts/gen-pro-tokens.py
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "apps" / "fiw" / "constants"
DST = ROOT / "apps" / "fiw-pro" / "constants"

BANNER = (
    "// ⚠️ FICHIER GÉNÉRÉ — ne pas éditer à la main.\n"
    "// Source : apps/fiw/constants/{name}  ·  Générateur : scripts/gen-pro-tokens.py\n"
    "// Toute correction se fait côté Client, puis on relance le générateur.\n"
)

# ── La famille primaire, seule différence entre les deux apps ──────────────
# Valeurs du style guide (§ Couleurs / Primaire). Fiw Pro décale la primaire
# d'un palier vers le foncé : le bleu 800 au lieu du 700, et chaque rôle suit.
PRIMARY = {
    "primary":        ("'#0066FF'", "'#084EC5'"),   # blue700 → blue800
    "primaryHover":   ("'#0676FF'", "'#0D459B'"),   # blue600 → blue900
    "primaryPressed": ("'#0D459B'", "'#0E2B5D'"),   # blue900 → blue950
    "primarySubtle":  ("'#EDF7FF'", "'#D6EDFF'"),   # blue50  → blue100
    # `primaryFill` — l'aplat des grandes surfaces. Côté Client il existe parce
    # que #0066FF, étalé, vibre et écrase l'illustration posée dessus. Le bleu
    # Pro est déjà moins saturé : le rôle retombe sur la primaire elle-même.
    "primaryFill":    ("'#3B82F6'", "'#084EC5'"),
    # `primaryInk` — le bleu de TEXTE sur fond clair. Côté Client il descend
    # d'un palier parce que #0066FF manque de corps à 18 px. Même geste ici :
    # un palier sous la primaire Pro, soit blue900.
    "primaryInk":     ("'#005DE8'", "'#0D459B'"),
    # `primaryGhost` — la primaire à peine posée (anneaux du radar).
    "primaryGhost":   ("'rgba(0, 102, 255, 0.06)'", "'rgba(8, 78, 197, 0.06)'"),
}

# Ombres : la teinte de marque qui colore sm/md/lg.
SHADOW_BRAND = ("const BRAND = '#0066FF';", "const BRAND = '#084EC5';")

# Fichiers repris tels quels, au banderole près.
VERBATIM = ["radii.ts", "spacing.ts", "strokes.ts", "typography.ts"]


def banner(name: str) -> str:
    return BANNER.format(name=name)


def gen_colors() -> str:
    src = (SRC / "colors.ts").read_text()
    out = src
    for key, (client, pro) in PRIMARY.items():
        # On ne substitue que sur la ligne qui DÉCLARE le rôle : `primary: '#…'`.
        # Une substitution globale du hex toucherait aussi l'échelle bleue
        # (blue700 vaut le même #0066FF), qui doit rester intacte — c'est la
        # référence partagée, pas la couleur de l'app.
        pattern = re.compile(rf"^(\s*{key}:\s*)" + re.escape(client), re.M)
        out, n = pattern.subn(rf"\g<1>{pro}", out)
        if n != 1:
            sys.exit(f"colors.ts : {key} — {n} occurrence(s) de déclaration, 1 attendue")
    note = (
        "\n// ── Fiw Pro ───────────────────────────────────────────────────────────\n"
        "// La primaire descend d'un palier par rapport au Client : blue800 au lieu\n"
        "// de blue700, et hover/pressed/subtle suivent. L'ÉCHELLE bleue ci-dessous\n"
        "// est inchangée — c'est la référence commune aux deux apps, pas la couleur\n"
        "// de l'une d'elles.\n"
        "//\n"
        "// ⚠️ Deux rôles sont DÉRIVÉS et non repris de la maquette, faute de valeur\n"
        "// Pro posée : `primaryFill` retombe sur la primaire (le bleu Pro, moins\n"
        "// saturé, ne vibre pas comme #0066FF sur une grande surface) et\n"
        "// `primaryInk` descend à blue900 — où il rejoint `primaryHover`. À\n"
        "// confirmer en maquette avant d'en dépendre.\n"
    )
    return banner("colors.ts") + note + "\n" + out


def gen_shadows() -> str:
    src = (SRC / "shadows.ts").read_text()
    if SHADOW_BRAND[0] not in src:
        sys.exit("shadows.ts : la constante BRAND du Client a changé de forme")
    return banner("shadows.ts") + "\n" + src.replace(*SHADOW_BRAND)


def gen_barrel() -> str:
    src = (SRC / "tokens.ts").read_text()
    src = src.replace(
        "// Barrel des tokens du Design System Fiw.",
        "// Barrel des tokens du Design System Fiw Pro.",
    )
    return banner("tokens.ts") + "\n" + src


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    written = []

    (DST / "colors.ts").write_text(gen_colors()); written.append("colors.ts")
    (DST / "shadows.ts").write_text(gen_shadows()); written.append("shadows.ts")
    (DST / "tokens.ts").write_text(gen_barrel()); written.append("tokens.ts")

    for name in VERBATIM:
        (DST / name).write_text(banner(name) + "\n" + (SRC / name).read_text())
        written.append(name)

    print(f"Jetons Fiw Pro générés depuis {SRC.relative_to(ROOT)} :")
    for w in written:
        print(f"  · {w}")


if __name__ == "__main__":
    main()
