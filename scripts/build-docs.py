"""Build the REFLOW reference archive documentation from the extracted pins."""
import os, csv, shutil
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTERS = os.path.join(ROOT, "posters")
ORIG = os.path.join(POSTERS, "original")
SEL = os.path.join(POSTERS, "selected")
os.makedirs(SEL, exist_ok=True)

rows = []
with open(os.path.join(POSTERS, ".index-raw.tsv"), encoding="utf8") as f:
    for r in csv.DictReader(f, delimiter="\t"):
        rows.append(r)

# ------------------------------------------------------------------ categories
RANGES = [
    ((1, 2), "Underground music"),
    ((3, 4), "Independent film"),
    ((5, 8), "Experimental typography"),
    ((9, 12), "Graphic composition"),
    ((13, 14), "Photography"),
    ((15, 16), "Editorial layout"),
    ((17, 20), "Independent film"),
    ((21, 22), "Underground music"),
    ((23, 24), "Collage"),
    ((25, 28), "Independent film"),
    ((29, 30), "Underground music"),
    ((31, 32), "Graphic composition"),
    ((33, 36), "Collage"),
    ((37, 40), "Independent film"),
    ((41, 44), "Independent film"),
    ((45, 48), "Underground music"),
    ((49, 52), "Independent film"),
    ((53, 56), "Independent film"),
    ((57, 64), "Photography"),
    ((65, 70), "Independent film"),
    ((71, 72), "Experimental typography"),
    ((73, 76), "Colour & texture"),
    ((77, 80), "Independent film"),
    ((81, 82), "Collage"),
    ((83, 88), "Editorial layout"),
    ((89, 90), "Collage"),
    ((91, 94), "Colour & texture"),
    ((95, 100), "Colour & texture"),
    ((101, 104), "Colour & texture"),
    ((105, 110), "Photography"),
    ((111, 112), "Collage"),
    ((113, 118), "Photography"),
    ((119, 120), "Collage"),
    ((121, 126), "Colour & texture"),
    ((127, 128), "Experimental typography"),
    ((129, 130), "Photography"),
]


def category(n):
    for (a, b), name in RANGES:
        if a <= n <= b:
            return name
    return "Graphic composition"


