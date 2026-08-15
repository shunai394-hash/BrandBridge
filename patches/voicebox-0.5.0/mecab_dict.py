"""Resolve a usable MeCab dictionary for Kokoro Japanese G2P.

fugashi.Tagger() prefers ``unidic.DICDIR`` over ``unidic_lite.DICDIR``.
``misaki[ja]`` pulls in the full ``unidic`` package, which does **not**
ship dictionary data (it expects ``python -m unidic download``). Voicebox
bundles ``unidic_lite`` (see ``--collect-all unidic_lite``), so frozen
Windows builds have:

    <_MEIPASS>/unidic_lite/dicdir/mecabrc   # present
    <_MEIPASS>/unidic/dicdir/mecabrc        # missing → Failed initializing MeCab

This module finds a dicdir that actually contains mecabrc and, if the
empty ``unidic`` package is importable, points ``unidic.DICDIR`` at it so
fugashi's try_import_unidic() succeeds without a hardcoded path.
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

logger = logging.getLogger(__name__)


def _has_mecabrc(dicdir: str | os.PathLike[str] | None) -> bool:
    if not dicdir:
        return False
    return Path(dicdir, "mecabrc").is_file()


def _candidate_dicdirs() -> list[str]:
    dirs: list[str] = []
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        dirs.append(os.path.join(meipass, "unidic_lite", "dicdir"))
        dirs.append(os.path.join(meipass, "unidic", "dicdir"))
    try:
        import unidic_lite

        dirs.append(getattr(unidic_lite, "DICDIR", ""))
    except Exception:
        pass
    try:
        import unidic

        dirs.append(getattr(unidic, "DICDIR", ""))
    except Exception:
        pass
    seen: set[str] = set()
    unique: list[str] = []
    for item in dirs:
        if not item:
            continue
        key = os.path.normcase(os.path.abspath(item))
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return unique


def resolve_mecab_dicdir() -> str:
    """Return a dicdir that contains mecabrc, preferring unidic_lite."""
    for dicdir in _candidate_dicdirs():
        if _has_mecabrc(dicdir):
            return dicdir
    tried = ", ".join(_candidate_dicdirs()) or "(none)"
    raise FileNotFoundError(
        "MeCab dictionary mecabrc was not found. "
        f"Looked in: {tried}. Frozen builds must collect unidic_lite."
    )


def configure_mecab_dictionary() -> str:
    """Point fugashi/unidic at a real dictionary. Safe to call more than once."""
    dicdir = resolve_mecab_dicdir()
    mecabrc = os.path.join(dicdir, "mecabrc")
    os.environ.setdefault("MECABRC", mecabrc)

    try:
        import unidic

        if not _has_mecabrc(getattr(unidic, "DICDIR", None)):
            unidic.DICDIR = dicdir
            logger.info("Redirected unidic.DICDIR to %s", dicdir)
    except ImportError:
        pass

    logger.info("MeCab dictionary: %s", dicdir)
    return dicdir
