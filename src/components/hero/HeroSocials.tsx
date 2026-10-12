import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SOCIALS } from "@/data/hero"

const ease = [0.22, 1, 0.36, 1] as const

/** Plain, crisp DOM icons – deliberately NOT part of the liquid distortion layers. */
export function HeroSocials() {
  return (
    <TooltipProvider delayDuration={100}>
      <motion.ul
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 1.2 } } }}
        className="absolute right-3 top-5 z-30 flex flex-col gap-1 md:right-6 md:top-7"
      >
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <motion.li
            key={label}
            variants={{
              hidden: { opacity: 0, y: -12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-md text-white hover:bg-transparent hover:text-white focus-visible:ring-white/70 md:size-12"
                >
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon className="size-6 md:size-7" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          </motion.li>
        ))}
      </motion.ul>
    </TooltipProvider>
  )
}
