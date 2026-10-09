import { HeroNav } from "./HeroNav";
import { HeroSocials } from "./HeroSocials";
import { HeroPortrait } from "./HeroPortrait";
import { HeroName } from "./HeroName";

export function HeroSection() {
	return (
		<section id="home" className="min-h-svh bg-hero-cream p-3 md:p-6">
			<div className="hero-dots relative h-[calc(100svh-1.5rem)] overflow-hidden rounded-lg bg-hero-orange md:h-[calc(100svh-3rem)]">
				<HeroNav />
				<HeroSocials />
				<HeroPortrait />
				<HeroName />
			</div>
		</section>
	);
}
