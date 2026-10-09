import { motion } from "framer-motion"
import portrait from "@/assets/portrait.png"

/** Plain, crisp portrait – intentionally excluded from the liquid effect. */
export function HeroPortrait() {
  return (
    <div className="absolute bottom-0 left-1/2 z-10 h-[90%] -translate-x-1/2">
      <motion.img
        src={portrait}
        alt="Portrait of Manirenkan Keshavan"
        draggable={false}
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-auto max-w-none select-none object-contain object-bottom"
      />
    </div>
  )
}
