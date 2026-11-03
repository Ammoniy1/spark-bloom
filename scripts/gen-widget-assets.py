#!/usr/bin/env python3
"""Готовит картинки для нативных виджетов из assets/characters/*.png.

- Android: android/app/src/main/res/drawable-nodpi/char_{stage}_{emotion}.png (300×450)
  + таблица WidgetAssets.kt
- iOS:     ios/SparkBloomWidget/Assets.xcassets/char_{stage}_{emotion}.imageset
  + таблица WidgetAssets.swift

Запуск: python3 scripts/gen-widget-assets.py   (нужен Pillow: pip install pillow)
"""
import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "characters"
DRAW = ROOT / "android/app/src/main/res/drawable-nodpi"
KT = ROOT / "android/app/src/main/java/com/sparkbloom/app/widget/WidgetAssets.kt"
XCA = ROOT / "ios/SparkBloomWidget/Assets.xcassets"
SWIFT = ROOT / "ios/SparkBloomWidget/WidgetAssets.swift"
RE = re.compile(r"^(ember|spark|glow|blaze|nova)_(happy|sad|sleepy|energetic)\.png$")
SIZE = (300, 450)

names = sorted(p.stem for p in SRC.glob("*.png") if RE.match(p.name))
if not names:
    raise SystemExit("Нет картинок в assets/characters")

# Android
DRAW.mkdir(parents=True, exist_ok=True)
for old in DRAW.glob("char_*.png"):
    old.unlink()
for n in names:
    Image.open(SRC / f"{n}.png").convert("RGBA").resize(SIZE, Image.LANCZOS).save(
        DRAW / f"char_{n}.png", optimize=True)
KT.write_text(
    "package com.sparkbloom.app.widget\n\n"
    "import com.sparkbloom.app.R\n\n"
    "// Автогенерация: scripts/gen-widget-assets.py. Не править вручную.\n"
    "object WidgetAssets {\n"
    "    val character: Map<String, Int> = mapOf(\n"
    + "".join(f'        "{n}" to R.drawable.char_{n},\n' for n in names)
    + "    )\n}\n",
    encoding="utf-8",
)

# iOS
XCA.mkdir(parents=True, exist_ok=True)
(XCA / "Contents.json").write_text(json.dumps({"info": {"author": "xcode", "version": 1}}, indent=2))
for old in XCA.glob("char_*.imageset"):
    shutil.rmtree(old)
for n in names:
    d = XCA / f"char_{n}.imageset"
    d.mkdir()
    Image.open(SRC / f"{n}.png").convert("RGBA").resize(SIZE, Image.LANCZOS).save(
        d / f"char_{n}.png", optimize=True)
    (d / "Contents.json").write_text(json.dumps({
        "images": [{"filename": f"char_{n}.png", "idiom": "universal"}],
        "info": {"author": "xcode", "version": 1},
    }, indent=2))
SWIFT.write_text(
    "// Автогенерация: scripts/gen-widget-assets.py. Не править вручную.\n"
    "enum WidgetAssets {\n"
    "    static let character: Set<String> = [\n"
    + "".join(f'        "{n}",\n' for n in names)
    + "    ]\n}\n",
    encoding="utf-8",
)
print(f"виджеты: {len(names)} картинок")
