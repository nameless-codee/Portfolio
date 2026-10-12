import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const

const slide = (from: string, to: string): Variants => ({
  rest: { y: from, transition: { duration: 0.45, ease } },
  hover: { y: to, transition: { duration: 0.45, ease } },
})

type Props = Omit<ComponentPropsWithoutRef<typeof motion.a>, "children"> & {
  icon: IconType
  iconClassName?: string
}

/**
 * Icon link with the same roll hover as RollingLink: the icon slides out, a copy slides in.
 * forwardRef matters: shadcn's Button/Tooltip (Radix `asChild`) pass a ref and handlers down to this.
 */
export const RollingIcon = forwardRef<HTMLAnchorElement, Props>(function RollingIcon(
  { icon: Icon, iconClassName, className, ...rest },
  ref
) {
  const reduceMotion = useReducedMotion()
  const size = cn("size-6 md:size-7", iconClassName)

  if (reduceMotion) {
    return (
      <motion.a ref={ref} className={cn("transition-opacity hover:opacity-70", className)} {...rest}>
        <Icon className={size} />
      </motion.a>
    )
  }

  return (
    <motion.a
      ref={ref}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={className}
      {...rest}
    >
      <span className={cn("relative block overflow-hidden", size)}>
        <motion.span variants={slide("0%", "-110%")} className="block size-full">
          <Icon className="size-full" />
        </motion.span>
        <motion.span variants={slide("110%", "0%")} className="absolute inset-0 block">
          <Icon className="size-full" />
        </motion.span>
      </span>
    </motion.a>
  )
})
