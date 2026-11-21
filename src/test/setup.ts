import { vi } from 'vitest'

const mockCtx: any = {}
Object.defineProperty(mockCtx, 'font', {
  get() { return this._font || '' },
  set(v: string) { this._font = v },
})
Object.defineProperty(mockCtx, 'letterSpacing', {
  get() { return this._ls || '0px' },
  set(v: string) { this._ls = v },
})
mockCtx.measureText = function (text: string) {
  const m = /(\d+(?:\.\d+)?)px/.exec(this._font || '')
  const size = m ? parseFloat(m[1]) : 12
  const spacing = parseFloat(this._ls) || 0
  return { width: text.length * size * 0.5 + Math.max(0, text.length - 1) * spacing }
}

const originalCreate = document.createElement.bind(document)
vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
  if (tag === 'canvas') {
    const canvas: any = originalCreate('canvas')
    canvas.getContext = () => mockCtx
    return canvas
  }
  return originalCreate(tag)
})