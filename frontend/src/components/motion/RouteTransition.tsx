import { ReactNode } from "react";
import { motion } from "framer-motion";
import { animateUiTransitions, animateUiVariants } from "@/components/animate-ui/motion-presets";

export const RouteTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={animateUiVariants.pageEnter}
      animate={animateUiVariants.pageVisible}
      exit={animateUiVariants.pageExit}
      transition={animateUiTransitions.quickEase}
    >
      {children}
    </motion.div>
  );
};
