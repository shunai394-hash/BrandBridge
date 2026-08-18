#!/usr/bin/env python3
"""BrandBridge adapter for MoneyPrinterTurbo video composition.

Consumes BrandBridge PrVideoScript scenes[] (duration, camera, transition,
onScreenText, narrationText, stills and optional video clips). Uses MPT
generate_video for BGM + subtitles. Image motion and xfade cuts use the
system FFmpeg already on PATH.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import traceback
from pathlib import Path


def _print_result(payload: dict) -> None:
    print("MPT_RESULT " + json.dumps(payload, ensure_ascii=False), flush=True)


def _fail(code: str, message: str, extra: dict | None = None) -> int:
    payload = {"ok": False, "code": code, "error": message}
    if extra:
        payload.update(extra)
    _print_result(payload)
    return 1


def _load_input() -> dict:
    if "--job" in sys.argv:
        job_index = sys.argv.index("--job")
        if job_index + 1 >= len(sys.argv):
            raise ValueError("--job requires a file path")
        raw = Path(sys.argv[job_index + 1]).read_text(encoding="utf-8")
    else:
        raw = sys.stdin.read()
    if not raw.strip():
        raise ValueError("empty stdin; expected JSON job payload")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("job payload must be a JSON object")
    return data


def _ffmpeg_bin() -> str:
    configured = os.environ.get("IMAGEIO_FFMPEG_EXE", "").strip()
    if configured and Path(configured).is_file():
        return configured
    found = shutil.which("ffmpeg")
    if found:
        return found
    return "ffmpeg"


def _run_ffmpeg(args: list[str], timeout_seconds: int = 90) -> None:
    completed = subprocess.run(
        [_ffmpeg_bin(), *args],
        capture_output=True,
        timeout=timeout_seconds,
        check=False,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or b"").decode(
            "utf-8", errors="replace"
        )[-400:]
        raise RuntimeError(f"FFmpeg failed: {detail}")


def _camera_zoompan(kind: str, frames: int) -> str:
    n = max(frames, 1)
    ease = f"min(on/{n},1)"
    cameras = {
        "wide": ("1.04", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "medium": ("min(1.04+0.0012*on,1.14)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "close": ("min(1.12+0.0016*on,1.24)", "iw/2-(iw/zoom/2)", "(ih-ih/zoom)*0.28"),
        "zoom_in": ("min(1.02+0.0028*on,1.22)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "zoom_out": ("max(1.22-0.0028*on,1.03)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "pan_right": ("1.18", f"(iw-iw/zoom)*{ease}", "ih/2-(ih/zoom/2)"),
        "pan_left": ("1.18", f"(iw-iw/zoom)*(1-{ease})", "ih/2-(ih/zoom/2)"),
        "tilt_up": ("1.16", "iw/2-(iw/zoom/2)", f"(ih-ih/zoom)*(1-{ease})"),
        "tilt_down": ("1.16", "iw/2-(iw/zoom/2)", f"(ih-ih/zoom)*{ease}"),
        "dolly_in": (
            "min(1.06+0.0030*on,1.28)",
            "iw/2-(iw/zoom/2)",
            f"ih/2-(ih/zoom/2)+0.04*(ih-ih/zoom)*{ease}",
        ),
        "dolly_out": (
            "max(1.28-0.0030*on,1.06)",
            "iw/2-(iw/zoom/2)",
            "ih/2-(ih/zoom/2)",
        ),
        "tracking": ("1.16", f"(iw-iw/zoom)*{ease}", "ih/2-(ih/zoom/2)"),
        "orbit": (
            "1.18",
            f"iw/2-(iw/zoom/2)+0.16*(iw-iw/zoom)*sin(2*PI*on/{n})",
            f"ih/2-(ih/zoom/2)+0.08*(ih-ih/zoom)*cos(2*PI*on/{n})",
        ),
        "parallax": (
            "min(1.08+0.0030*on,1.32)",
            f"(iw-iw/zoom)*{ease}",
            "ih/2-(ih/zoom/2)",
        ),
        "focus_pull": ("min(1.10+0.0022*on,1.30)", "iw/2-(iw/zoom/2)", "(ih-ih/zoom)*0.32"),
        "over_shoulder": ("min(1.16+0.0014*on,1.26)", "(iw-iw/zoom)*0.22", "(ih-ih/zoom)*0.38"),
        "drift": (
            "1.14",
            f"iw/2-(iw/zoom/2)+0.05*(iw-iw/zoom)*sin(on/13)",
            f"ih/2-(ih/zoom/2)+0.04*(ih-ih/zoom)*cos(on/17)",
        ),
    }
    z, x, y = cameras.get(kind, cameras["zoom_in"])
    return f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1080x1920:fps=30"


def _transition_filter(name: str) -> tuple[str, float]:
    mapping = {
        "cut": ("fade", 0.04),
        "fade": ("fade", 0.45),
        "dissolve": ("dissolve", 0.45),
        "slide_left": ("slideleft", 0.45),
        "slide_right": ("slideright", 0.45),
        "wipe": ("wipeleft", 0.45),
        "zoom": ("slideleft", 0.40),
        "motion_blur": ("fade", 0.28),
        "match_cut": ("fade", 0.04),
        "continue": ("dissolve", 0.35),
    }
    return mapping.get(name, ("fade", 0.35))


def _render_image_clip(source: Path, dest: Path, duration: float, camera: str) -> None:
    frames = max(int(round(duration * 30)), 30)
    vf = ",".join(
        [
            "scale=1080:1920:force_original_aspect_ratio=increase",
            "crop=1080:1920",
            _camera_zoompan(camera, frames),
            "fps=30",
            "format=yuv420p",
        ]
    )
    _run_ffmpeg(
        [
            "-y",
            "-loop",
            "1",
            "-framerate",
            "30",
            "-i",
            str(source),
            "-vf",
            vf,
            "-t",
            f"{duration:.3f}",
            "-r",
            "30",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "26",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(dest),
        ],
        timeout_seconds=120,
    )


def _render_video_clip(source: Path, dest: Path, duration: float) -> None:
    vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p"
    _run_ffmpeg(
        [
            "-y",
            "-stream_loop",
            "-1",
            "-i",
            str(source),
            "-vf",
            vf,
            "-t",
            f"{duration:.3f}",
            "-an",
            "-r",
            "30",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "26",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(dest),
        ],
        timeout_seconds=120,
    )


def _concat_with_transitions(
    clips: list[Path],
    durations: list[float],
    transitions: list[str],
    dest: Path,
) -> None:
    if len(clips) == 1:
        shutil.copyfile(clips[0], dest)
        return

    inputs: list[str] = []
    for clip in clips:
        inputs.extend(["-i", str(clip)])

    filters: list[str] = []
    current = "[0:v:0]"
    cumulative = durations[0]
    for index in range(1, len(clips)):
        xfade, fade = _transition_filter(transitions[index] if index < len(transitions) else "fade")
        fade = min(fade, max(durations[index] * 0.35, 0.04), max(durations[index - 1] * 0.35, 0.04))
        label = f"[v{index}]"
        offset = max(0.0, cumulative - fade)
        filters.append(
            f"{current}[{index}:v:0]xfade=transition={xfade}:duration={fade:.3f}:offset={offset:.3f}{label}"
        )
        current = label
        cumulative = cumulative + durations[index] - fade

    try:
        _run_ffmpeg(
            [
                "-y",
                *inputs,
                "-filter_complex",
                ";".join(filters),
                "-map",
                current,
                "-an",
                "-r",
                "30",
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "26",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                str(dest),
            ],
            timeout_seconds=180,
        )
    except RuntimeError:
        list_file = dest.with_suffix(".concat.txt")
        list_file.write_text(
            "\n".join(f"file '{clip.as_posix()}'" for clip in clips) + "\n",
            encoding="utf-8",
        )
        _run_ffmpeg(
            [
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-an",
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "26",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                str(dest),
            ],
            timeout_seconds=180,
        )


def main() -> int:
    try:
        job = _load_input()
    except Exception as exc:
        return _fail("INVALID_INPUT", str(exc))

    mpt_root = Path(str(job.get("mptRoot") or "")).expanduser()
    if not mpt_root.is_dir():
        return _fail("MPT_UNAVAILABLE", f"MoneyPrinterTurbo root not found: {mpt_root}")

    ffmpeg_path = str(job.get("ffmpegPath") or "").strip()
    if ffmpeg_path:
        os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_path

    os.chdir(mpt_root)
    sys.path.insert(0, str(mpt_root))

    example = mpt_root / "config.example.toml"
    config_path = mpt_root / "config.toml"
    if not config_path.is_file():
        if not example.is_file():
            return _fail("MPT_UNAVAILABLE", "config.example.toml is missing")
        shutil.copyfile(example, config_path)

    try:
        from app.models.schema import VideoAspect, VideoParams
        from app.services import video
    except Exception as exc:
        return _fail(
            "MPT_UNAVAILABLE",
            f"MoneyPrinterTurbo video module could not be imported: {exc}",
        )

    scenes = job.get("scenes") or []
    if not isinstance(scenes, list) or not scenes:
        return _fail("MISSING_IMAGE", "No scene jobs were provided")

    audio_path = Path(str(job.get("audioPath") or ""))
    if not audio_path.is_file():
        return _fail("RENDER_FAILURE", f"Audio file not found: {audio_path}")

    out_file = Path(str(job.get("outFile") or ""))
    if not out_file.parent.exists():
        return _fail("RENDER_FAILURE", f"Output directory not found: {out_file.parent}")

    work_dir = Path(str(job.get("workDir") or out_file.parent))
    work_dir.mkdir(parents=True, exist_ok=True)

    subtitle_path = str(job.get("subtitlePath") or "").strip()
    bgm_path = str(job.get("bgmPath") or "").strip()
    bgm_enabled = bool(job.get("bgmEnabled", True)) and bool(bgm_path)
    subtitles_enabled = bool(job.get("subtitlesEnabled", True)) and bool(subtitle_path)
    product_name = str(job.get("productName") or "BrandBridge product")
    video_script = str(job.get("videoScript") or product_name)
    font_name = str(job.get("fontName") or "MicrosoftYaHeiBold.ttc")

    try:
        scene_clips: list[Path] = []
        durations: list[float] = []
        transitions: list[str] = []
        video_count = 0
        image_count = 0

        for index, scene in enumerate(scenes):
            if not isinstance(scene, dict):
                continue
            source = Path(str(scene.get("materialPath") or ""))
            if not source.is_file():
                continue
            duration = max(float(scene.get("durationSeconds") or 5), 1.2)
            material_type = str(scene.get("materialType") or "image").lower()
            camera = str(scene.get("camera") or "zoom_in")
            dest = work_dir / f"mpt-scene-{index}.mp4"
            if material_type == "video":
                try:
                    _render_video_clip(source, dest, duration)
                    video_count += 1
                except Exception:
                    _render_image_clip(source, dest, duration, camera)
                    image_count += 1
            else:
                _render_image_clip(source, dest, duration, camera)
                image_count += 1
            scene_clips.append(dest)
            durations.append(duration)
            transitions.append(str(scene.get("transition") or "fade"))

        if not scene_clips:
            return _fail("MISSING_IMAGE", "No valid scene materials were found")

        combined_path = work_dir / "mpt-combined.mp4"
        _concat_with_transitions(scene_clips, durations, transitions, combined_path)

        params = VideoParams(
            video_subject=product_name,
            video_script=video_script,
            video_aspect=VideoAspect.portrait.value,
            video_source="local",
            custom_audio_file=str(audio_path),
            voice_name="no-voice",
            voice_volume=1.0,
            bgm_type="custom" if bgm_enabled else "",
            bgm_file="",
            bgm_volume=0.18 if bgm_enabled else 0.0,
            subtitle_enabled=subtitles_enabled,
            subtitle_position="bottom",
            font_name=font_name,
            font_size=52,
            text_fore_color="#FFFFFF",
            text_background_color=True,
            rounded_subtitle_background=True,
            stroke_color="#000000",
            stroke_width=1.5,
            n_threads=2,
        )

        video.generate_video(
            video_path=str(combined_path),
            audio_path=str(audio_path),
            subtitle_path=subtitle_path if subtitles_enabled else "",
            output_file=str(out_file),
            params=params,
            bgm_file_override=bgm_path if bgm_enabled else "",
        )

        if not out_file.is_file() or out_file.stat().st_size < 1024:
            return _fail("RENDER_FAILURE", "MoneyPrinterTurbo did not write a complete MP4")

        _print_result(
            {
                "ok": True,
                "output": str(out_file),
                "width": 1080,
                "height": 1920,
                "materials": len(scene_clips),
                "imageScenes": image_count,
                "videoScenes": video_count,
                "bgm": bgm_enabled,
                "subtitles": subtitles_enabled,
            }
        )
        return 0
    except subprocess.TimeoutExpired:
        return _fail("AI_TIMEOUT", "MoneyPrinterTurbo FFmpeg step timed out")
    except Exception as exc:
        return _fail(
            "RENDER_FAILURE",
            str(exc),
            extra={"trace": traceback.format_exc()[-1200:]},
        )


if __name__ == "__main__":
    raise SystemExit(main())
