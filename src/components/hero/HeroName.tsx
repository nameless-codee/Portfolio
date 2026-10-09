import { motion } from "framer-motion";
import { useFitText } from "@/hooks/use-fit-text";

export function HeroName() {
	const { containerRef, textRef } = useFitText<HTMLSpanElement>();

	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-[2%] z-20 px-[2.5%]">
			<motion.h1
				initial={{ y: "40%", opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
				className="m-0"
			>
				<div ref={containerRef} className="w-full">
					<span
						ref={textRef}
						className="hero-name-shadow inline-block whitespace-nowrap font-magnu uppercase leading-[0.8] text-white"
					>
						Manirenkan Keshavan
					</span>
				</div>
			</motion.h1>
		</div>
	);
}