# ------------------------------------------------------------------ selection
# (index, new name, category, typography, composition, device, use)
SELECTED = [
    (1, "sel-01-halftone-eye.jpg", "Experimental typography",
     "Bilingual display lock-up: bold condensed Latin over Devanagari, small grotesque credits",
     "Two horizontal bands: dense black type above, photographic eye strip below",
     "Coarse halftone, pink flood block, white keyline type",
     "Source for plate 03's halftone cutout language and its bilingual density"),
    (3, "sel-02-blue-film-still.jpg", "Independent film",
     "Serif italic star billing against tiny grotesque credits",
     "Full-bleed still with a low title cluster; faces occupy the upper two thirds",
     "Muted blue duotone, film grain, soft highlight bloom",
     "Model for plate 02's full-bleed reveal and its colour temperature"),
    (7, "sel-03-floral-portrait.jpg", "Graphic composition",
     "Hand-painted ornate display over illustrated portrait",
     "Symmetrical frame; figure centred inside a botanical border",
     "Flat colour blocks, decorative line work, cream ground",
     "Reference for plate 06's layered printed objects"),
    (11, "sel-04-lust-red.jpg", "Experimental typography",
     "Lowercase heavy serif cropped at the frame edge; mono credit at foot",
     "Extreme close crop of a face, type overprint, barcode bottom right",
     "Red/black duotone, overprint, registration drift",
     "Direct cue for plate 06's crop, barcode and red/ink contrast"),
    (15, "sel-05-newsprint-magic.jpg", "Editorial layout",
     "Bodoni-style display italic embedded in justified newsprint columns",
     "Single sheet, centred display line interrupting a two-column grid",
     "Photocopy texture, warm grey paper, uneven ink",
     "Reference for plate 04's type-only composition and paper texture"),
    (19, "sel-06-cigarettes-paper-red.jpg", "Independent film",
     "Wide serif title over a red bleed; tiny condensed credits",
     "Horizon split: paper title field above, photographic red below",
     "Two-ink screenprint, torn paper edge, soft grain",
     "Palette and overprint cue for plates 01 and 08"),
    (21, "sel-07-tame-impala-blocks.jpg", "Underground music",
     "Condensed caps fragmented around a colour-block grid",
     "Modular grid of image and colour panels with type threading between",
     "Hard-edged blocks, fluorescent accents, black ground",
     "Grid logic behind plate 06's collage sheet"),
    (29, "sel-08-radiohead-red.jpg", "Underground music",
     "Condensed Latin display plus vertical Japanese type, barcode",
     "Portrait left, vertical type right, dense credit column at the foot",
     "Red monochrome photograph, black keylines, halftone",
     "Reference for vertical type and plate 08's closing column"),
    (37, "sel-09-dead-poets-cream.jpg", "Independent film",
     "Gold serif title against a serif/mono credit block",
     "Cream field, centred illustration, dense footnotes",
     "Flat cream paper, small caps, low-contrast inks",
     "Cue for plate 01's credit strip and quiet negative space"),
    (55, "sel-10-eye-pink.jpg", "Colour & texture",
     "Tiny brutalist mono inside a pink field",
     "Symmetrical eye crop framed by hands and heart marks",
     "Pink flood, coarse halftone, white keyline",
     "Palette reference for plate 03 and its halftone treatment"),
    (59, "sel-11-street-flowers.jpg", "Photography",
     "No display type; small documentary caption",
     "Wide street scene, subject right of centre, flowers as colour event",
     "Muted film colour, deep magenta accents, rain sheen",
     "Guidance for photographic restraint and colour accents"),
    (65, "sel-12-see-you-in-hell.jpg", "Independent film",
     "Serif small caps over a red halo portrait; mono marginalia",
     "Centred figure with text ringed around the head",
     "Black field, red glow, distressed ink edges",
     "Cue for plate 08's ending and its red/ink contrast"),
    (71, "sel-13-absence-yellow.jpg", "Experimental typography",
     "Full-width condensed caps over a mustard field; tiny mono captions",
     "Four unequal image panels stacked in a rough grid",
     "Mustard flood, high-contrast black halftone, rule lines",
     "Reference for plate 06's mustard accent and panel rhythm"),
    (81, "sel-14-icarus.jpg", "Collage",
     "Classical display serif collaged with engraved illustration",
     "Falling figure centred against a cloud field, type above and below",
     "Cut-out collage, engraving texture, blue/ochre palette",
     "Layering model for plate 06"),
    (89, "sel-15-dense-collage.jpg", "Collage",
     "Many type sizes: display, newsprint, mono, manuscript",
     "Dense magazine collage with an eye crop anchoring the centre",
     "Overprint, torn edges, photocopy contrast",
     "Density reference for plate 05's strips and plate 06's layering"),
    (97, "sel-16-moon-dancers.jpg", "Colour & texture",
     "No display type; the silhouette carries the image",
     "Cut-paper dancers inside a full moon disc, night field",
     "Flat paper cut-out, warm moon, deep blue ground",
     "Silhouette language for plate 03's figure"),
    (111, "sel-17-pinkfloyd-collage.jpg", "Collage",
     "Mono labels under a grid of cropped faces",
     "Four-panel portrait grid, asymmetric crop sizes, black ground",
     "Red/blue duotone, halftone, grid rules",
     "Cue for plate 06's image panel arrangement"),
    (127, "sel-18-skeleton-redaction.jpg", "Experimental typography",
     "Wide serif caps interrupted by solid redaction bars",
     "X-ray skeleton centred, type laid over the body",
     "Black field, white x-ray, vermilion bars",
     "Reference for plate 04's bars and plate 06's redaction marks"),
]

for idx, name, *_ in SELECTED:
    src = os.path.join(ORIG, f"poster-{idx:03d}.jpg")
    if os.path.exists(src):
        shutil.copyfile(src, os.path.join(SEL, name))

