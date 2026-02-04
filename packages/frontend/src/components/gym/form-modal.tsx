import React from 'react';
import { Modal } from './modal';
import { PrimaryButton, SecondaryButton } from './index';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'md',
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton type="submit" form="form-modal" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Saving...' : submitText}
          </PrimaryButton>
        </>
      }
    >
      <form id="form-modal" onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
};
