import { useMediaQuery } from "@/hooks/use-media-query"
import { AboutStage } from "./AboutStage"
import { AboutStacked } from "./AboutStacked"

export function AboutSection() {
  // The shape adapts to any aspect ratio, but needs a minimum amount of room to keep the text readable
  const roomy = useMediaQuery("(min-width: 768px) and (min-height: 500px)")

  return roomy ? (
    // Full screen, same inset as the hero card
    <section id="about" className="h-svh bg-paper p-3 md:p-6">
      <AboutStage />
    </section>
  ) : (
    <section id="about" className="bg-paper px-3 py-12 md:px-6 md:py-20">
      <AboutStacked />
    </section>
  )
}
