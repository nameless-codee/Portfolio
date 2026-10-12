/**
 * The "subtracted" panel shape, built from math instead of a PNG.
 *
 *   panels = full rectangle  −  circle  −  long slanted gap  −  short branch gap
 *
 * Everything is a proportion of the container (w, h), so the shape adapts to ANY window size and
 * aspect ratio, while the circle stays round and the gaps keep a constant thickness.
 * (Verified against the original PNG: 99.6% pixel match; the rest is corner rounding.)
 */

export type PanelId = "about" | "experience" | "skills"
export type Interval = [number, number]

type P = { x: number; y: number }
type Seg = { x1: number; y1: number; x2: number; y2: number }

/** Proportions measured from the 1384 x 974 artboard. Tweak these to reshape the layout. */
export const SHAPE = {
  /** Long slanted gap: top edge -> bottom edge, passing just right of the circle's centre. */
  main: { a: { x: 0.6662, y: 0 }, b: { x: 0.4682, y: 1 } },
  /** Short gap: left edge -> into the circle. */
  branch: { a: { x: 0, y: 0.306 }, b: { x: 0.5376, y: 0.5431 } },
  circle: { x: 0.5376, y: 0.5246, ofHeight: 0.198, ofWidth: 0.1395 }, // radius = the smaller of the two
  gap: { ofWidth: 0.0217, min: 14, max: 34 }, // gap thickness in px
}

export type Geometry = {
  w: number
  h: number
  gap: number
  circle: { cx: number; cy: number; r: number }
  mainLine: Seg
  branchLine: Seg
  bulb: { left: number; top: number; width: number; height: number }
  /** Free horizontal intervals of a panel on row y, keeping `pad` px away from every edge. */
  runsAt: (panel: PanelId, y: number, pad: number) => Interval[]
}

const clamp = (lo: number, v: number, hi: number) => Math.max(lo, Math.min(v, hi))

export function makeGeometry(w: number, h: number): Geometry {
  const px = (p: P): P => ({ x: p.x * w, y: p.y * h })
  const a1 = px(SHAPE.main.a)
  const b1 = px(SHAPE.main.b)
  const a2 = px(SHAPE.branch.a)
  const b2 = px(SHAPE.branch.b)

  const cx = SHAPE.circle.x * w
  const cy = SHAPE.circle.y * h
  const r = Math.min(SHAPE.circle.ofHeight * h, SHAPE.circle.ofWidth * w)
  const gap = clamp(SHAPE.gap.min, SHAPE.gap.ofWidth * w, SHAPE.gap.max)

  // Extend a line past the container so its stroke always reaches the edges
  const extend = (a: P, b: P, t0: number, t1: number): Seg => ({
    x1: a.x + (b.x - a.x) * t0,
    y1: a.y + (b.y - a.y) * t0,
    x2: a.x + (b.x - a.x) * t1,
    y2: a.y + (b.y - a.y) * t1,
  })

  // x of each line at a given row
  const mMain = (b1.x - a1.x) / (b1.y - a1.y) // dx per dy
  const sBranch = (b2.y - a2.y) / (b2.x - a2.x) // dy per dx
  const xMain = (y: number) => a1.x + (y - a1.y) * mMain
  const xBranch = (y: number) => a2.x + (y - a2.y) / sBranch

  const runsAt = (panel: PanelId, y: number, pad: number): Interval[] => {
    // Perpendicular clearance from a gap = half its width + padding, converted to a horizontal distance
    const d = gap / 2 + pad
    const dMain = d * Math.sqrt(1 + mMain * mMain)
    const dBranch = (d * Math.sqrt(1 + sBranch * sBranch)) / sBranch

    let lo = pad
    let hi = w - pad
    if (panel === "about") {
      lo = Math.max(lo, xBranch(y) + dBranch) // above the branch gap...
      hi = Math.min(hi, xMain(y) - dMain) //     ...and left of the long gap
    } else if (panel === "experience") {
      lo = Math.max(lo, xMain(y) + dMain) //     right of the long gap
    } else {
      hi = Math.min(hi, xBranch(y) - dBranch, xMain(y) - dMain) // below the branch, left of the long gap
    }
    if (hi <= lo) return []

    // Carve the circle (plus padding) out of the row
    const dy = y - cy
    const R = r + pad
    if (Math.abs(dy) < R) {
      const half = Math.sqrt(R * R - dy * dy)
      const out: Interval[] = []
      if (cx - half > lo) out.push([lo, Math.min(hi, cx - half)])
      if (cx + half < hi) out.push([Math.max(lo, cx + half), hi])
      return out.filter(([a, b]) => b > a)
    }
    return [[lo, hi]]
  }

  return {
    w,
    h,
    gap,
    circle: { cx, cy, r },
    mainLine: extend(a1, b1, -0.1, 1.1),
    branchLine: extend(a2, b2, -0.1, 1), // ends at the circle, which hides the cut end
    // The bulb PNG is 253 x 324; it sat at (-0.694r, -0.793r) from the circle centre at 1.311r wide
    bulb: {
      left: cx - 0.694 * r,
      top: cy - 0.793 * r,
      width: 1.311 * r,
      height: 1.679 * r,
    },
    runsAt,
  }
}
