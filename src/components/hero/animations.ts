import type { Variants } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export const fadeSlide = (delay = 0, y = 24): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } },
})

export const stagger = (staggerChildren = 0.12, delayChildren = 0.3): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

export const popIn: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.9, ease } },
}
