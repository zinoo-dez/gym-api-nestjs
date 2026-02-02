import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "../common";

/**
 * ConfirmDialog Component
 * Modal for confirming destructive actions
 */
export const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-morphism rounded-3xl p-8 max-w-md w-full border border-white/10"
        >
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              variant === "danger" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
            }`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">
              {title}
            </h3>
            <p className="text-sm text-gray-400 mb-8">
              {message}
            </p>

            <div className="flex gap-3">
              <SecondaryButton
                onClick={onClose}
                className="flex-1"
              >
                {cancelText}
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 ${variant === "danger" ? "!bg-red-600 hover:!bg-red-700" : ""}`}
              >
                {confirmText}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
