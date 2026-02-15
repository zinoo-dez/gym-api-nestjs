export const animateUiTransitions = {
  gentleSpring: { type: "spring", stiffness: 260, damping: 24 },
  quickEase: { duration: 0.24, ease: [0.2, 0, 0, 1] as const },
} as const;

export const animateUiVariants = {
  pageEnter: { opacity: 0, y: 16, filter: "blur(4px)" },
  pageVisible: { opacity: 1, y: 0, filter: "blur(0px)" },
  pageExit: { opacity: 0, y: -10, filter: "blur(2px)" },
} as const;
