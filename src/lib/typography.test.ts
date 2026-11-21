import { describe, it, expect } from 'vitest'
import { layoutText } from './typography'

const font = { family: 'monospace', size: 12, weight: 400, lineHeight: 1.4 }

describe('typography', () => {
  it('empty text yields no lines', () => {
    const res = layoutText('', 200, font, null)
    expect(res.lines.length).toBe(0)
  })

  it('preserves paragraph breaks', () => {
    const res = layoutText('a\n\nb', 200, font, null)
    // two paragraphs separated by blank line -> at least 2 lines with gap
    expect(res.lines.length).toBeGreaterThanOrEqual(2)
  })

  it('does not justify last line', () => {
    const text = 'one two three four five six'
    const res = layoutText(text, 120, font, null, { align: 'justify' })
    const last = res.lines[res.lines.length - 1]
    // last line segments should start at 0 (left aligned) not justified
    if (last.segments.length > 1) {
      const first = last.segments[0]
      expect(first.x).toBeLessThanOrEqual(1)
    }
  })

  it('breaks long words', () => {
    const long = 'a'.repeat(50)
    const res = layoutText(long, 60, font, null)
    expect(res.lines.length).toBeGreaterThan(1)
    for (const line of res.lines) {
      for (const seg of line.segments) {
        expect(seg.x + seg.width).toBeLessThanOrEqual(60 + 1)
      }
    }
  })

  it('wraps around circle', () => {
    const shape = { id: 'c', type: 'circle' as const, cx: 60, cy: 40, rotation: 0, padding: 4, radius: 20 }
    const res = layoutText('the quick brown fox jumps over the lazy dog', 200, font, [shape])
    expect(res.lines.length).toBeGreaterThan(0)
  })
})