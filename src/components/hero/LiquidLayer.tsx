import { useEffect, useRef } from "react"
import { animate } from "framer-motion"
import { Flowmap, Mesh, Program, Renderer, Texture, Triangle, Vec2 } from "ogl"
import { FRAGMENT, VERTEX } from "./shaders"

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  card: HTMLElement
) => void | Promise<void>

type LiquidLayerProps = {
  /** Paints the layer with Canvas 2D; the shader then distorts the result. */
  draw: DrawFn
  className?: string
  /** Seconds before the liquid reveal starts. */
  revealDelay?: number
  /** Plain CSS background used if WebGL isn't available. */
  fallback?: string
  /** Seconds the reveal takes. */
  duration?: number
  /** 0 = no scaling. 0.5 = the layer starts at 50% size and grows to 100% while revealing. */
  grow?: number
  /** Grow-in origin in uv space (0..1, y up). Must be a stable reference (define it at module level). */
  origin?: (width: number, height: number) => [number, number]
}

const EASE = [0.22, 1, 0.36, 1] as const
const MAX_DPR = 2

/**
 * Fills its parent ("the card"), paints `draw()` into a 2D canvas, uploads it as a
 * texture and distorts it with a cursor-driven flowmap. Pointer events pass through.
 */
export function LiquidLayer({
  draw,
  className,
  revealDelay = 0.2,
  fallback,
  duration = 1.8,
  grow = 0,
  origin,
}: LiquidLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const card = container?.parentElement
    if (!container || !card) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // ---- Renderer ---------------------------------------------------------
    let renderer: Renderer
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      })
    } catch {
      if (fallback) container.style.background = fallback
      return
    }
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.canvas.style.display = "block"
    container.appendChild(gl.canvas)

    // ---- Flowmap + program ------------------------------------------------
    const flowmap = new Flowmap(gl, { falloff: 0.28, alpha: 1, dissipation: 0.96 })
    const texture = new Texture(gl, {
      premultiplyAlpha: true,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    })
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        tFlow: flowmap.uniform,
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uGrow: { value: grow },
        uOrigin: { value: [0.5, 0.5] },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    // ---- Paint the layer into a texture ---------------------------------
    let disposed = false
    let token = 0
    let hasTexture = false
    let introStarted = false
    let introAnim: { stop: () => void } | undefined

    const redraw = async () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return

      const run = ++token
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const canvas = document.createElement("canvas") // fresh canvas per run avoids races
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const ctx = canvas.getContext("2d")!
      ctx.scale(dpr, dpr)

      await draw(ctx, width, height, card)
      if (disposed || run !== token) return

      texture.image = canvas
      texture.needsUpdate = true
      hasTexture = true

      if (!introStarted) {
        introStarted = true
        if (reduceMotion) {
          program.uniforms.uReveal.value = 1
        } else {
          introAnim = animate(0, 1, {
            duration,
            delay: revealDelay,
            ease: EASE,
            onUpdate: (v) => (program.uniforms.uReveal.value = v),
          })
        }
      }
    }

    // ---- Resize (redraw is debounced) -----------------------------------
    let resizeTimer = 0
    let firstResize = true
    const onResize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height)
      gl.canvas.style.width = "100%"
      gl.canvas.style.height = "100%"
      flowmap.aspect = width / height
      if (origin) program.uniforms.uOrigin.value = origin(width, height)

      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(redraw, firstResize ? 0 : 150)
      firstResize = false
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    // ---- Pointer input ----------------------------------------------------
    const mouse = new Vec2(-1)
    const lastMouse = new Vec2()
    const velocity = new Vec2()
    let lastTime = 0
    let velocityDirty = false

    const onPointerMove = (e: PointerEvent) => {
      const rect = gl.canvas.getBoundingClientRect()
      mouse.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      )

      const now = performance.now()
      if (!lastTime) {
        lastTime = now
        lastMouse.set(e.clientX, e.clientY)
      }
      const dt = Math.max(10.4, now - lastTime)
      lastTime = now

      velocity.x = (e.clientX - lastMouse.x) / dt
      velocity.y = (e.clientY - lastMouse.y) / dt
      lastMouse.set(e.clientX, e.clientY)
      velocityDirty = true
    }
    if (!reduceMotion) window.addEventListener("pointermove", onPointerMove)

    // ---- Render loop ------------------------------------------------------
    let raf = 0
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!hasTexture) return

      if (!velocityDirty) {
        mouse.set(-1)
        velocity.set(0)
      }
      velocityDirty = false

      flowmap.mouse.copy(mouse)
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.15 : 0.1)
      flowmap.update()

      program.uniforms.uTime.value = t * 0.001
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(tick)

    // ---- Cleanup ------------------------------------------------------------
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      introAnim?.stop()
      resizeObserver.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      gl.canvas.remove()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [draw, revealDelay, fallback, duration, grow, origin])

  return <div ref={containerRef} aria-hidden className={`pointer-events-none ${className ?? ""}`} />
}
