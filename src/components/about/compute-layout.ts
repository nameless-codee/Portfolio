import { ABOUT_COPY, type AboutBlockId } from "@/data/about"
import type { Geometry, PanelId } from "./panel-geometry"
import { fitBodies, type BodyLine } from "./shape-engine"
import { BODY, BODY_FONT, DESIGN, HEADING_FONT } from "./stage-config"

export type HeadingLayout = {
  id: AboutBlockId
  text: string
  side: "left" | "right"
  x: number
  top: number
  size: number
}
export type BodyBlockLayout = { id: AboutBlockId; text: string; lines: BodyLine[] }
export type StageLayout = {
  headings: HeadingLayout[]
  bodies: BodyBlockLayout[]
  bodySize: number
  bodyLineHeight: number
}

const clamp = (lo: number, v: number, hi: number) => Math.max(lo, Math.min(v, hi))

export async function loadFonts() {
  await Promise.all([
    document.fonts.load(`100px ${HEADING_FONT}`),
    document.fonts.load(`36px ${BODY_FONT}`),
  ])
}

const ctx = document.createElement("canvas").getContext("2d")!

/** Lays out headings + shaped body text for the current container size. Cheap enough to run on every resize. */
export function computeStageLayout(geo: Geometry): StageLayout {
  const { w, h } = geo
  const area = Math.sqrt((w * h) / (DESIGN.w * DESIGN.h)) // overall scale vs. the artboard

  const pad = clamp(14, 26 * area, 34) // text clearance from every edge
  const capHeight = Math.min(0.075 * h, 0.0527 * w) // 73px on the artboard
  const insetX = clamp(16, 0.0235 * w, 36)
  const insetTop = clamp(16, 0.041 * h, 44)
  const insetBottom = clamp(16, 0.037 * h, 40)
  const gapToBody = clamp(14, 0.025 * h, 26)

  const baselineTop = insetTop + capHeight
  const baselineBottom = h - insetBottom

  // ---- headings: one shared size so every capital is capHeight tall
  ctx.font = `100px ${HEADING_FONT}`
  const capRatio = ctx.measureText("H").actualBoundingBoxAscent / 100
  const headingSize = capRatio > 0 ? capHeight / capRatio : capHeight * 1.4

  const place = (id: AboutBlockId, side: "left" | "right", baseline: number): HeadingLayout => {
    const text = ABOUT_COPY[id].title.toUpperCase()
    ctx.font = `${headingSize}px ${HEADING_FONT}`
    const m = ctx.measureText(text)
    const ascent = m.fontBoundingBoxAscent ?? headingSize * 0.8
    const descent = m.fontBoundingBoxDescent ?? headingSize * 0.2
    // line-height = font-size, so the baseline sits this far below the top of the box
    const baselineOffset = (headingSize - (ascent + descent)) / 2 + ascent
    return { id, text, side, x: insetX, top: baseline - baselineOffset, size: headingSize }
  }

  const headings = [
    place("about", "left", baselineTop),
    place("experience", "right", baselineTop),
    place("skills", "left", baselineBottom),
  ]

  // ---- body text, wrapped inside each panel at one shared size
  const region = (id: AboutBlockId, panel: PanelId, yMin: number, yMax: number) => ({
    id,
    text: ABOUT_COPY[id].body,
    yMin,
    yMax,
    runsAt: (y: number) => geo.runsAt(panel, y, pad),
  })

  const regions = [
    region("about", "about", baselineTop + gapToBody, h - pad),
    region("experience", "experience", baselineTop + gapToBody, h - pad),
    region("skills", "skills", pad, baselineBottom - capHeight - gapToBody),
  ]

  const fit = fitBodies(ctx, regions, {
    fontFamily: BODY_FONT,
    maxSize: BODY.maxSize * area,
    minSize: Math.max(12, BODY.minSize * area),
    lineHeight: BODY.lineHeight,
    minLineWidth: BODY.minLineWidth * area,
  })

  return {
    headings,
    bodies: regions.map((r) => ({ id: r.id, text: r.text, lines: fit.layouts[r.id].lines })),
    bodySize: fit.size,
    bodyLineHeight: fit.lineHeight,
  }
}
