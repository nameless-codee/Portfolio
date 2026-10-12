import { useEffect, useId, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import bulb from "@/assets/about/bulb.png"
import { computeStageLayout, loadFonts } from "./compute-layout"
import { makeGeometry } from "./panel-geometry"
import { BODY_FONT, CORNER_RADIUS, HEADING_FONT } from "./stage-config"

const ease = [0.22, 1, 0.36, 1] as const

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.035 } } }
const panel: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}
const heading: Variants = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}
const line: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}
const bulbPop: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -12 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 140, damping: 14 } },
}

/**
 * Fills its container (the whole screen, like the hero). The panels are drawn as an SVG computed from
 * the container's size, so the shape adapts to any width/height instead of being a scaled picture.
 */
export function AboutStage() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [fontsReady, setFontsReady] = useState(false)
  const id = useId().replace(/:/g, "")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    loadFonts().then(() => setFontsReady(true))
  }, [])

  const geo = useMemo(() => (size.w && size.h ? makeGeometry(size.w, size.h) : null), [size])
  const layout = useMemo(() => (geo && fontsReady ? computeStageLayout(geo) : null), [geo, fontsReady])

  // Blur + threshold rounds every corner; sigma ≈ radius / 1.86
  const sigma = CORNER_RADIUS / 1.86
  const slope = 24

  return (
    <div ref={ref} className="relative size-full">
      {geo && layout && (
        <motion.div
          className="absolute inset-0"
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* ---- Panels: rectangle minus circle minus the two gaps ---- */}
          <motion.svg
            variants={panel}
            aria-hidden
            className="absolute inset-0 block"
            width={geo.w}
            height={geo.h}
          >
            <defs>
              <mask id={`cut-${id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={geo.w} height={geo.h}>
                <rect width={geo.w} height={geo.h} fill="#fff" />
                <g stroke="#000" strokeWidth={geo.gap} strokeLinecap="butt">
                  <line {...geo.mainLine} />
                  <line {...geo.branchLine} />
                </g>
                <circle cx={geo.circle.cx} cy={geo.circle.cy} r={geo.circle.r} fill="#000" />
              </mask>

              {/* Rounds the corners: blur the shape, then snap the alpha back to hard edges */}
              <filter
                id={`round-${id}`}
                filterUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={geo.w}
                height={geo.h}
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation={sigma} />
                <feComponentTransfer>
                  <feFuncA type="linear" slope={slope} intercept={0.5 - 0.5 * slope} />
                </feComponentTransfer>
              </filter>

              <pattern id={`dots-${id}`} width={18} height={18} patternUnits="userSpaceOnUse" x={-1} y={-1}>
                <circle cx={9} cy={9} r={1} fill="rgb(255 255 255 / 0.28)" />
              </pattern>
            </defs>

            <g filter={`url(#round-${id})`}>
              <rect width={geo.w} height={geo.h} mask={`url(#cut-${id})`} style={{ fill: "var(--color-hero-orange)" }} />
            </g>
            <rect width={geo.w} height={geo.h} mask={`url(#cut-${id})`} fill={`url(#dots-${id})`} />
          </motion.svg>

          {/* ---- Light bulb in the circle ---- */}
          <motion.div variants={bulbPop} className="absolute" style={geo.bulb}>
            <motion.img
              src={bulb}
              alt=""
              draggable={false}
              className="size-full select-none"
              animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* ---- Headings ---- */}
          {layout.headings.map((h) => (
            <motion.h2
              key={h.id}
              variants={heading}
              className="absolute m-0 whitespace-nowrap font-normal text-white"
              style={{
                top: h.top,
                ...(h.side === "left" ? { left: h.x } : { right: h.x }),
                fontFamily: HEADING_FONT,
                fontSize: h.size,
                lineHeight: `${h.size}px`,
              }}
            >
              {h.text}
            </motion.h2>
          ))}

          {/* ---- Body text wrapped to each panel. The visual lines are decorative;
                 the full paragraph is available to screen readers. ---- */}
          {layout.bodies.map((block) => (
            <motion.div key={block.id} variants={group} className="absolute inset-0">
              <p className="sr-only">{block.text}</p>
              {block.lines.map((l, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  variants={line}
                  className="absolute whitespace-nowrap text-white"
                  style={{
                    left: l.cx,
                    top: l.y,
                    x: "-50%",
                    fontFamily: BODY_FONT,
                    fontSize: layout.bodySize,
                    lineHeight: `${layout.bodyLineHeight}px`,
                  }}
                >
                  {l.text}
                </motion.span>
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
