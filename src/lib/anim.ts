export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** 0→1 ramp between a and b, eased. */
export const ss = (t: number, a: number, b: number) => {
  if (a === b) return t >= b ? 1 : 0
  const x = clamp((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}

/** 0→1 linear ramp between a and b. */
export const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a))

export const pad2 = (n: number) => String(n).padStart(2, '0')
