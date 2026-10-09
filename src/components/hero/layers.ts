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

/** Back layer: orange panel, dot grid and the cream circle. */
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

  // Cream circle – same sizing rule the DOM version used
  const diameter = Math.min(w * 0.8, h * 0.68)
  ctx.fillStyle = cssVar("--color-hero-cream", "#faf1e0")
  ctx.beginPath()
  ctx.arc(w / 2, h * 0.05 + diameter / 2, diameter / 2, 0, Math.PI * 2)
  ctx.fill()
}

/** Front layer: the big name, nav labels and social icons (drawn over the portrait). */
export const drawForeground: DrawFn = async (ctx, w, h, card) => {
  await loadFonts() // measure the DOM only after fonts are in, so positions are final

  const origin = card.getBoundingClientRect()
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

  // ---- Nav labels: copy position + font from the invisible DOM links -------
  card.querySelectorAll<HTMLElement>('[data-liquid="text"]').forEach((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    ctx.textBaseline = "middle"
    ctx.fillText(
      (el.textContent ?? "").toUpperCase(),
      r.left - origin.left,
      r.top - origin.top + r.height / 2
    )
  })

  // ---- Social icons: rasterise the (invisible) DOM <svg>s -------------------
  const icons = card.querySelectorAll<SVGSVGElement>('[data-liquid="icon"]')
  await Promise.all(
    Array.from(icons).map(async (svg) => {
      const r = svg.getBoundingClientRect()
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.removeAttribute("class")
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      clone.setAttribute("width", String(r.width))
      clone.setAttribute("height", String(r.height))
      clone.setAttribute("style", "color:#fff")

      const img = new Image()
      img.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(new XMLSerializer().serializeToString(clone))
      await img.decode()
      ctx.drawImage(img, r.left - origin.left, r.top - origin.top, r.width, r.height)
    })
  )
}
