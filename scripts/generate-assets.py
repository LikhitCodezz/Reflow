"""Generate original REFLOW imagery locally (no external APIs).

Art direction: risograph / screenprint film-poster language from posters/ —
two-ink duotones, cut-paper silhouettes, halftone, film grain, architectural light.
All output is original and stored under public/images.
"""
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images")
for sub in ("editorial", "textures", "compositions", "scenes"):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)

RNG = np.random.default_rng(20261119)

INK = (20, 19, 18)
SOFT = (41, 38, 37)
PAPER = (240, 234, 223)
AGED = (227, 216, 199)
RED = (121, 29, 39)
VERM = (217, 71, 56)
PINK = (221, 166, 170)
PALE = (235, 207, 208)
BLUE = (117, 139, 165)
MUSTARD = (200, 162, 74)


def arr(im):
    return np.asarray(im.convert("RGB")).astype(np.float32)


def img(a):
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def gauss(a, r):
    if a.ndim == 2:
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(r))
        return np.asarray(im).astype(np.float32)
    return arr(img(a).filter(ImageFilter.GaussianBlur(r)))


def smooth_noise(w, h, res, rng=RNG):
    lw, lh = max(2, int(res)), max(2, int(res * h / w))
    low = rng.normal(0, 1, (lh, lw)).astype(np.float32)
    im = Image.fromarray(((low * 0.25 + 0.5) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return arr(im)[..., 0] / 255.0


def fractal(w, h, base=8, octaves=5, rng=RNG):
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        out += smooth_noise(w, h, base * (2 ** o), rng) * amp
        total += amp
        amp *= 0.55
    return out / total


def lg(w, h):
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    return x, y


def vignette(a, strength=0.55, power=1.6):
    h, w = a.shape[:2]
    x, y = lg(w, h)
    d = np.sqrt(((x - 0.5) * 2) ** 2 + ((y - 0.5) * 2) ** 2) / 1.4142
    v = 1 - strength * np.clip(d, 0, 1) ** power
    return a * v[..., None]


def duotone(a, dark, light, gamma=1.0, mid=None, mid_at=0.5):
    L = (a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114) / 255.0
    L = np.clip(L, 0, 1) ** gamma
    d = np.array(dark, np.float32)
    l = np.array(light, np.float32)
    if mid is not None:
        m = np.array(mid, np.float32)
        t = np.clip(L / mid_at, 0, 1)[..., None]
        lower = d[None, None, :] + (m - d)[None, None, :] * t
        t2 = np.clip((L - mid_at) / (1 - mid_at), 0, 1)[..., None]
        upper = m[None, None, :] + (l - m)[None, None, :] * t2
        return np.where((L < mid_at)[..., None], lower, upper)
    return d[None, None, :] + (l - d)[None, None, :] * L[..., None]


def grain(a, amount=6.0, chroma=0.0):
    h, w = a.shape[:2]
    n = RNG.normal(0, amount, (h, w, 1))
    if chroma:
        n = n + RNG.normal(0, chroma, (h, w, 3))
    return a + n


def halftone(a, spacing=4, strength=0.16, angle=45):
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = math.radians(angle)
    u = xx * math.cos(t) + yy * math.sin(t)
    v = -xx * math.sin(t) + yy * math.cos(t)
    dots = (np.sin(u * math.pi / spacing) * np.sin(v * math.pi / spacing))
    dots = (dots * 0.5 + 0.5) ** 1.5
    return a * (1 - strength + strength * dots[..., None])


def dust(a, count=140):
    h, w = a.shape[:2]
    im = img(a)
    d = ImageDraw.Draw(im, "RGBA")
    for _ in range(count):
        x, y = RNG.integers(0, w), RNG.integers(0, h)
        r = RNG.integers(0, 2)
        alpha = int(RNG.integers(8, 40))
        col = (240, 232, 216, alpha) if RNG.random() > 0.45 else (20, 18, 16, alpha)
        d.ellipse([x, y, x + r, y + r], fill=col)
    return arr(im)


def paper_field(w, h, base=PAPER, dark=AGED, fleck=0.55, rng=RNG):
    n = fractal(w, h, 6, 5, rng)
    a = np.array(base, np.float32)[None, None, :] + (n[..., None] - 0.5) * 26
    x, y = lg(w, h)
    a = a * (1 - 0.12 * y[..., None])
    im = img(a)
    d = ImageDraw.Draw(im, "RGBA")
    for _ in range(int(w * h / 9000 * fleck)):
        x0, y0 = rng.integers(0, w), rng.integers(0, h)
        s = rng.integers(0, 3)
        d.ellipse([x0, y0, x0 + s, y0 + s], fill=(70, 60, 48, int(rng.integers(4, 16))))
    return arr(im)


def finish(a, dark=INK, light=PAPER, gamma=1.0, g=5.0, v=0.5, ht=0.12, mid=None):
    a = vignette(a, v)
    a = duotone(a, dark, light, gamma, mid=mid, mid_at=0.46)
    a = halftone(a, 4.2, ht)
    a = dust(a)
    a = grain(a, g)
    return img(a).filter(ImageFilter.GaussianBlur(0.35))


# ---------------------------------------------------------------- drape / veil
def make_drape(path, w=1400, h=1750):
    x, y = lg(w, h)
    base = fractal(w, h, 5, 5)
    folds = (
        np.sin(x * 34 + np.sin(y * 7.4) * 2.2 + base * 2.4) * 0.42
        + np.sin(x * 15 - y * 3.2 + base * 3.4) * 0.3
        + np.sin(y * 26 + base * 6.0) * 0.16
        + np.sin(x * 61 + base * 9.0) * 0.12
    )
    shade = np.clip(0.5 + 0.5 * folds, 0, 1)
    # raking light across the cloth
    light = np.clip(1.28 - x * 0.95 - y * 0.12, 0.08, 1.2)
    lum = np.clip(0.14 + shade * light * 1.02, 0, 1)
    lum = lum + gauss(lum, 30) * 0.2
    # specular sheen on the crests
    spec = np.clip(shade - 0.62, 0, 1) ** 2 * 0.55
    a = np.stack([lum * 255] * 3, -1)
    a = a * (0.72 + 0.42 * (shade ** 2))[..., None]
    a = a + spec[..., None] * np.array((255, 196, 186), np.float32)
    out = finish(a, dark=(30, 6, 12), light=(246, 214, 208), gamma=0.95, g=7, v=0.7, ht=0.16, mid=(121, 29, 39))
    out.save(os.path.join(path, "drape-01.jpg"), quality=88)


# ---------------------------------------------------------------- doorway figure
def figure_mask(w, h, cx, scale=1.0):
    """Standing figure in a long coat — constructed silhouette, not a blob."""
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    s = scale
    hr = 0.027 * h * s          # head radius
    cy = 0.425 * h              # head centre
    sy = cy + hr * 2.5          # shoulder line
    wy = 0.60 * h               # waist
    cb = 0.755 * h              # coat hem
    gy = 0.875 * h              # ground

    def P(dx, y):
        return (cx + dx * hr, y)

    # hair mass
    d.ellipse([cx - hr * 1.28, cy - hr * 1.35, cx + hr * 1.22, cy + hr * 1.15], fill=255)
    d.ellipse([cx - hr * 1.1, cy - hr * 0.9, cx + hr * 1.4, cy + hr * 0.35], fill=255)
    # face
    d.ellipse([cx - hr * 0.86, cy - hr * 0.92, cx + hr * 0.86, cy + hr * 0.95], fill=255)
    # neck
    d.rectangle([cx - hr * 0.36, cy + hr * 0.7, cx + hr * 0.36, sy], fill=255)
    # torso / coat
    d.polygon([P(-1.05, sy), P(1.05, sy), P(2.35, sy + hr * 0.55), P(2.75, wy),
               P(2.25, cb), P(1.2, cb + hr * 0.2), P(-1.2, cb + hr * 0.2), P(-2.25, cb),
               P(-2.75, wy), P(-2.35, sy + hr * 0.55)], fill=255)
    # arms
    d.polygon([P(-2.3, sy + hr * 0.3), P(-3.15, sy + hr * 0.9), P(-3.35, wy + hr * 2.6),
               P(-2.55, wy + hr * 2.8), P(-2.15, wy), P(-1.85, sy + hr * 1.1)], fill=255)
    d.polygon([P(2.3, sy + hr * 0.3), P(3.15, sy + hr * 0.9), P(3.4, wy + hr * 2.4),
               P(2.6, wy + hr * 2.7), P(2.15, wy), P(1.85, sy + hr * 1.1)], fill=255)
    # coat slit (narrow, not through the body)
    d.polygon([P(-0.18, sy + hr * 0.9), P(0.18, sy + hr * 0.9), P(0.28, cb - hr * 0.8),
               P(-0.28, cb - hr * 0.8)], fill=0)
    # legs
    d.polygon([P(-1.15, cb), P(-0.15, cb), P(-0.3, gy), P(-1.05, gy)], fill=255)
    d.polygon([P(0.15, cb), P(1.15, cb), P(1.05, gy), P(0.3, gy)], fill=255)
    # shoes
    d.ellipse([cx - hr * 1.5, gy - hr * 0.28, cx - hr * 0.2, gy + hr * 0.42], fill=255)
    d.ellipse([cx + hr * 0.2, gy - hr * 0.28, cx + hr * 1.55, gy + hr * 0.42], fill=255)
    return m.filter(ImageFilter.GaussianBlur(1.2))


def make_doorway(path, w=1500, h=1900):
    x, y = lg(w, h)
    bac = paper_field(w, h, (176, 166, 150), (140, 130, 116), 0.9)
    # light wall falloff
    bac *= (0.55 + 0.65 * (1 - x) * (1 - y * 0.4))[..., None]
    # door aperture (bright haze)
    door = np.zeros((h, w), np.float32)
    door[:, int(w * 0.3):int(w * 0.72)] = 1
    door = gauss(door, 3)
    door *= (np.clip(1.05 - y * 0.55, 0.35, 1.05))[..., None][..., 0]
    glow = gauss(door * 255, 90) / 255
    a = bac + (door * 190 + glow * 120)[..., None]
    # floor + shadow pool
    floor = (y > 0.79).astype(np.float32)
    a = a * (1 - 0.35 * floor[..., None])
    # figure silhouette with rim light + cast shadow
    fm = figure_mask(w, h, int(w * 0.47), 1.0)
    m = np.asarray(fm).astype(np.float32) / 255
    shadow = np.asarray(fm.filter(ImageFilter.GaussianBlur(26))).astype(np.float32) / 255
    shadow = np.roll(shadow, int(h * 0.012), axis=0) * (np.clip((y - 0.72) * 6, 0, 1))
    a = a * (1 - shadow[..., None] * 0.55)
    m3 = m[..., None]
    rim = np.clip(gauss(m * 255, 6) / 255 - m, 0, 1)
    a = a * (1 - m3 * 0.96) + np.array((22, 19, 17), np.float32) * m3 * 0.96
    a = a + rim[..., None] * np.array((252, 229, 194), np.float32) * 0.85
    # light leak upper right
    leak = np.exp(-(((x - 0.92) ** 2) / 0.05 + ((y - 0.08) ** 2) / 0.1)) * 90
    a = a + leak[..., None] * np.array((1.0, 0.62, 0.42), np.float32)
    out = finish(a, dark=(24, 18, 15), light=(246, 231, 203), gamma=1.02, g=7, v=0.7, ht=0.18, mid=(146, 108, 78))
    out = out.filter(ImageFilter.GaussianBlur(0.6))
    out.save(os.path.join(path, "doorway-01.jpg"), quality=88)


# ---------------------------------------------------------------- arches
def make_arches(path, w=1900, h=1100):
    """Arcade interior: deep recesses, raking light, dust. Screenprint duotone."""
    x, y = lg(w, h)
    a = paper_field(w, h, (198, 186, 168), (150, 139, 124), 0.7)
    im = img(a)
    d = ImageDraw.Draw(im, "RGBA")
    openings = []
    for i, (ax, aw, top) in enumerate([(0.035, 0.255, 0.28), (0.355, 0.275, 0.30), (0.695, 0.255, 0.275)]):
        x0, x1 = int(w * ax), int(w * (ax + aw))
        ty = int(h * top)
        r = int((x1 - x0) / 2)
        # deep recess
        d.rectangle([x0, ty, x1, h], fill=(34, 31, 28, 255))
        d.ellipse([x0, ty - r, x1, ty + r], fill=(34, 31, 28, 255))
        # inner wall gradient band (light falls off into the arch)
        d.rectangle([x0 + 16, ty + 10, x1 - 16, h], fill=(52, 48, 43, 255))
        # reveal edge
        d.arc([x0, ty - r, x1, ty + r], 180, 360, fill=(206, 190, 166, 200), width=3)
        d.line([x0, ty, x0, h], fill=(206, 190, 166, 110), width=2)
        d.line([x1, ty, x1, h], fill=(206, 190, 166, 110), width=2)
        d.line([x0, ty, x0, h], fill=(12, 11, 10, 160), width=5)
        d.line([x1, ty, x1, h], fill=(12, 11, 10, 160), width=5)
        openings.append((x0, x1, ty, r))
    # horizontal cornice + floor
    d.line([0, int(h * 0.19), w, int(h * 0.19)], fill=(36, 33, 30, 210), width=4)
    d.line([0, int(h * 0.205), w, int(h * 0.205)], fill=(214, 198, 174, 90), width=2)
    d.line([0, int(h * 0.80), w, int(h * 0.80)], fill=(30, 27, 24, 150), width=2)
    a = arr(im)

    # raking beams through the arches (from upper left)
    beam = np.zeros((h, w), np.float32)
    for i, (bx, br, ty, r) in enumerate(openings):
        origin = bx + br
        band = np.exp(-((x - origin + (y - 0.22) * 0.62) ** 2) / (0.0028 + i * 0.0012))
        band *= np.clip((y - 0.18) * 3.0, 0, 1) * np.clip(1.05 - y, 0, 1)
        beam += band
    beam = gauss(beam, 26)
    a = a + beam[..., None] * np.array((255, 226, 178), np.float32) * 2.4
    a = a + gauss(beam, 90)[..., None] * np.array((226, 172, 118), np.float32) * 0.8

    # floor light pools
    pool = np.zeros((h, w), np.float32)
    for i, (bx, br, ty, r) in enumerate(openings):
        m = np.exp(-(((x - (bx + br) / w) ** 2) / 0.012 + ((y - 0.86) ** 2) / 0.0009))
        pool += m
    pool = gauss(pool, 30)
    a = a + pool[..., None] * np.array((250, 214, 166), np.float32) * 0.55
    a = dust(a, 320)
    out = finish(a, dark=(23, 20, 18), light=(242, 229, 206), gamma=1.02, g=6, v=0.62, ht=0.16, mid=(139, 116, 92))
    out.save(os.path.join(path, "arches-01.jpg"), quality=88)


# ---------------------------------------------------------------- rain window
def make_window(path, w=1400, h=1750):
    """Night window: rain on glass, a city dissolving into bokeh."""
    x, y = lg(w, h)
    a = np.array((13, 17, 23), np.float32)[None, None, :] * np.ones((h, w, 1), np.float32)
    a += (0.5 * (1 - y) ** 1.4)[..., None] * np.array((30, 42, 54), np.float32)
    im = img(a)
    d = ImageDraw.Draw(im, "RGBA")
    # blurred building masses with lit windows
    for bx in range(-1, 7):
        bw = w * RNG.uniform(0.1, 0.2)
        x0 = bx * w * 0.19 + RNG.uniform(-30, 20)
        top = h * RNG.uniform(0.16, 0.42)
        d.rectangle([x0, top, x0 + bw, h * 0.9], fill=(26, 33, 41, 255))
        for _ in range(int(RNG.integers(8, 26))):
            wx = x0 + RNG.uniform(6, max(8, bw - 18))
            wy = top + RNG.uniform(10, h * 0.8 - top)
            ww, wh = RNG.uniform(5, 15), RNG.uniform(4, 10)
            col = RNG.choice([[255, 198, 128], [255, 164, 112], [202, 214, 222]])
            d.rectangle([wx, wy, wx + ww, wy + wh], fill=(int(col[0]), int(col[1]), int(col[2]), int(RNG.integers(90, 220))))
    a = arr(im).astype(np.float32)
    a = gauss(a, 6)
    # bokeh discs
    bokeh = np.zeros((h, w), np.float32)
    for _ in range(26):
        bx, by = RNG.random() * w, RNG.random() * h * 0.78
        r = RNG.uniform(16, 52)
        rad = np.exp(-(((x * w - bx) ** 2 + (y * h - by) ** 2) / (r * r * 0.55)))
        bokeh += rad * RNG.uniform(0.3, 1.0)
    bokeh = gauss(bokeh, 26)
    a = a + bokeh[..., None] * np.array((252, 196, 142), np.float32) * 0.7
    # rain streaks: long, thin, brighter with a highlight head
    streak = np.zeros((h, w), np.float32)
    for _ in range(260):
        sx = RNG.random() * w
        sy = RNG.random() * h * 1.1
        ln = RNG.uniform(60, 340)
        yy = np.arange(max(0, int(sy - ln)), min(h, int(sy)))
        if len(yy) < 6:
            continue
        xx = (sx + np.sin((yy - sy) * 0.018) * 3).astype(int) % w
        fall = np.linspace(0, 1, len(yy)) ** 1.5
        np.add.at(streak, (yy, xx), fall * RNG.uniform(0.25, 0.9))
    streak = gauss(streak, 1.2)
    a = a + streak[..., None] * np.array((214, 228, 236), np.float32) * 1.15
    # condensation at the bottom of the pane
    cond = np.clip((y - 0.82) * 5, 0, 1) * (0.5 + 0.5 * fractal(w, h, 5, 4))
    a = a * (1 - cond[..., None] * 0.35) + cond[..., None] * np.array((78, 92, 104), np.float32) * 0.5
    out = finish(a, dark=(9, 13, 18), light=(206, 220, 228), gamma=1.06, g=8, v=0.7, ht=0.1, mid=(52, 72, 92))
    out.save(os.path.join(path, "window-01.jpg"), quality=87)


# ---------------------------------------------------------------- field figures
def make_field(path, w=1800, h=1200):
    x, y = lg(w, h)
    hills = (
        0.55 - 0.16 * np.sin(x * 3.0 + 1.2) - 0.06 * np.sin(x * 7.5)
        + 0.05 * np.sin(x * 13 + 0.4)
    )
    field = (y > hills).astype(np.float32)
    tex = fractal(w, h, 4, 6)
    a = np.array(PAPER, np.float32)[None, None, :] * np.ones((h, w, 1))
    a = a * (1 - field[..., None] * 0.72)
    a = a + field[..., None] * tex[..., None] * np.array((120, 40, 34), np.float32) * 0.55
    a = a + (1 - field[..., None]) * tex[..., None] * np.array((40, 34, 26), np.float32) * 0.22
    # sky wash + sun
    a += (np.exp(-(((x - 0.68) ** 2) / 0.02 + ((y - 0.2) ** 2) / 0.03)) * 60)[..., None] * np.array((1, 0.86, 0.66), np.float32)
    im = img(a)
    d = ImageDraw.Draw(im, "RGBA")
    # tree line silhouettes
    for tx in RNG.uniform(0.02, 0.98, 16):
        bx = tx * w
        by = (0.55 - 0.16 * math.sin(tx * 3.0 + 1.2)) * h
        th = RNG.uniform(40, 110)
        d.rectangle([bx - 2, by - th, bx + 3, by + 12], fill=(20, 16, 14, 255))
        for k in range(4):
            rr = RNG.uniform(12, 30)
            d.ellipse([bx - rr + RNG.uniform(-10, 10), by - th - rr * 1.4 + k * 12,
                       bx + rr + RNG.uniform(-10, 10), by - th + rr * 0.4 + k * 12],
                      fill=(20, 16, 14, 220))
    # two walking figures, cut-paper
    def fig(cx, cy, s, col):
        d.ellipse([cx - 7 * s, cy - 62 * s, cx + 7 * s, cy - 46 * s], fill=col)
        d.polygon([(cx - 12 * s, cy - 50 * s), (cx + 12 * s, cy - 50 * s), (cx + 17 * s, cy - 4 * s),
                   (cx - 17 * s, cy - 4 * s)], fill=col)
        d.polygon([(cx - 8 * s, cy - 16 * s), (cx - 1 * s, cy - 16 * s), (cx - 5 * s, cy + 12 * s), (cx - 13 * s, cy + 12 * s)], fill=col)
        d.polygon([(cx + 1 * s, cy - 16 * s), (cx + 8 * s, cy - 16 * s), (cx + 13 * s, cy + 12 * s), (cx + 5 * s, cy + 12 * s)], fill=col)
    fy = (0.55 - 0.16 * math.sin(0.5 * 3.0 + 1.2)) * h
    fig(w * 0.46, fy + 6, 1.05, (26, 18, 16, 255))
    fig(w * 0.5, fy + 4, 0.95, (26, 18, 16, 255))
    a = arr(im)
    out = finish(a, dark=(34, 12, 12), light=(242, 228, 205), gamma=1.02, g=7, v=0.62, ht=0.2, mid=VERM)
    out.save(os.path.join(path, "field-01.jpg"), quality=88)


# ---------------------------------------------------------------- textures
def make_paper_tex(path):
    a = paper_field(900, 900, PAPER, AGED, 1.6)
    im = img(a).filter(ImageFilter.GaussianBlur(0.2))
    im.save(os.path.join(path, "paper-01.jpg"), quality=90)

    # grain tile
    n = RNG.normal(0, 1, (400, 400))
    n = np.clip(128 + n * 38, 0, 255).astype(np.uint8)
    Image.fromarray(n, "L").save(os.path.join(path, "grain-01.png"))

    # halftone dots on transparent
    S = 420
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    step = 7
    for gy in range(0, S + step, step):
        for gx in range(0, S + step, step):
            ox = (gy // step % 2) * step / 2
            r = 1.5 + 1.1 * math.sin(gx * 0.05 + gy * 0.04)
            d.ellipse([gx + ox - r, gy - r, gx + ox + r, gy + r], fill=(20, 19, 18, 255))
    im.save(os.path.join(path, "halftone-01.png"))

    # ink wash / smear
    w = h = 900
    a = paper_field(w, h, (250, 246, 238), (220, 210, 196), 0.4)
    mask = (fractal(w, h, 3, 5) > 0.56).astype(np.float32)
    mask = gauss(mask * 255, 9) / 255
    a = a * (1 - mask[..., None] * 0.86)
    a = grain(a, 4)
    img(a).save(os.path.join(path, "ink-wash-01.jpg"), quality=88)


# ---------------------------------------------------------------- contact sheet
def sheet(files, out, cols=4, cw=420, ch=420, bg=(240, 234, 223)):
    rows = (len(files) + cols - 1) // cols
    sh = Image.new("RGB", (cols * cw, rows * ch), bg)
    d = ImageDraw.Draw(sh)
    for i, f in enumerate(files):
        im = Image.open(f).convert("RGB")
        im.thumbnail((cw - 40, ch - 60))
        x = (i % cols) * cw + (cw - im.width) // 2
        y = (i // cols) * ch + 24
        sh.paste(im, (x, y))
        d.text(((i % cols) * cw + 16, (i // cols) * ch + ch - 24), os.path.basename(f), fill=(23, 22, 21))
    sh.save(out, quality=85)


if __name__ == "__main__":
    ed = os.path.join(OUT, "editorial")
    tx = os.path.join(OUT, "textures")
    make_drape(ed)
    make_doorway(ed)
    make_arches(ed)
    make_window(ed)
    make_field(ed)
    make_paper_tex(tx)
    files = [os.path.join(ed, f) for f in sorted(os.listdir(ed))] + [os.path.join(tx, f) for f in sorted(os.listdir(tx))]
    os.makedirs(os.path.join(ROOT, "posters", "generated"), exist_ok=True)
    sheet(files, os.path.join(ROOT, "posters", "generated", "asset-sheet.jpg"))
    print("generated", len(files), "assets")
