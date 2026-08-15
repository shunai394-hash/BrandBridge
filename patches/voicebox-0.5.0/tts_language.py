"""Pick the language Voicebox should pass to TTS engines."""

from __future__ import annotations

import re

_JA_RE = re.compile(r"[\u3040-\u30ff\u4e00-\u9faf]")


def text_looks_japanese(text: str) -> bool:
    return bool(_JA_RE.search(text or ""))


def resolve_tts_language(
    requested: str | None,
    profile_language: str | None,
    text: str,
) -> str:
    """Prefer an explicit non-English request, then the profile, then script.

    POST /speak defaults language to English when omitted. Japanese text
    would then be synthesized as English and sound unintelligible. Treat
    ``en`` as a weak default when the profile or the text is Japanese.
    """
    if requested and requested not in ("en",):
        return requested
    if profile_language and profile_language not in ("en",):
        return profile_language
    if text_looks_japanese(text):
        return "ja"
    return requested or profile_language or "en"
