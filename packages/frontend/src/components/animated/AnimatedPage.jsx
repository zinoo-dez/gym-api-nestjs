/**
 * AnimatedPage Component
 * Wrapper component for page transitions with Framer Motion
 * Respects user's reduced motion preferences
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "../../utils/animations";
import { usePreferencesStore } from "../../stores/usePreferencesStore";

export const AnimatedPage = memo(function AnimatedPage({ children, className = "" }) {
  const prefersReducedMotion = usePreferencesStore(
    (state) => state.prefersReducedMotion,
  );

  // If user prefers reduced motion, render without animations
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
});
