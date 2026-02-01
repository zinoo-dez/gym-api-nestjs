import { useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants, backdropVariants } from "../../utils/animations";
import { usePreferencesStore } from "../../stores/usePreferencesStore";

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  const prefersReducedMotion = usePreferencesStore(
    (state) => state.prefersReducedMotion,
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      // Focus the modal when it opens
      const modalElement = document.querySelector('[role="dialog"]');
      if (modalElement) {
        // Store the previously focused element
        const previouslyFocused = document.activeElement;
        
        // Focus the modal
        modalElement.focus();
        
        // Return focus when modal closes
        return () => {
          if (previouslyFocused && previouslyFocused.focus) {
            previouslyFocused.focus();
          }
        };
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            variants={prefersReducedMotion ? {} : backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          ></motion.div>

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}
              variants={prefersReducedMotion ? {} : modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 border-b">
                  <h3
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                    aria-label="Close modal"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-4">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-2 p-4 border-t">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
});
