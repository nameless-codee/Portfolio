import { motion } from "framer-motion"
import bulb from "@/assets/about/bulb.png"
import { ABOUT_COPY, ABOUT_ORDER } from "@/data/about"

/** Small screens: the shaped layout would make the text unreadably small, so use simple cards. */
export function AboutStacked() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <img src={bulb} alt="" className="mx-auto h-28 w-auto select-none" draggable={false} />

      {ABOUT_ORDER.map((id, i) => (
        <motion.article
          key={id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="dots-orange rounded-2xl bg-hero-orange p-6 text-white"
        >
          <h2 className="font-magnu text-5xl font-normal uppercase leading-none">{ABOUT_COPY[id].title}</h2>
          <p className="mt-4 font-roadrage text-2xl leading-snug">{ABOUT_COPY[id].body}</p>
        </motion.article>
      ))}
    </div>
  )
}
