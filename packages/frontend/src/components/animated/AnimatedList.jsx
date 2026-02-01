/**
 * AnimatedList Component
 * List wrapper with staggered entrance animations for list items
 * Respects user's reduced motion preferences
 */

import { memo } from "react";
import { motion } from "framer-motion";
import {
  listContainerVariants,
  listItemVariants,
} from "../../utils/animations";
import { usePreferencesStore } from "../../stores/usePreferencesStore";

export const AnimatedList = memo(function AnimatedList({ items, renderItem, className = "" }) {
  const prefersReducedMotion = usePreferencesStore(
    (state) => state.prefersReducedMotion,
  );

  return (
    <motion.ul
      className={className}
      variants={prefersReducedMotion ? {} : listContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id || index}
          variants={prefersReducedMotion ? {} : listItemVariants}
        >
          {renderItem(item, index)}
        </motion.li>
      ))}
    </motion.ul>
  );
});
