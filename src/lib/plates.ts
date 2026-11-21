export interface Plate {
  id: string
  n: number
  title: string
  theme: 'light' | 'dark'
}

export const PLATES: Plate[] = [
  { id: 'plate-01', n: 1, title: 'The Specimen', theme: 'light' },
  { id: 'plate-02', n: 2, title: 'Expansion', theme: 'dark' },
  { id: 'plate-03', n: 3, title: 'Interruption', theme: 'light' },
  { id: 'plate-04', n: 4, title: 'Distortion', theme: 'light' },
  { id: 'plate-05', n: 5, title: 'Fragmentation', theme: 'dark' },
  { id: 'plate-06', n: 6, title: 'Collage', theme: 'dark' },
  { id: 'plate-07', n: 7, title: 'The Composition', theme: 'dark' },
]
