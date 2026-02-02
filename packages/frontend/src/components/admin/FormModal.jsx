import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "../common";

/**
 * FormModal Component
 * Modal wrapper for forms
 */
export const FormModal = memo(function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  size = "md",
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative glass-morphism rounded-3xl p-8 w-full ${sizeClasses[size]} border border-white/10 my-8`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={onSubmit}>
            <div className="mb-8">
              {children}
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <SecondaryButton
                type="button"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                {cancelText}
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {submitText}
              </PrimaryButton>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
