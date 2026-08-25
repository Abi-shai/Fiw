#!/usr/bin/env python3
"""Génère docs/style-guide.tokens.json depuis apps/fiw/constants/*.

Le fichier de tokens avait divergé du code au point d'être faux (icônes Lucide
jamais installées, boutons 52/44, pas de displayXl, pas de jaune de marque). Il
est désormais DÉRIVÉ : la source de vérité reste apps/fiw/constants/*.ts, et ce
script rejoue la traduction.

Usage :  python3 scripts/gen-style-guide-tokens.py
"""

import json
import pathlib
import re
import sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONST = ROOT / "apps" / "fiw" / "constants"
OUT = ROOT / "docs" / "style-guide.tokens.json"


def strip_comments(src: str) -> str:
    """Retire les commentaires // et /* */ pour ne pas parser leur contenu."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"//[^\n]*", "", src)
    return src


def read(name: str) -> str:
    return strip_comments((CONST / name).read_text(encoding="utf-8"))


def parse_strings(src: str) -> dict:
    """key: 'value',  →  {key: value}. Conserve l'ordre du fichier."""
    return dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", src))


def parse_numbers(src: str) -> dict:
    r"""key: 12,  /  12: 48,  /  1.5: 6,  →  {key: 12}. Conserve l'ordre du fichier.

    La clé accepte le point : l'échelle d'espacement porte des demi-crans
    (`1.5: 6`) que `[\w]+` laissait tomber silencieusement."""
    return {k: float(v) if "." in v else int(v)
            for k, v in re.findall(r"([\w.]+)\s*:\s*(\d+(?:\.\d+)?)\s*,", src)}


def colors() -> dict:
    return parse_strings(read("colors.ts"))


def typography() -> dict:
    src = read("typography.ts")
    weights = {k: int(v) for k, v in re.findall(r"(\w+):\s*'Outfit_(\d+)", src)}
    scale = {}
    for name, family, size, lh in re.findall(
        r"(\w+):\s*\{\s*fontFamily:\s*Outfit\.(\w+),\s*fontSize:\s*(\d+),\s*lineHeight:\s*(\d+)",
        src,
    ):
        scale[name] = {"size": int(size), "weight": weights.get(family), "line-height": int(lh)}
    section = re.search(r"letterSpacing:\s*([\d.]+)", src)
    return {
        "font-family": "Outfit",
        "font-weight": weights,
        "scale": scale,
        "section-label": {
            "text-transform": "uppercase",
            "letter-spacing": float(section.group(1)) if section else None,
        },
    }


def shadows() -> dict:
    src = read("shadows.ts")
    # Toutes les constantes de couleur du fichier, pas seulement BRAND/NEUTRAL :
    # la version precedente testait `"BRAND" in body` et retombait sur NEUTRAL
    # sinon, ce qui a fait sortir `sheet` en #0B1220 au lieu de #374151 le jour
    # ou une troisieme constante est apparue. Un KeyError vaut mieux qu'un repli.
    consts = dict(re.findall(r"const (\w+) = '([^']+)'", src))
    out = {}
    for name, body in re.findall(r"(\w+):\s*\{(.*?)\n  \}", src, flags=re.S):
        ref = re.search(r"shadowColor:\s*(\w+)", body)
        if not ref:
            raise SystemExit(f"shadows.ts : `{name}` n'a pas de shadowColor lisible")
        if ref.group(1) not in consts:
            raise SystemExit(
                f"shadows.ts : `{name}` reference la constante `{ref.group(1)}`, "
                f"absente du fichier (connues : {', '.join(sorted(consts))})")
        color = consts[ref.group(1)]
        def num(field, default=0.0):
            m = re.search(field + r":\s*(-?[\d.]+)", body)
            return float(m.group(1)) if m else default
        out[name] = {
            "offset-x": num(r"width"),
            "offset-y": num(r"height"),
            "blur": num(r"shadowRadius"),
            "spread": 0,
            "color": color,
            "opacity": num(r"shadowOpacity"),
            "elevation": int(num(r"elevation")),
        }
    return out


def strokes() -> dict:
    """Epaisseurs de lisere. `hairline` vaut StyleSheet.hairlineWidth cote RN :
    la plateforme le calcule (≈0.5 en @2x, ≈0.33 en @3x). On sort la valeur
    nominale de maquette (0.5) et on note la provenance, plutot que d'inventer
    un nombre ou de laisser un trou."""
    src = read("strokes.ts")
    out = {}
    for name, val in re.findall(r"^\s{2}(\w+):\s*([\w.]+),", src, re.M):
        if val == "StyleSheet.hairlineWidth":
            out[name] = {"value": 0.5, "platform": "StyleSheet.hairlineWidth",
                         "note": "calcule par la plateforme ; 0.5 est le nominal de maquette"}
        else:
            out[name] = float(val) if "." in val else int(val)
    return out


def main() -> int:
    doc = {
        "$generated": (
            "GENERE — ne pas editer a la main. "
            "Source de verite : apps/fiw/constants/*.ts. "
            "Regenerer : python3 scripts/gen-style-guide-tokens.py"
        ),
        "$generatedOn": date.today().isoformat(),
        "color": colors(),
        "typography": typography(),
        "spacing": parse_numbers(read("spacing.ts")),
        "radius": parse_numbers(read("radii.ts")),
        "shadow": shadows(),
        "stroke": strokes(),
        "icon": {
            "library": "phosphor-react-native",
            "weight-default": "bold",
            "weight-active": "fill",
            "size": {"inline": 16, "button": 18, "floating": 24},
        },
    }
    OUT.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : "
          f"{len(doc['color'])} couleurs, {len(doc['typography']['scale'])} styles de texte, "
          f"{len(doc['spacing'])} espacements, {len(doc['radius'])} rayons, "
          f"{len(doc['stroke'])} liseres, "
          f"{len(doc['shadow'])} ombres")
    return 0


if __name__ == "__main__":
    sys.exit(main())
