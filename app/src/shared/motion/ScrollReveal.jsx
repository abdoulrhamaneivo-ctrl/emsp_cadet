import { motion, useReducedMotion } from "framer-motion";

/**
 * Révélation au scroll directionnelle (doc 03 §7 règle 3).
 * @param {"up"|"left"|"right"|"scale"} direction="up"
 * @param {boolean} once=true — false = rejoue au scroll arrière
 */
export default function ScrollReveal({
  children,
  direction = "up",
  once = true,
  delay = 0,
  className,
  ...rest
}) {
  const reduced = useReducedMotion();

  const depart = {
    up: { opacity: 0, y: 24 },
    left: { opacity: 0, x: -24 },
    right: { opacity: 0, x: 24 },
    scale: { opacity: 0, scale: 0.94 },
  }[direction];

  const arrivee = {
    up: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
    scale: { opacity: 1, scale: 1 },
  }[direction];

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, margin: "-80px" }}
        transition={{ duration: 0.12 }}
        className={className}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={depart}
      whileInView={arrivee}
      viewport={{ once, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
