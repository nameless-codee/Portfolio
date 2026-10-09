import { HeroNav } from "./HeroNav"
import { HeroSocials } from "./HeroSocials"
import { HeroPortrait } from "./HeroPortrait"
import { HeroName } from "./HeroName"
import { LiquidLayer } from "./LiquidLayer"
import { circleOrigin, drawBackground, drawCircle, drawForeground } from "./layers"

export function HeroSection() {
  return (
    <section id="home" className="min-h-svh bg-hero-cream p-3 md:p-6">
      {/* Cream until the back layer's liquid reveal paints the orange panel in */}
      <div className="relative h-[calc(100svh-1.5rem)] overflow-hidden rounded-lg bg-hero-cream md:h-[calc(100svh-3rem)]">
        {/* z-0   distorted: orange panel + dots */}
        <LiquidLayer
          draw={drawBackground}
          className="absolute inset-0 z-0"
          revealDelay={0.1}
          fallback="#ff4500"
        />

        {/* z-[5] distorted: cream circle – grows in from its own center */}
        <LiquidLayer
          draw={drawCircle}
          className="absolute inset-0 z-[5]"
          revealDelay={0.5}
          duration={1.6}
          grow={0.5}
          origin={circleOrigin}
        />

        {/* z-10  NOT distorted: the portrait */}
        <HeroPortrait />

        {/* z-20  distorted: name + nav labels + social icons */}
        <LiquidLayer draw={drawForeground} className="absolute inset-0 z-20" revealDelay={1.0} />

        {/* z-30  invisible-but-real DOM: links, focus, tooltips, screen readers */}
        <HeroName />
        <HeroNav />
        <HeroSocials />
      </div>
    </section>
  )
}
