import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const
const STAGGER = 0.03 // seconds between letters

/** One letter's slide. `from` is where it waits, `to` is where it lands on hover. */
const slide = (from: string, to: string, i: number): Variants => ({
  rest: { y: from, transition: { duration: 0.45, ease, delay: i * STAGGER } },
  hover: { y: to, transition: { duration: 0.45, ease, delay: i * STAGGER } },
})

const plain = (ch: string) => (ch === " " ? "\u00A0" : ch)

/**
 * Text link with a "letter roll" hover: every letter slides up and out while a copy slides in from
 * below, one letter after another. Also triggers on keyboard focus. Reduced-motion users get a fade.
 */
export function RollingLink({
  href,
  children,
  className,
}: {
  href: string
  children: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <a href={href} className={cn("transition-opacity hover:opacity-70 focus-visible:opacity-70", className)}>
        {children}
      </a>
    )
  }

  const letters = Array.from(children)

  return (
    <motion.a
      href={href}
      aria-label={children}
      // Own animation context, separate from any entrance animation on a parent
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={cn("relative inline-flex overflow-hidden", className)}
    >
      {/* Visible copy: slides up and out */}
      <span aria-hidden className="flex">
        {letters.map((ch, i) => (
          <motion.span key={i} variants={slide("0%", "-110%", i)} className="inline-block whitespace-pre">
            {plain(ch)}
          </motion.span>
        ))}
      </span>

      {/* Duplicate: waits below, slides up into place */}
      <span aria-hidden className="absolute inset-0 flex">
        {letters.map((ch, i) => (
          <motion.span key={i} variants={slide("110%", "0%", i)} className="inline-block whitespace-pre">
            {plain(ch)}
          </motion.span>
        ))}
      </span>
    </motion.a>
  )
}
