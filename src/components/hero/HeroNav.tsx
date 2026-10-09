import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/data/hero";
import { fadeSlide, stagger } from "./animations";

export function HeroNav() {
	return (
		<motion.nav
			aria-label="Primary"
			variants={stagger(0.12, 0.5)}
			initial="hidden"
			animate="show"
			className="absolute left-5 top-5 z-30 flex flex-col md:left-8 md:top-7"
		>
			{NAV_ITEMS.map((item) => (
				<motion.a
					key={item.label}
					href={item.href}
					variants={fadeSlide(0, -12)}
					whileHover={{ x: 6 }}
					whileTap={{ scale: 0.97 }}
					className="w-fit font-higher text-4xl uppercase leading-[1.05] text-white md:text-6xl"
				>
					{item.label}
				</motion.a>
			))}
		</motion.nav>
	);
}
