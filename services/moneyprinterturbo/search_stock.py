#!/usr/bin/env python3
"""Search and download stock footage through MoneyPrinterTurbo material.py.

Uses MPT's Pexels / Pixabay / Coverr search + save_video. API keys come from
environment variables, never from source. Empty results are not fatal.
"""

from __future__ import annotations

import json
import os
import sys
import traceback
from pathlib import Path


def _print_result(payload: dict) -> None:
    print("MPT_STOCK " + json.dumps(payload, ensure_ascii=False), flush=True)


def _fail(code: str, message: str, extra: dict | None = None) -> int:
    payload = {"ok": False, "code": code, "error": message, "videos": []}
    if extra:
        payload.update(extra)
    _print_result(payload)
    return 1


def _load_job() -> dict:
    if "--job" not in sys.argv:
        raise ValueError("--job is required")
    job_index = sys.argv.index("--job")
    raw = Path(sys.argv[job_index + 1]).read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("job payload must be an object")
    return data


def _inject_keys() -> tuple[str, ...]:
    sources = []
    pexels = os.environ.get("PEXELS_API_KEY", "").strip()
    pixabay = os.environ.get("PIXABAY_API_KEY", "").strip()
    coverr = os.environ.get("COVERR_API_KEY", "").strip()
    from app.config import config

    if pexels:
        config.app["pexels_api_keys"] = [pexels]
        sources.append("pexels")
    if pixabay:
        config.app["pixabay_api_keys"] = [pixabay]
        sources.append("pixabay")
    if coverr:
        config.app["coverr_api_keys"] = [coverr]
        sources.append("coverr")
    return tuple(sources)


def _pick_file(item) -> str:
    url = getattr(item, "url", "") or ""
    return str(url)


def _search_one(material, source: str, term: str, aspect):
    if source == "pixabay":
        return material.search_videos_pixabay(term, minimum_duration=3, video_aspect=aspect)
    if source == "coverr":
        return material.search_videos_coverr(term, minimum_duration=3, video_aspect=aspect)
    return material.search_videos_pexels(term, minimum_duration=3, video_aspect=aspect)


def main() -> int:
    try:
        job = _load_job()
    except Exception as exc:
        return _fail("INVALID_AI_RESPONSE", str(exc))

    mpt_root = Path(str(job.get("mptRoot") or "")).resolve()
    work_dir = Path(str(job.get("workDir") or "")).resolve()
    work_dir.mkdir(parents=True, exist_ok=True)

    if not (mpt_root / "app" / "services" / "material.py").is_file():
        return _fail("MPT_UNAVAILABLE", "MoneyPrinterTurbo material.py is missing")

    sys.path.insert(0, str(mpt_root))
    os.chdir(mpt_root)

    try:
        sources = _inject_keys()
        if not sources:
            _print_result(
                {
                    "ok": True,
                    "videos": [],
                    "reason": "no_stock_api_keys",
                }
            )
            return 0

        from app.models.schema import VideoAspect
        from app.services import material

        terms_per_scene = job.get("searchTermsPerScene")
        if not isinstance(terms_per_scene, list) or not terms_per_scene:
            terms = job.get("searchTerms") or []
            terms_per_scene = [[str(term)] for term in terms]

        videos = []
        used_urls: set[str] = set()

        for index, raw_terms in enumerate(terms_per_scene):
            terms = [str(term).strip() for term in (raw_terms or []) if str(term).strip()]
            if not terms:
                terms = ["modern office"]
            saved = None
            for source in sources:
                for term in terms:
                    items = []
                    for aspect in (VideoAspect.portrait, VideoAspect.landscape):
                        try:
                            items = _search_one(material, source, term, aspect)
                        except Exception:
                            items = []
                        if items:
                            break
                    for item in items or []:
                        url = _pick_file(item)
                        if not url or url in used_urls:
                            continue
                        dest_dir = str(work_dir / "mpt-cache")
                        path = material.save_video(url, save_dir=dest_dir)
                        if not path:
                            continue
                        used_urls.add(url)
                        saved = {
                            "path": path,
                            "provider": source,
                            "searchTerm": term,
                            "sourceUrl": url.split("?")[0],
                            "sceneIndex": index,
                        }
                        break
                    if saved:
                        break
                if saved:
                    break
            if saved:
                videos.append(saved)

        _print_result(
            {
                "ok": True,
                "videos": videos,
                "count": len(videos),
                "sources": list(sources),
            }
        )
        return 0
    except Exception as exc:
        return _fail(
            "RENDER_FAILURE",
            str(exc),
            extra={"trace": traceback.format_exc()[-800:]},
        )


if __name__ == "__main__":
    raise SystemExit(main())
