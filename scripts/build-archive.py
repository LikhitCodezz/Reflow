"""Extract Pins.zip into posters/original with stable names + build contact sheets."""
import os, zipfile, shutil, io
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "posters", "original")
RAW = os.path.join(ROOT, "posters", ".raw")
os.makedirs(OUT, exist_ok=True)
os.makedirs(RAW, exist_ok=True)

with zipfile.ZipFile(os.path.join(ROOT, "Pins.zip")) as z:
    z.extractall(RAW)

# nested archive
for name in os.listdir(RAW):
    if name.lower().endswith(".zip"):
        with zipfile.ZipFile(os.path.join(RAW, name)) as z:
            z.extractall(os.path.join(RAW, "nested"))
        os.remove(os.path.join(RAW, name))

files = []
for base, _, names in os.walk(RAW):
    for n in names:
        if n.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            files.append(os.path.join(base, n))
files.sort(key=lambda p: os.path.basename(p).lower())

rows = []
for i, src in enumerate(files, 1):
    stem = f"poster-{i:03d}"
    ext = os.path.splitext(src)[1].lower()
    dst = os.path.join(OUT, stem + ext)
    shutil.copyfile(src, dst)
    with Image.open(dst) as im:
        w, h = im.size
        small = im.convert("RGB").resize((80, 80))
        q = small.quantize(colors=5)
        pal = q.getpalette() or []
        counts = sorted(q.getcolors() or [], reverse=True)[:4]
        cols = []
        for _, idx in counts:
            r, g, b = pal[idx * 3: idx * 3 + 3]
            cols.append("#%02X%02X%02X" % (r, g, b))
    rows.append((stem + ext, os.path.basename(src), w, h, " ".join(cols)))

shutil.rmtree(RAW, ignore_errors=True)

# contact sheets — 4 columns, labelled
PER_SHEET = 24
cols = 4
cell_w, cell_h = 340, 430
for sheet_i in range(0, len(rows), PER_SHEET):
    chunk = rows[sheet_i: sheet_i + PER_SHEET]
    nrows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, nrows * cell_h), (240, 234, 223))
    d = ImageDraw.Draw(sheet)
    for j, (fn, _orig, w, h, _cols) in enumerate(chunk):
        idx = sheet_i + j
        im = Image.open(os.path.join(OUT, fn)).convert("RGB")
        im.thumbnail((cell_w - 26, cell_h - 62))
        x = (j % cols) * cell_w + (cell_w - im.width) // 2
        y = (j // cols) * cell_h + 28
        sheet.paste(im, (x, y))
        d.text(((j % cols) * cell_w + 13, (j // cols) * cell_h + cell_h - 26), fn, fill=(23, 22, 21))
    no = sheet_i // PER_SHEET + 1
    sheet.save(os.path.join(ROOT, "posters", "reference-contact-sheet.jpg"), quality=82)
    if sheet_i == 0:
        shutil.copyfile(
            os.path.join(ROOT, "posters", "reference-contact-sheet.jpg"),
            os.path.join(ROOT, "posters", "reference-contact-sheet-1.jpg"),
        )
    else:
        sheet.save(os.path.join(ROOT, "posters", f"reference-contact-sheet-{no}.jpg"), quality=82)

with open(os.path.join(ROOT, "posters", ".index-raw.tsv"), "w", encoding="utf8") as f:
    f.write("file\tsource\tw\th\tcolors\n")
    for r in rows:
        f.write("\t".join(str(x) for x in r) + "\n")

print(f"{len(rows)} images -> posters/original")
