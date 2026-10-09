import { FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import type { IconType } from "react-icons";

export type NavItem = { label: string; href: string };
export type SocialItem = { label: string; href: string; icon: IconType };

export const NAV_ITEMS: NavItem[] = [
	{ label: "About me", href: "#about" },
	{ label: "Projects", href: "#projects" },
];

// TODO: replace the "#" placeholders with your real profile URLs
export const SOCIALS: SocialItem[] = [
	{ label: "LinkedIn", href: "#", icon: FaLinkedin },
	{ label: "Instagram", href: "#", icon: FaInstagram },
	{ label: "WhatsApp", href: "#", icon: FaWhatsapp },
];
