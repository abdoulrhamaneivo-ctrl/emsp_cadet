#!/usr/bin/env python3
"""
Assemble la sidebar EMSP + coque UI commune (SEO, fonds, scripts vitrine).

Usage :
    python scripts/build-vitrine.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VITRINE = ROOT / "html5up-editorial"
SIDEBAR_PARTIAL = VITRINE / "partials" / "sidebar.html"

PAGES = [
    "index.html",
    "formations-fsp.html",
    "formations-fs-menum.html",
    "formations-regnum.html",
    "formation-continue.html",
    "mediatheque.html",
    "contact.html",
    "concours.html",
]

MARKER_START = "<!-- SIDEBAR -->"
MARKER_END = "<!-- /SIDEBAR -->"

HEAD_INJECT = """
\t\t<meta name="emsp-aine-cadet-url" content="/" />
\t\t<link rel="icon" href="assets/images/logo.svg" type="image/svg+xml" />
\t\t<meta property="og:type" content="website" />
\t\t<meta property="og:site_name" content="EMSP" />
\t\t<meta property="og:image" content="assets/images/backgrounds/hero-emerald.jpg" />"""

ASSET_LINKS = """
\t\t<link rel="stylesheet" href="assets/css/fontawesome-all.min.css" />
\t\t<link rel="preconnect" href="https://fonts.googleapis.com" />
\t\t<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
\t\t<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,400italic,600italic|Roboto+Slab:400,700" />"""

SKIP_LINK = '\t\t<a href="#main" class="ac-skip-link">Aller au contenu principal</a>\n\n'
FOOTER_UI = """
\t\t<script src="assets/js/ac-ui-vitrine.js"></script>
\t\t<button type="button" id="ac-back-to-top" class="ac-back-to-top" aria-label="Remonter en haut">↑</button>
"""

SIDEBAR_BLOCK_RE = re.compile(
    r'(<div id="sidebar">\s*)'
    r"(?:<!-- SIDEBAR -->.*?<!-- /SIDEBAR -->|"
    r'<div class="inner">.*?</div>\s*)'
    r"(</div>)",
    re.DOTALL,
)


def wrap_sidebar(sidebar_inner: str) -> str:
    return (
        f'<div id="sidebar">\n\t\t\t{MARKER_START}\n'
        f"{sidebar_inner.rstrip()}\n"
        f"\t\t\t{MARKER_END}\n\t\t\t</div>"
    )


def inject_sidebar(page_path: Path, sidebar_html: str) -> bool:
    content = page_path.read_text(encoding="utf-8")
    replacement_inner = f"{MARKER_START}\n{sidebar_html.rstrip()}\n\t\t\t{MARKER_END}"

    if MARKER_START in content:
        pattern = re.compile(
            re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
            re.DOTALL,
        )
        new_content, count = pattern.subn(replacement_inner, content, count=1)
    else:
        new_block = wrap_sidebar(sidebar_html)
        new_content, count = SIDEBAR_BLOCK_RE.subn(new_block, content, count=1)

    if count == 0:
        return False
    page_path.write_text(new_content, encoding="utf-8")
    return True


def patch_header_social(content: str) -> str:
    content = content.replace(
        'href="#" class="icon brands fa-linkedin-in emsp-social-linkedin"',
        'href="" class="icon brands fa-linkedin-in emsp-social-linkedin"',
    )
    content = content.replace(
        'href="#" class="icon brands fa-youtube emsp-social-youtube"',
        'href="" class="icon brands fa-youtube emsp-social-youtube"',
    )
    content = content.replace(
        'href="#" class="emsp-student-link"',
        'href="" class="emsp-student-link"',
    )
    content = content.replace(
        'href="#" class="button small emsp-student-link"',
        'href="" class="button small emsp-student-link"',
    )
    return content


def patch_page_shell(content: str, page_name: str) -> str:
    """SEO, fond motif, skip link, retour haut — coque commune vitrine."""
    # Polices / Font Awesome — hors main.css (évite @import bloquant)
    if "fontawesome-all.min.css" not in content:
        content = content.replace(
            '<link rel="stylesheet" href="assets/css/main.css" />',
            ASSET_LINKS + '\n\t\t<link rel="stylesheet" href="assets/css/main.css" />',
            1,
        )

    # Meta SEO de base
    if "emsp-aine-cadet-url" not in content:
        content = content.replace(
            '<meta name="viewport"',
            HEAD_INJECT + "\n\t\t" + '<meta name="viewport"',
            1,
        )

    # OG title depuis <title>
    if 'property="og:title"' not in content:
        m = re.search(r"<title>([^<]+)</title>", content)
        if m:
            title = m.group(1).strip()
            content = content.replace(
                '<meta property="og:type"',
                f'<meta property="og:title" content="{title}" />\n\t\t<meta property="og:type"',
                1,
            )

    # Classe fond page
    content = content.replace(
        '<body class="is-preload">',
        '<body class="is-preload emsp-page-bg">',
    )
    content = re.sub(
        r'<body class="is-preload emsp-page-bg emsp-page-bg">',
        '<body class="is-preload emsp-page-bg">',
        content,
    )

    # Skip link
    if "ac-skip-link" not in content:
        content = content.replace(
            "<body class=\"is-preload emsp-page-bg\">",
            "<body class=\"is-preload emsp-page-bg\">\n\n" + SKIP_LINK,
            1,
        )

    # id main pour skip link (sauf index qui a déjà #main sur div)
    if 'id="main"' in content and 'id="main-content"' not in content:
        pass  # ok

    # En-tête formation avec photo emerald
    content = content.replace(
        '<div class="emsp-page-header">',
        '<div class="emsp-page-header emsp-page-header--emerald">',
    )

    # Scripts UI
    if "ac-ui-vitrine.js" not in content:
        content = content.replace("</body>", FOOTER_UI + "\n\t</body>", 1)

    # emsp-init obligatoire
    if "emsp-init.js" not in content:
        content = content.replace(
            "</body>",
            '\t\t<script src="assets/js/emsp-config.js"></script>\n'
            '\t\t<script src="assets/js/emsp-init.js"></script>\n\t</body>',
            1,
        )

    return content


def main() -> int:
    if not SIDEBAR_PARTIAL.is_file():
        print(f"Erreur : partial introuvable — {SIDEBAR_PARTIAL}", file=sys.stderr)
        return 1

    sidebar_html = SIDEBAR_PARTIAL.read_text(encoding="utf-8")
    ok, skip = 0, 0

    for name in PAGES:
        page = VITRINE / name
        if not page.is_file():
            print(f"  WARN Page absente : {name}")
            skip += 1
            continue

        content = page.read_text(encoding="utf-8")
        content = patch_header_social(content)
        content = patch_page_shell(content, name)
        page.write_text(content, encoding="utf-8")

        if inject_sidebar(page, sidebar_html):
            print(f"  OK {name}")
            ok += 1
        else:
            print(f"  WARN Sidebar non injectee dans {name}")
            skip += 1

    print(f"\nTerminé : {ok} page(s) mise(s) à jour, {skip} ignorée(s).")
    return 0 if ok > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
