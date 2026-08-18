#!/usr/bin/env node
/**
 * Clone MoneyPrinterTurbo (MIT) and install the local video-composition venv.
 * Reuses the system FFmpeg already used by BrandBridge. Does not install a
 * second FFmpeg, and does not require LLM / Pexels keys.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VENDOR = path.join(ROOT, "vendor");
const MPT = path.join(VENDOR, "MoneyPrinterTurbo");
const PY_DEPS = [
  "moviepy==2.2.1",
  "loguru==0.7.3",
  "numpy",
  "pillow",
  "pydantic",
  "requests",
  "pyyaml",
  "pydub",
  "packaging",
  "toml",
];

function run(bin, args, cwd = ROOT) {
  const result = spawnSync(bin, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`${bin} ${args.join(" ")} failed with exit ${result.status}`);
  }
}

function python311() {
  for (const candidate of [
    ["py", ["-3.11"]],
    ["python", []],
  ]) {
    const probe = spawnSync(candidate[0], [...candidate[1], "--version"], {
      encoding: "utf8",
      shell: false,
    });
    if (probe.status === 0 && /Python 3\.11/.test(String(probe.stdout || probe.stderr))) {
      return { bin: candidate[0], prefix: candidate[1] };
    }
  }
  throw new Error("Python 3.11 is required for MoneyPrinterTurbo.");
}

mkdirSync(VENDOR, { recursive: true });
if (!existsSync(path.join(MPT, "cli.py"))) {
  run("git", [
    "clone",
    "--depth",
    "1",
    "https://github.com/harry0703/MoneyPrinterTurbo.git",
    MPT,
  ]);
}

const py = python311();
const venvPython =
  process.platform === "win32"
    ? path.join(MPT, ".venv", "Scripts", "python.exe")
    : path.join(MPT, ".venv", "bin", "python");

if (!existsSync(venvPython)) {
  run(py.bin, [...py.prefix, "-m", "venv", path.join(MPT, ".venv")]);
}

run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], MPT);
run(venvPython, ["-m", "pip", "install", ...PY_DEPS], MPT);

const example = path.join(MPT, "config.example.toml");
const config = path.join(MPT, "config.toml");
if (existsSync(example) && !existsSync(config)) {
  copyFileSync(example, config);
}

try {
  execFileSync(venvPython, ["-c", "import moviepy, loguru, pydantic; print('mpt-ok')"], {
    cwd: MPT,
    stdio: "inherit",
  });
} catch {
  throw new Error("MoneyPrinterTurbo venv is installed but video dependencies failed to import.");
}

console.log("MoneyPrinterTurbo is ready at", MPT);
