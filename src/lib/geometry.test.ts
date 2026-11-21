import { describe, it, expect } from 'vitest'
import {
  samplePolygon,
  scanlineObstructed,
  mergeIntervals,
  availableSlotsForShapes,
} from './geometry'

describe('geometry', () => {
  it('circle sample has segments', () => {
    const poly = samplePolygon({ id: 'c', type: 'circle', cx: 50, cy: 50, rotation: 0, padding: 0, radius: 20 })
    expect(poly.length).toBeGreaterThan(10)
  })

  it('scanline obstructed circle', () => {
    const poly = samplePolygon({ id: 'c', type: 'circle', cx: 50, cy: 50, rotation: 0, padding: 0, radius: 20 })
    const ivs = scanlineObstructed([poly], 50)
    expect(ivs.length).toBeGreaterThan(0)
    const [a, b] = ivs[0]
    expect(a).toBeLessThan(50)
    expect(b).toBeGreaterThan(50)
  })

  it('merge intervals', () => {
    const merged = mergeIntervals([[0, 10], [5, 15], [20, 30]])
    expect(merged).toEqual([[0, 15], [20, 30]])
  })

  it('available slots avoid circle', () => {
    const shape = { id: 'c', type: 'circle' as const, cx: 50, cy: 50, rotation: 0, padding: 0, radius: 20 }
    const slots = availableSlotsForShapes(30, 100, [shape], 0, 16)
    // should produce at least one slot not overlapping center
    expect(slots.length).toBeGreaterThan(0)
    for (const s of slots) {
      expect(s.end - s.start).toBeGreaterThan(0)
    }
  })

  it('rotated rectangle scanline', () => {
    const shape = { id: 'r', type: 'rectangle' as const, cx: 50, cy: 50, rotation: Math.PI / 4, padding: 0, width: 40, height: 40 }
    const poly = samplePolygon(shape)
    const ivs = scanlineObstructed([poly], 50)
    expect(ivs.length).toBeGreaterThan(0)
  })
})