'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './modal';
import { PrimaryButton, SecondaryButton } from './index';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'warning',
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-destructive';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getButtonVariant = () => {
    return type === 'danger' ? 'destructive' : 'default';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading}
            className={type === 'danger' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isSubmitting ? 'Processing...' : confirmText}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex gap-4">
        <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${getIconColor()}`} />
        <div>
          <p className="text-foreground">{description}</p>
        </div>
      </div>
    </Modal>
  );
};
