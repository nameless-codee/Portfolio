import type { DrawFn } from "./LiquidLayer"

const NAME_FONT = '"GC Magnu Demo"'

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

async function loadFonts() {
  await Promise.all([
    document.fonts.load(`100px ${NAME_FONT}`),
    document.fonts.load('60px "Higher"'),
  ])
}

/** Where the cream circle sits – shared by its drawing and its grow-in origin. */
export function circleLayout(w: number, h: number) {
  const diameter = Math.min(w * 0.8, h * 0.68)
  return { cx: w / 2, cy: h * 0.05 + diameter / 2, r: diameter / 2 }
}

/** Grow-in origin in uv space (uv y points up, canvas y points down). */
export const circleOrigin = (w: number, h: number): [number, number] => {
  const { cx, cy } = circleLayout(w, h)
  return [cx / w, 1 - cy / h]
}

/** Back layer: orange panel and dot grid. */
export const drawBackground: DrawFn = (ctx, w, h) => {
  // Panel
  ctx.fillStyle = cssVar("--color-hero-orange", "#ff4500")
  ctx.fillRect(0, 0, w, h)

  // Dot grid (one path, one fill)
  const gap = 18
  const offset = 8
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)"
  ctx.beginPath()
  for (let y = offset; y < h; y += gap) {
    for (let x = offset; x < w; x += gap) {
      ctx.moveTo(x + 1, y)
      ctx.arc(x, y, 1, 0, Math.PI * 2)
    }
  }
  ctx.fill()

}

/** Circle layer: just the cream circle, so it can animate on its own. */
export const drawCircle: DrawFn = (ctx, w, h) => {
  const { cx, cy, r } = circleLayout(w, h)
  ctx.fillStyle = cssVar("--color-hero-cream", "#faf1e0")
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Front layer: just the big name, drawn over the portrait. Nav + socials are plain DOM. */
export const drawForeground: DrawFn = async (ctx, w, h) => {
  await loadFonts()

  const dpr = ctx.getTransform().a
  ctx.fillStyle = "#fff"

  // ---- Name: two words, fitted to the card width, bottom aligned ----------
  const gap = 0.2 // em, space between the two words
  ctx.font = `100px ${NAME_FONT}`
  const a = ctx.measureText("MANIRENKAN").width / 100
  const b = ctx.measureText("KESHAVAN").width / 100
  const size = (w * 0.95) / (a + gap + b)
  const left = w * 0.025
  const baseline = h * 0.97

  ctx.save()
  ctx.font = `${size}px ${NAME_FONT}`
  ctx.textBaseline = "alphabetic"
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)"
  ctx.shadowOffsetY = size * 0.04 * dpr // shadow offsets ignore the canvas transform
  ctx.fillText("MANIRENKAN", left, baseline)
  ctx.fillText("KESHAVAN", left + size * (a + gap), baseline)
  ctx.restore()
}
