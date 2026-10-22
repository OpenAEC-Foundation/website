#!/usr/bin/env python3
"""Verklein de acht OPS-PNG's met een palet; behoud hun pixelafmetingen (Pillow 13)."""
from pathlib import Path
from PIL import Image

folder = Path(__file__).resolve().parent.parent / 'shared/assets/screenshots'
names = ['hero', 'gantt', 'feat-critical-path', 'feat-file-import', 'feat-task-table',
         'feat-occupancy', 'feat-reports', 'feat-ifc']
for name in names:
    file = folder / f'open-planner-studio-{name}.png'
    with Image.open(file) as image:
        image.convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT,
                                      dither=Image.Dither.NONE).save(file, optimize=True)
    with Image.open(file) as image:
        print(f'{file.name}: {image.width} × {image.height}, {file.stat().st_size} bytes')
