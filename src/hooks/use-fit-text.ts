import { useLayoutEffect, useRef } from "react";

export function useFitText<T extends HTMLElement>() {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<T>(null);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const text = textRef.current;
		if (!container || !text) return;

		const fit = () => {
			text.style.fontSize = "100px"; // measure at a known size
			const ratio = container.clientWidth / text.getBoundingClientRect().width;
			text.style.fontSize = `${100 * ratio}px`;
		};

		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(container);
		document.fonts.ready.then(fit); // re-fit once the custom font has loaded

		return () => observer.disconnect();
	}, []);

	return { containerRef, textRef };
}
