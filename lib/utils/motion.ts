const itemSpringTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const modalSpringTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 25,
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 }
};

export const itemEntry = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: itemSpringTransition,
};

export const modalEntry = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: modalSpringTransition,
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.03 } }
};

export const buttonPress = {
  whileTap: { scale: 0.97 }
};

export const hoverLift = {
  whileHover: { y: -2, boxShadow: "var(--shadow-lg)" }
};
