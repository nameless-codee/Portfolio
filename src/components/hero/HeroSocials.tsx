import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SOCIALS } from "@/data/hero"

/**
 * Buttons are real and clickable, but the icon itself is invisible: the front
 * LiquidLayer rasterises each `data-liquid="icon"` svg and draws it distorted.
 */
export function HeroSocials() {
  return (
    <TooltipProvider delayDuration={100}>
      <ul className="absolute right-3 top-5 z-30 flex flex-col gap-1 md:right-6 md:top-7">
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-md hover:bg-transparent focus-visible:ring-white/70 md:size-12"
                >
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon data-liquid="icon" className="size-6 opacity-0 md:size-7" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  )
}
