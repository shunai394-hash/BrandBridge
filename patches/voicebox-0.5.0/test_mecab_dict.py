import os
import sys
import types
from pathlib import Path

from backend.mecab_dict import configure_mecab_dictionary, resolve_mecab_dicdir
from backend.utils.tts_language import resolve_tts_language, text_looks_japanese


def test_resolve_language_japanese_text_overrides_default_en():
    assert text_looks_japanese("ブランドブリッジ")
    assert resolve_tts_language("en", "en", "ブランドブリッジ") == "ja"
    assert resolve_tts_language(None, "ja", "hello") == "ja"
    assert resolve_tts_language("en", "en", "Hello from BrandBridge.") == "en"


def test_configure_redirects_empty_unidic(tmp_path, monkeypatch):
    lite = tmp_path / "unidic_lite" / "dicdir"
    lite.mkdir(parents=True)
    (lite / "mecabrc").write_text("dicdir: .\n", encoding="utf-8")
    empty = tmp_path / "unidic" / "dicdir"
    empty.mkdir(parents=True)

    lite_mod = types.ModuleType("unidic_lite")
    lite_mod.DICDIR = str(lite)
    uni_mod = types.ModuleType("unidic")
    uni_mod.DICDIR = str(empty)
    monkeypatch.setitem(sys.modules, "unidic_lite", lite_mod)
    monkeypatch.setitem(sys.modules, "unidic", uni_mod)
    monkeypatch.setattr(sys, "_MEIPASS", str(tmp_path), raising=False)

    dicdir = configure_mecab_dictionary()
    assert Path(dicdir, "mecabrc").is_file()
    assert Path(dicdir) == lite
    assert uni_mod.DICDIR == str(lite)
    assert os.environ.get("MECABRC", "").endswith("mecabrc")
    assert resolve_mecab_dicdir() == str(lite)
