import { HeroSection } from "@/components/hero/HeroSection";
import { AboutSection } from "@/components/about/AboutSection";
import { CustomCursor } from "@/components/CustomCursor";

export default function App() {
	return (
		<>
			<main>
				<HeroSection />
				<AboutSection />
			</main>
			<CustomCursor />
		</>
	);
}
