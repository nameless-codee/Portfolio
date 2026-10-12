/**
 * Fits text inside a shape. For each line it intersects the shape's free span at the top, middle and
 * bottom of the line, fills that span with as many words as fit, and centres the line in it.
 */
import type { Interval } from "./panel-geometry"

export type BodyLine = { text: string; cx: number; y: number }
export type BodyLayout = { lines: BodyLine[]; truncated: boolean }

export type BodyRegion = {
  id: string
  /** Free horizontal intervals on row y. */
  runsAt: (y: number) => Interval[]
  text: string
  yMin: number
  yMax: number
}

function spanAt(
  runsAt: (y: number) => Interval[],
  y: number,
  lineHeight: number,
  minWidth: number
): Interval | null {
  const rows = [y + 2, y + lineHeight / 2, y + lineHeight - 2].map(runsAt)
  let best: Interval | null = null

  const walk = (i: number, lo: number, hi: number) => {
    if (hi - lo < minWidth) return
    if (i === rows.length) {
      if (!best || hi - lo > best[1] - best[0]) best = [lo, hi]
      return
    }
    for (const [a, b] of rows[i]) walk(i + 1, Math.max(lo, a), Math.min(hi, b))
  }
  walk(0, -Infinity, Infinity)
  return best
}

export function layoutBody(args: {
  region: BodyRegion
  lineHeight: number
  measure: (text: string) => number
  minWidth: number
}): BodyLayout {
  const { region, lineHeight, measure, minWidth } = args
  const words = region.text.split(/\s+/).filter(Boolean)
  const lines: BodyLine[] = []

  let y = region.yMin
  let i = 0
  while (i < words.length) {
    if (y + lineHeight > region.yMax) {
      if (lines.length) lines[lines.length - 1].text = lines[lines.length - 1].text.replace(/[.,;:!?]*$/, "") + "…"
      return { lines, truncated: true }
    }

    const span = spanAt(region.runsAt, y, lineHeight, minWidth)
    if (!span) {
      y += 4 // not wide enough here – slide down until the shape opens up
      continue
    }

    const maxWidth = span[1] - span[0]
    let line = words[i]
    if (measure(line) > maxWidth) {
      y += 4
      continue
    }

    let j = i + 1
    while (j < words.length && measure(line + " " + words[j]) <= maxWidth) {
      line += " " + words[j]
      j++
    }
    lines.push({ text: line, cx: (span[0] + span[1]) / 2, y })
    i = j
    y += lineHeight
  }

  return { lines, truncated: false }
}

/** Largest single font size at which every region fits. */
export function fitBodies(
  ctx: CanvasRenderingContext2D,
  regions: BodyRegion[],
  opts: { fontFamily: string; maxSize: number; minSize: number; lineHeight: number; minLineWidth: number }
) {
  let result = null as null | { size: number; lineHeight: number; layouts: Record<string, BodyLayout> }

  for (let size = Math.floor(opts.maxSize); size >= opts.minSize; size--) {
    ctx.font = `${size}px ${opts.fontFamily}`
    const lineHeight = size * opts.lineHeight
    const measure = (text: string) => ctx.measureText(text).width

    const layouts = regions.map((region) =>
      layoutBody({ region, lineHeight, measure, minWidth: opts.minLineWidth })
    )
    result = { size, lineHeight, layouts: Object.fromEntries(regions.map((r, i) => [r.id, layouts[i]])) }
    if (layouts.every((l) => !l.truncated)) return result
  }

  console.warn("[about] Body copy is too long for the shapes – it was truncated. Shorten it in src/data/about.ts.")
  return result!
}
