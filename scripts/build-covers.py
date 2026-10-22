#!/usr/bin/env python3
"""Build ModDeck game covers from official Steam art + user-uploaded banners.

For each game:
  portrait  -> public/games/<slug>.jpg        (Steam library_600x900_2x, logo baked in)
  wide      -> public/games/<slug>-wide.jpg   (user upload composed to 16:9, else Steam capsule_616x353)

The 5 games the owner uploaded banners for use THEIR art for wide contexts.
"""
import io
import json
import os
import shutil
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image, ImageEnhance, ImageFilter

BASE = "/home/z/my-project"
OUT = os.path.join(BASE, "public", "games", "v2")
UPLOADS = os.path.join(BASE, "upload")
TMP = os.path.join(BASE, "scripts", "tmp-covers")

# (slug, steam search term, uploaded banner file or None)
GAMES = [
    ("supermarket-together", "Supermarket Together", "Screenshot 2026-10-21 235840.png"),
    ("supermarket-simulator", "Supermarket Simulator", "Screenshot 2026-10-21 235829.png"),
    ("mall-simulator", "Mall Simulator", "Screenshot 2026-10-21 235917.png"),
    ("planet-crafter", "The Planet Crafter", "Screenshot 2026-10-21 235804.png"),
    ("gym-simulator-24", "Gym Simulator 24", "Screenshot 2026-10-21 235816.png"),
    ("satisfactory", "Satisfactory", None),
    ("poppy-playtime", "Poppy Playtime", None),
    ("tcg-card-shop-simulator", "TCG Card Shop Simulator", None),
    ("the-forest", "The Forest", None),
    ("7-days-to-die", "7 Days to Die", None),
    ("gta-v", "Grand Theft Auto V", None),
    ("cyberpunk-2077", "Cyberpunk 2077", None),
    ("elden-ring", "ELDEN RING", None),
    ("rdr2", "Red Dead Redemption 2", None),
    ("hogwarts-legacy", "Hogwarts Legacy", None),
    ("bg3", "Baldur's Gate 3", None),
    ("witcher-3", "The Witcher 3: Wild Hunt", None),
    ("starfield", "Starfield", None),
    ("fallout-4", "Fallout 4", None),
    ("spider-man", "Marvel's Spider-Man Remastered", None),
    ("diablo-iv", "Diablo IV", None),
    ("palworld", "Palworld", None),
]

HDRS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModDeckCoverBot/1.0"}

# storesearch can match DLC/Enhanced editions — pin the base game appids here
APPID_OVERRIDES = {
    "satisfactory": 526870,  # base game, not the "Core Values Expansion" DLC
    "gta-v": 271590,         # classic GTA V, "Enhanced" edition has no capsule asset
}


def fetch(url: str, timeout: int = 25) -> bytes | None:
    req = urllib.request.Request(url, headers=HDRS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except Exception as e:  # noqa: BLE001
        print(f"    ! fetch failed {url} -> {e}")
        return None


def is_jpeg(data: bytes | None) -> bool:
    return bool(data) and data[:2] == b"\xff\xd8" and len(data) > 8000


def find_appid(term: str) -> tuple[int | None, str]:
    q = urllib.parse.quote(term)
    url = f"https://store.steampowered.com/api/storesearch/?term={q}&cc=US&l=en"
    data = fetch(url)
    if not data:
        return None, ""
    try:
        js = json.loads(data.decode("utf-8", "replace"))
    except Exception:  # noqa: BLE001
        return None, ""
    for item in js.get("items", []):
        if item.get("type") == "app":
            return int(item["id"]), str(item.get("name", ""))
    return None, ""


def blur_fill_bg(banner: Image.Image, W: int, H: int, blur: int = 30, dark: float = 0.55) -> Image.Image:
    """Banner scaled to cover the canvas, center-cropped, blurred and darkened."""
    scale = max(W / banner.width, H / banner.height)
    im = banner.resize((round(banner.width * scale), round(banner.height * scale)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    im = im.crop((x, y, x + W, y + H)).filter(ImageFilter.GaussianBlur(blur))
    return ImageEnhance.Brightness(im).enhance(dark)


def compose_strip(banner: Image.Image, W: int, H: int) -> Image.Image:
    """Blurred fill background + the full banner art as a sharp centered strip."""
    canvas = blur_fill_bg(banner, W, H).convert("RGB")
    fg = banner.resize((W, round(banner.height * W / banner.width)), Image.LANCZOS)
    canvas.paste(fg.convert("RGB"), (0, (H - fg.height) // 2))
    return canvas


def save_jpg(im: Image.Image, path: str, quality: int = 85) -> None:
    im.convert("RGB").save(path, "JPEG", quality=quality, optimize=True)


def main() -> int:
    os.makedirs(TMP, exist_ok=True)
    report = []

    for slug, term, upload in GAMES:
        print(f"\n== {slug}")
        appid, name = find_appid(term)
        if slug in APPID_OVERRIDES:
            appid = APPID_OVERRIDES[slug]
            name = f"{name} (override)"
        print(f"    steam: {appid} ({name})")
        time.sleep(0.35)

        entry = {"slug": slug, "appid": appid, "match": name}

        # ---------- portrait cover ----------
        portrait_done = False
        if appid:
            lib = fetch(
                f"https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_600x900_2x.jpg"
            )
            if is_jpeg(lib):
                with open(os.path.join(OUT, f"{slug}.jpg"), "wb") as f:
                    f.write(lib)
                entry["portrait"] = "steam-library"
                portrait_done = True

        if not portrait_done:
            if upload:
                banner = Image.open(os.path.join(UPLOADS, upload)).convert("RGB")
                save_jpg(compose_strip(banner, 900, 1200), os.path.join(OUT, f"{slug}.jpg"))
                entry["portrait"] = "composed-from-upload"
                portrait_done = True
            elif appid:
                cap = fetch(
                    f"https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/capsule_616x353.jpg"
                )
                if is_jpeg(cap):
                    banner = Image.open(io.BytesIO(cap)).convert("RGB")
                    save_jpg(compose_strip(banner, 900, 1200), os.path.join(OUT, f"{slug}.jpg"))
                    entry["portrait"] = "composed-from-capsule"
                    portrait_done = True
        if not portrait_done:
            entry["portrait"] = "FAILED"

        # ---------- wide banner ----------
        wide_done = False
        if upload:
            banner = Image.open(os.path.join(UPLOADS, upload)).convert("RGB")
            save_jpg(compose_strip(banner, 1280, 720), os.path.join(OUT, f"{slug}-wide.jpg"))
            entry["wide"] = "composed-from-upload"
            wide_done = True
        elif appid:
            cap = fetch(
                f"https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/capsule_616x353.jpg"
            )
            if is_jpeg(cap):
                with open(os.path.join(OUT, f"{slug}-wide.jpg"), "wb") as f:
                    f.write(cap)
                entry["wide"] = "steam-capsule"
                wide_done = True
        if not wide_done:
            entry["wide"] = "FAILED"

        report.append(entry)

    shutil.rmtree(TMP, ignore_errors=True)
    shutil.rmtree(os.path.join(OUT, "raw"), ignore_errors=True)

    print("\n\n===== REPORT =====")
    fails = 0
    for e in report:
        ok = "FAILED" not in (e["portrait"], e["wide"])
        if not ok:
            fails += 1
        print(f"{e['slug']:<26} appid={str(e['appid']):<8} portrait={e['portrait']:<24} wide={e['wide']}")
    print(f"\n{len(report)} games, {fails} failures")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
