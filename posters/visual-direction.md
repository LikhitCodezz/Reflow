# REFLOW — Visual direction

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
