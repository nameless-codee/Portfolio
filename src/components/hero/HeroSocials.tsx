import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SOCIALS } from "@/data/hero"
import { fadeSlide, stagger } from "./animations"

export function HeroSocials() {
  return (
    <TooltipProvider delayDuration={100}>
      <motion.ul
        variants={stagger(0.1, 0.6)}
        initial="hidden"
        animate="show"
        className="absolute right-3 top-5 z-30 flex flex-col gap-1 md:right-6 md:top-7"
      >
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <motion.li key={label} variants={fadeSlide(0, -12)}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-md text-white hover:bg-white/15 hover:text-white md:size-12"
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
