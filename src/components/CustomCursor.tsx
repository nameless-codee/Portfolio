import { useEffect, useRef, useState } from "react"
import { motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion"

/** Anything matching this makes the cursor swell. Add data-cursor="hover" to opt in. */
const INTERACTIVE = 'a, button, [role="button"], summary, label[for], [data-cursor="hover"]'

const RING = 44 // px, resting ring diameter
const POP = { type: "spring", stiffness: 200, damping: 24 } as const // softer, less bouncy

/**
 * Liquid cursor: a dot that sticks to the pointer and a ring that trails it on a spring,
 * stretching along its direction of travel (same feel as the flowmap distortion).
 * Hidden on touch devices; reduced-motion users get the dot only.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Raw pointer position, the trailing spring, and the squash-and-stretch values
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  // Critically damped: glides to a stop with no overshoot or wobble
  const ringX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6, restDelta: 0.001, restSpeed: 0.01 })
  const ringY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6, restDelta: 0.001, restSpeed: 0.01 })
  const smooth = useRef({ stretch: 0, angle: 0 })
  const angle = useMotionValue(0)
  const stretchX = useMotionValue(1)
  const stretchY = useMotionValue(1)

  useEffect(() => {
    // Mouse / trackpad only
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

    setEnabled(true)
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    document.documentElement.classList.add("has-custom-cursor")

    let first = true
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      x.set(e.clientX)
      y.set(e.clientY)
      if (first) {
        // Start the ring under the pointer instead of flying in from the corner
        ringX.jump(e.clientX)
        ringY.jump(e.clientY)
        first = false
      }
      setVisible(true)
    }
    const onOver = (e: PointerEvent) =>
      setHovering(!!(e.target as Element | null)?.closest?.(INTERACTIVE))
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerover", onOver, { passive: true })
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    document.documentElement.addEventListener("mouseleave", onLeave)

    return () => {
      document.documentElement.classList.remove("has-custom-cursor")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerover", onOver)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      document.documentElement.removeEventListener("mouseleave", onLeave)
    }
  }, [x, y, ringX, ringY])

  // Stretch follows the ring's *speed* and is eased over time (frame-rate independent),
  // so it relaxes smoothly after the pointer stops instead of snapping back.
  useAnimationFrame((_, delta) => {
    if (!enabled || reduceMotion) return
    const st = smooth.current

    const vx = ringX.getVelocity()
    const vy = ringY.getVelocity()
    const speed = Math.hypot(vx, vy) // px / second

    const target = Math.min(speed / 2500, 0.5)
    st.stretch += (target - st.stretch) * (1 - Math.exp(-delta / 110))

    // Only re-aim while actually moving; hold the last direction when nearly still
    if (speed > 40) {
      const targetAngle = (Math.atan2(vy, vx) * 180) / Math.PI
      const diff = ((targetAngle - st.angle + 540) % 360) - 180 // shortest turn
      st.angle += diff * (1 - Math.exp(-delta / 60))
    }

    angle.set(st.angle)
    stretchX.set(1 + st.stretch)
    stretchY.set(1 - st.stretch * 0.4)
  })

  if (!enabled) return null

  const ringState = pressed
    ? { scale: hovering ? 1.35 : 0.8, backgroundColor: "rgba(255,255,255,0.28)" }
    : hovering
      ? { scale: 1.7, backgroundColor: "rgba(255,255,255,0.14)" }
      : { scale: 1, backgroundColor: "rgba(255,255,255,0)" }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Trailing liquid ring: position + rotation -> stretch (in rotated axes) -> look.
          Both wrappers are 0x0 with their pivot at the pointer; the ring is absolutely
          positioned inside, so no margin collapsing can shift the pivot. */}
      {!reduceMotion && (
        <motion.div
          className="absolute left-0 top-0 h-0 w-0"
          style={{ x: ringX, y: ringY, rotate: angle, originX: 0, originY: 0 }}
        >
          <motion.div className="h-0 w-0" style={{ scaleX: stretchX, scaleY: stretchY, originX: 0, originY: 0 }}>
            <motion.div
              className="absolute rounded-full border-[1.5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(0,0,0,0.35)]"
              style={{ width: RING, height: RING, left: -RING / 2, top: -RING / 2 }}
              animate={ringState}
              transition={POP}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Dot glued to the pointer */}
      <motion.div className="absolute left-0 top-0 h-0 w-0" style={{ x, y }}>
        <motion.div
          className="absolute -left-1 -top-1 size-2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
          animate={{ scale: hovering ? 0 : pressed ? 0.6 : 1 }}
          transition={POP}
        />
      </motion.div>
    </motion.div>
  )
}