sel_files = [os.path.join(SEL, n) for _, n, *_ in SELECTED if os.path.exists(os.path.join(SEL, n))]
cols, cw, ch = 5, 300, 380
sheet = Image.new("RGB", (cols * cw, ((len(sel_files) + cols - 1) // cols) * ch), (240, 234, 223))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(sel_files):
    im = Image.open(f).convert("RGB")
    im.thumbnail((cw - 24, ch - 50))
    x = (i % cols) * cw + (cw - im.width) // 2
    y = (i // cols) * ch + 20
    sheet.paste(im, (x, y))
    d.text(((i % cols) * cw + 12, (i // cols) * ch + ch - 24), os.path.basename(f)[:34], fill=(23, 22, 21))
sheet.save(os.path.join(POSTERS, "selected-contact-sheet.jpg"), quality=84)

# ------------------------------------------------------------------ index md
by_cat = {}
for r in rows:
    n = int(r["file"].split("-")[1].split(".")[0])
    by_cat.setdefault(category(n), []).append(r["file"])

lines = []
lines.append("# REFLOW — Reference index\n")
lines.append(
    "The archive contains **130 images** extracted from `Pins.zip` (the zip included a nested archive). "
    "Every pin appears twice, as downloaded; `original/` keeps both so the collection is complete, "
    "while `selected/` holds 18 de-duplicated references used as the working art direction.\n"
)
lines.append("Contact sheets: `reference-contact-sheet-1.jpg` … `reference-contact-sheet-6.jpg` "
             "and `selected-contact-sheet.jpg`.\n")
lines.append("> These images are reference material, not production assets. Nothing is shipped in the site's "
             "image folders; all site imagery is originally generated (see `public/images` and "
             "`posters/generated/asset-sheet.jpg`).\n")

lines.append("## Categories\n")
lines.append("| Category | Count | Files |\n|---|---|---|")
for cat, files in sorted(by_cat.items()):
    shown = ", ".join(f"`{f}`" for f in files[:8])
    more = f" … (+{len(files) - 8})" if len(files) > 8 else ""
    lines.append(f"| {cat} | {len(files)} | {shown}{more} |")

lines.append("\n## Selected references — what was taken\n")
lines.append("| Ref | Category | Typography | Composition | Device | Use in REFLOW |\n|---|---|---|---|---|---|")
for idx, name, cat, typo, comp, dev, use in SELECTED:
    lines.append(f"| `{name}` | {cat} | {typo} | {comp} | {dev} | {use} |")

lines.append("\n## Full inventory\n")
lines.append("Colours are the four dominant quantised tones per image. Category is assigned by visual grouping "
             "of the board; many images belong to more than one category.\n")
lines.append("| File | Source pin | Size | Dominant colours | Category |\n|---|---|---|---|---|")
for r in rows:
    n = int(r["file"].split("-")[1].split(".")[0])
    src = r["source"].replace("Klickpin.com- ", "").replace("From ", "")
    cols_txt = " ".join(f"`{c}`" for c in r["colors"].split()[:4])
    lines.append(f"| `{r['file']}` | {src} | {r['w']}×{r['h']} | {cols_txt} | {category(n)} |")

with open(os.path.join(POSTERS, "reference-index.md"), "w", encoding="utf8") as f:
    f.write("\n".join(lines) + "\n")

# ------------------------------------------------------------------ direction md
direction = """# REFLOW — Visual direction

## 1. What the references taught

| Reference | Study | Extracted principle |
|---|---|---|
| **ATOM** | Computational typography and geometry | Type and geometry are the experiment itself. Controls should expose a real engine, not a preset gallery. Text must visibly negotiate with a form. |
| **FABLE 25** | Experimental creative direction | A site can be an individual work with no conventional page furniture. Strong identity comes from a fixed set of typographic rules applied with conviction. |
| **A DRIFT** | Kinetic typography and scroll movement | Letters can be the entire moving image. Scroll is a timeline; each stage is a composition, not a decoration. |
| **Codrops — expanding image** | Image and type interaction | A letterform can be a viewport. An image can live inside a word and then escape it. |
| **Codrops — SVG clip-path** | Masks and typographic transformations | Actual slicing and masking beats fades. Type should be cut, revealed, and re-set. |
| **MINTD** | Editorial identity and interaction | Restraint plus one strong display face can carry personality; small technical labels create credibility. |
| **BLUESUM** | Exhibition-like progression | Distinct worlds in sequence, paced like rooms in a show; transitions are cuts, not washes. |

The Pinterest board adds the material language: Indian indie film posters, risograph and screenprint
duotones, halftone eyes, Devanagari/Latin contrast, redaction bars, barcodes, dense credit columns,
cut-paper silhouettes, and two-ink overprint.

**Not copied:** no reference layout, poster, or image is reproduced in the site. The archive informs
palette, density, cropping behaviour, and typographic hierarchy only.

## 2. Concept

> REFLOW is a printed exhibition in eight plates. Two inks, one paper, one engine.
> Each plate demonstrates a different physical behaviour of language.

The experience is a sequence of *plates* rather than sections: numbered, labelled, registered,
with a colophon at the end. Typography is the subject and the material. Photography is treated as
a second ink — duotone, halftone, cropped, never full-colour stock imagery.

## 3. Colour

| Token | Hex | Use |
|---|---|---|
| Paper | `#F0EADF` | Base stock for plates 01, 04, 07 |
| Aged | `#E3D8C7` | Collage sheet, playground field |
| Ink | `#171615` | Primary text, dark stages 02, 05, 08 |
| Deep red | `#791D27` | Plate 06 ground, overprint offsets, register marks |
| Vermilion | `#D94738` | Accents, one word per plate, misregistration |
| Dusty pink | `#DDA6AA` | Plate 03 air, secondary type |
| Pale pink | `#EBCFD0` | Plate 03 ground |
| Muted blue | `#758BA5` | Window image only |
| Mustard | `#C8A24A` | Small collage accents |

Rules: one ground + two inks per plate. No gradients except photographic light. No colour used
without a compositional job (emphasis, register, or material).

## 4. Typography

| Role | Face | Treatment |
|---|---|---|
| Display condensed | Oswald 500–700 | Uppercase, `-0.03em` to `-0.05em`, line-height 0.8–0.86, cropped at frame edges |
| Editorial serif | Instrument Serif | Statements and captions; italic for consequence lines |
| High-contrast serif | Bodoni Moda | Editorial plates and print references |
| Grotesque | Space Grotesk | Body text inside the engine and interface copy |
| Mono | IBM Plex Mono | Metadata, plate numbers, measurements, colophon |

Scale is deliberately split: enormous display (13–27vw) against 8–9px mono annotations.
No repeated centred heading; each plate has its own alignment logic (left, staircase, split,
baseline band, sheet).

## 5. Plate plan

| Plate | Composition | Type | Image | Colour | Primary action | Consequence |
|---|---|---|---|---|---|---|
| 01 Specimen | Cropped wordmark across the frame, narrow image strip right, credit band | Oswald wordmark, serif statement, mono credits | Cloth duotone strip → tall panel | Paper / ink / vermilion | Letters step into a descending rhythm; the image panel widens | The plate becomes a poster: type staircase over image, caption at left |
| 02 Expansion | Full-bleed word over an image aperture | Oswald with image-filled letters | Field duotone inside the word, then full bleed | Ink / vermilion / paper | Word scales and splits; the aperture opens | Image-led frame with a serif line at the base |
| 03 Interruption | Title left, engine text across the middle, figure entering right | Oswald title, 22px grotesque body, mono measurements | Cut-paper silhouette filled with cloth | Pale pink / ink / deep red | Silhouette traverses the measure; lines reflow around it | Text continues, meaning redistributed; interval count updates |
| 04 Distortion | Five stacked rows of one word, giant numeral right | Oswald rows; Instrument Serif resolution | None | Paper / ink / vermilion | Rows shear, stretch, track in, and compress | A single italic `meaning` resolves through the ghosted pattern |
| 05 Fragmentation | Nine horizontal strips over an arcade image | Oswald three-line statement | Arches beneath; field inset at the end | Ink / paper / vermilion | Strips drift apart and reveal the image; then dissolve | Final composition: type block, image inset, serif statement |
| 06 Collage | Poster sheet assembling on a red field | Oswald display, serif italic, mono credits | Doorway and arches crops, barcode, seal | Deep red / aged / ink / vermilion | Nine pieces fly into a locked grid | The sheet tilts; the plate is complete |
| 07 The Experiment | Canvas + editorial instrument panel | User-controlled | User-selected image masks | User-controlled | Drag forms; engine reflows text | Exports: PNG, SVG, JSON |
| 08 The Composition | Type stack left, field panel right, meta band | Instrument Serif stack; mono colophon | Field duotone | Ink / red / pink | Lines settle, rule draws, wordmark rises | Final print frame, no conventional footer |

## 6. Object rule

Every form answers: why is it here, what does it do, what does it displace, and why does it move?
- Plate 03's silhouette is the shape the text must negotiate; its polygon is the same data used for
  wrapping, clipping and misregistration.
- Plate 05's strips are the sentence, cut — not decoration.
- Plate 06's pieces are poster elements, each with a destination in the grid.
- Plate 07's forms are user-authored obstructions; the engine recalculates intervals from their
  sampled polygons.

No amoeba, no generic 3D solid, no floating particles.

## 7. Image system

Generated locally with Python/PIL (no external API, no generated text inside images):
`drape-01` cloth macro, `doorway-01` cut-paper figure in a lit door, `arches-01` arcade with raking
light, `field-01` two figures on a hill, `window-01` rain on night glass. Textures: paper fibre,
film grain, halftone dots, ink wash.

Treatments: duotone mapping, halftone screen, dust, vignette, print misregistration. Images are used
as full-bleed fields, letter fills, inset panels, silhouette masks and collage crops — never as
decoration.

## 8. Engine

`src/lib/geometry.ts` — shape sampling, rotation, scanline intersection, interval merge, multi-shape
slots. `src/lib/typography.ts` — canvas measurement, cache, word breaking, long-word handling,
interval allocation, alignment, paragraph preservation. `src/lib/motion.ts` — deterministic motion.

Rendering resolves through `FlowText`; the playground adds the interactive `Stage`. Layout is
recalculated only when text, measure, font, shapes or scroll progress change.

## 9. Rejected

Purple/blue AI gradients, glassmorphism, rounded card grids, centred hero + blob, generic fade-ups,
random particles, cursor effects, decorative 3D, and any image that does not change the composition.
"""
with open(os.path.join(POSTERS, "visual-direction.md"), "w", encoding="utf8") as f:
    f.write(direction)

print("selected", len(sel_files), "references; index and direction written")
