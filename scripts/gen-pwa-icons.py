"""
One-shot generator for the PWA / Web Push icons under public/.

Outputs:
  public/icon-192.png    192x192 — VPinnacle brand on Altus red, safe-zone padded
  public/icon-512.png    512x512 — same, maskable-safe (inner 80% is the glyph)
  public/icon-badge.png   96x96  — Android notification badge (white on transparent)

Run:   python scripts/gen-pwa-icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

ALTUS_RED = (225, 29, 42, 255)        # #E11D2A
ALTUS_RED_DEEP = (180, 22, 33, 255)   # for inner ring + depth
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")


def find_serif_italic_font(size: int) -> ImageFont.FreeTypeFont:
    """Try a sequence of likely serif fonts; fall back to PIL default."""
    candidates = [
        ("C:/Windows/Fonts/timesi.ttf", "Times New Roman Italic"),
        ("C:/Windows/Fonts/georgiai.ttf", "Georgia Italic"),
        ("C:/Windows/Fonts/Cambria.ttc", "Cambria"),
        ("C:/Windows/Fonts/times.ttf", "Times New Roman"),
        ("C:/Windows/Fonts/georgia.ttf", "Georgia"),
    ]
    for path, _name in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _render_centered_vp(size: int, fill: tuple[int, int, int, int]) -> Image.Image:
    """Render 'VP' onto a transparent canvas with the *ink* box centered."""
    target_h = int(size * 0.58)
    font = find_serif_italic_font(target_h)

    # First pass: draw on an isolated transparent layer so getbbox() returns
    # the actual glyph ink box (and not the canvas edge or other chrome).
    probe = Image.new("RGBA", (size, size), TRANSPARENT)
    ImageDraw.Draw(probe).text(
        (size // 2, size // 2), "VP", font=font, fill=fill, anchor="mm"
    )
    ink = probe.getbbox()
    layer = Image.new("RGBA", (size, size), TRANSPARENT)
    if ink:
        ink_cx = (ink[0] + ink[2]) // 2
        ink_cy = (ink[1] + ink[3]) // 2
        dx = size // 2 - ink_cx
        dy = size // 2 - ink_cy
        ImageDraw.Draw(layer).text(
            (size // 2 + dx, size // 2 + dy),
            "VP",
            font=font,
            fill=fill,
            anchor="mm",
        )
    else:
        layer = probe
    return layer


def make_app_icon(size: int) -> Image.Image:
    """Altus-red square + darker inner ring + centered italic-serif VP."""
    img = Image.new("RGBA", (size, size), ALTUS_RED)
    draw = ImageDraw.Draw(img)
    # Soft inner ring for a sliver of depth.
    edge = max(1, size // 32)
    draw.rectangle([0, 0, size - 1, size - 1], outline=ALTUS_RED_DEEP, width=edge)
    # Composite the centered wordmark.
    img = Image.alpha_composite(img, _render_centered_vp(size, WHITE))
    return img


def make_badge(size: int = 96) -> Image.Image:
    """White VP on transparent — Android notification badge."""
    # Slightly larger glyph proportion since there's no chrome around it.
    target_h = int(size * 0.78)
    font = find_serif_italic_font(target_h)
    probe = Image.new("RGBA", (size, size), TRANSPARENT)
    ImageDraw.Draw(probe).text(
        (size // 2, size // 2), "VP", font=font, fill=WHITE, anchor="mm"
    )
    ink = probe.getbbox()
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    if ink:
        ink_cx = (ink[0] + ink[2]) // 2
        ink_cy = (ink[1] + ink[3]) // 2
        dx = size // 2 - ink_cx
        dy = size // 2 - ink_cy
        ImageDraw.Draw(img).text(
            (size // 2 + dx, size // 2 + dy),
            "VP",
            font=font,
            fill=WHITE,
            anchor="mm",
        )
    else:
        img = probe
    return img


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    icon_512 = make_app_icon(512)
    icon_512.save(os.path.join(OUT_DIR, "icon-512.png"), "PNG", optimize=True)

    icon_192 = make_app_icon(192)
    icon_192.save(os.path.join(OUT_DIR, "icon-192.png"), "PNG", optimize=True)

    badge = make_badge(96)
    badge.save(os.path.join(OUT_DIR, "icon-badge.png"), "PNG", optimize=True)

    print("Wrote public/icon-192.png, public/icon-512.png, public/icon-badge.png")


if __name__ == "__main__":
    main()
