import { motion } from "framer-motion"
import { NAV_ITEMS } from "@/data/hero"
import { RollingLink } from "./RollingLink"

const ease = [0.22, 1, 0.36, 1] as const

/** Plain, crisp DOM links – deliberately NOT part of the liquid distortion layers. */
export function HeroNav() {
  return (
    <motion.nav
      aria-label="Primary"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 1.1 } } }}
      className="absolute left-5 top-5 z-30 flex flex-col md:left-8 md:top-7"
    >
      {NAV_ITEMS.map((item) => (
        // The wrapper handles the entrance; the link inside handles the hover roll
        <motion.div
          key={item.label}
          variants={{
            hidden: { opacity: 0, y: -12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
          }}
        >
          <RollingLink
            href={item.href}
            className="font-higher text-4xl uppercase leading-[1.1] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:text-6xl"
          >
            {item.label}
          </RollingLink>
        </motion.div>
      ))}
    </motion.nav>
  )
}
