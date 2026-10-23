#!/usr/bin/env python3
"""Generate ModDeck PWA icons — yellow rounded square, dark 'MD' monogram."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/home/z/my-project/public/icons"
os.makedirs(OUT, exist_ok=True)

YELLOW = (255, 230, 0, 255)      # #ffe600 — ModDeck gold
DARK = (10, 11, 13, 255)         # #0a0b0d
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def draw_monogram(img, pad_ratio, radius_ratio):
    """Yellow rounded square + centered dark MD text."""
    w, h = img.size
    d = ImageDraw.Draw(img)
    # yellow rounded square, full bleed
    d.rounded_rectangle(
        [0, 0, w - 1, h - 1],
        radius=int(min(w, h) * radius_ratio),
        fill=YELLOW,
    )
    # MD monogram — dark, bold, tight
    size = int(h * 0.52)
    font = ImageFont.truetype(FONT, size)
    text = "MD"
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (w - tw) / 2 - bbox[0]
    y = (h - th) / 2 - bbox[1]
    d.text((x, y), text, font=font, fill=DARK)

def make(size, name, rounded=True, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if maskable:
        # full-bleed square (OS applies its own mask); content in safe zone
        d = ImageDraw.Draw(img)
        d.rectangle([0, 0, size - 1, size - 1], fill=YELLOW)
        f = ImageFont.truetype(FONT, int(size * 0.38))
        bbox = d.textbbox((0, 0), "MD", font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), "MD", font=f, fill=DARK)
    else:
        draw_monogram(img, 0, 0.22 if rounded else 0)
    img.save(f"{OUT}/{name}", "PNG", optimize=True)
    print(f"  {name}  {size}x{size}")

print("Generating ModDeck icons:")
make(512, "icon-512.png")
make(192, "icon-192.png")
make(512, "icon-maskable-512.png", maskable=True)
make(180, "apple-touch-icon.png")
print("done ->", OUT)
