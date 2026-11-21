# REFLOW

**The physical behaviour of language.**

REFLOW is a scrolling web exhibition in seven plates. Each plate takes a piece of writing and treats it as a material with weight, edges and an appetite for space: it expands, gets interrupted, distorts, fragments, and finally composes itself around a single point. One typographic engine drives the whole show.

## Plates

| Plate | Title | What happens |
| ----- | ----- | ------------ |
| 01 | The Specimen | The wordmark at poster scale, with the specimen notes |
| 02 | Expansion | Type pushed past its own measure until the letters part |
| 03 | Interruption | A paragraph reflows live around a drawn figure |
| 04 | Distortion | Perspective and weight bent by scroll |
| 05 | Fragmentation | A sentence cut into strips that reassemble |
| 06 | Collage | Layered sheets, seals and marginalia |
| 07 | The Composition | Every move so far resolved into one layout |

A colophon leaf closes the exhibition.

## Stack

- React 18 and TypeScript
- Vite for development and production builds
- Plain CSS with custom properties for the art direction
- Vitest for the geometry and typography units

No CSS framework, no component library, no runtime services.

## Running locally

```bash
npm install
npm run dev
```

The dev server prints a local URL (usually `http://localhost:5173`).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite |
| `npm run typecheck` | Type-check without emitting |

## Layout

```
src/
  scenes/        one file per plate, plus the colophon leaf
  components/    FlowText, SignatureMark, the fixed reading interface
  hooks/         scroll progress, element size, reduced-motion
  lib/           geometry, typography, figure drawing, plate metadata
  styles/        global.css — colour, type scale, every plate's layout
public/
  images/        editorial photography and paper/ink textures
posters/         art-direction notes (reference images are kept local)
scripts/         asset generation and screenshot helpers
```

## Deployment

The site is a static build, so any static host works. On Vercel, import the repository and accept the detected settings: framework **Vite**, build command `npm run build`, output directory `dist`.

## Colophon

Designed and built by Likhit Choudhary. Typefaces in use are Oswald, Instrument Serif, Bodoni Moda, Space Grotesk and IBM Plex Mono, served from Google Fonts.
