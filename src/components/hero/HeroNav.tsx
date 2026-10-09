import { NAV_ITEMS } from "@/data/hero"

/**
 * Transparent text: the front LiquidLayer draws the visible (distorted) labels
 * from each link's position and font, so keep `data-liquid="text"`.
 */
export function HeroNav() {
  return (
    <nav
      aria-label="Primary"
      className="absolute left-5 top-5 z-30 flex flex-col md:left-8 md:top-7"
    >
      {NAV_ITEMS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          data-liquid="text"
          className="w-fit select-none font-higher text-4xl uppercase leading-[1.05] text-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:text-6xl"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
