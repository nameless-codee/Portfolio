import { motion } from "framer-motion";
import portrait from "@/assets/portrait.png";
import { popIn } from "./animations";

/** Cream circle + black & white cut-out portrait that overlaps its lower edge. */
export function HeroPortrait() {
	return (
		<>
			{/* Circle: sized by whichever is smaller – viewport width or card height */}
			<div className="absolute left-1/2 top-[5%] z-0 aspect-square w-[min(80vw,calc((100svh-3rem)*0.68))] -translate-x-1/2">
				<motion.div
					variants={popIn}
					initial="hidden"
					animate="show"
					className="size-full rounded-full bg-hero-cream"
				/>
			</div>

			{/* Portrait */}
			<div className="absolute bottom-0 left-1/2 z-10 h-[90%] -translate-x-1/2">
				<motion.img
					src={portrait}
					alt="Portrait of Manirenkan Keshavan"
					draggable={false}
					initial={{ opacity: 0, y: 80 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
					className="h-full w-auto max-w-none select-none object-contain object-bottom"
				/>
			</div>
		</>
	);
}
