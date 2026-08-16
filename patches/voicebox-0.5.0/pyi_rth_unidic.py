"""
PyInstaller runtime hook: point fugashi at unidic_lite.

Must run before Kokoro/misaki import fugashi.Tagger(). Keep this file
self-contained — runtime hooks can execute before backend imports work.
"""

from __future__ import annotations

import os
import sys


def _configure() -> None:
    meipass = getattr(sys, "_MEIPASS", None)
    candidates = []
    if meipass:
        candidates.append(os.path.join(meipass, "unidic_lite", "dicdir"))
        candidates.append(os.path.join(meipass, "unidic", "dicdir"))
    try:
        import unidic_lite

        candidates.append(getattr(unidic_lite, "DICDIR", ""))
    except Exception:
        pass
    try:
        import unidic

        candidates.append(getattr(unidic, "DICDIR", ""))
    except Exception:
        unidic = None  # type: ignore
    else:
        unidic = sys.modules.get("unidic")

    dicdir = None
    for path in candidates:
        if path and os.path.isfile(os.path.join(path, "mecabrc")):
            dicdir = path
            break
    if not dicdir:
        return

    os.environ.setdefault("MECABRC", os.path.join(dicdir, "mecabrc"))
    if unidic is not None:
        current = getattr(unidic, "DICDIR", "")
        if not current or not os.path.isfile(os.path.join(current, "mecabrc")):
            unidic.DICDIR = dicdir


_configure()
