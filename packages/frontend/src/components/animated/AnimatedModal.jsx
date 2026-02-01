/**
 * AnimatedModal Component
 * Modal wrapper with entrance/exit animations using Framer Motion
 * Respects user's reduced motion preferences
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants, backdropVariants } from "../../utils/animations";
import { usePreferencesStore } from "../../stores/usePreferencesStore";

export const AnimatedModal = memo(function AnimatedModal({ isOpen, onClose, children, className = "" }) {
  const prefersReducedMotion = usePreferencesStore(
    (state) => state.prefersReducedMotion,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={prefersReducedMotion ? {} : backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`bg-white rounded-lg shadow-xl max-w-md w-full ${className}`}
              variants={prefersReducedMotion ? {} : modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});
