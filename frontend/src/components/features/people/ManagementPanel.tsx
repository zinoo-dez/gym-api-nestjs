import { ReactNode } from "react";

import { SlidePanel } from "@/components/ui/SlidePanel";

interface ManagementPanelProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ManagementPanel({
  open,
  onClose,
  isMobile,
  title,
  description,
  footer,
  className,
  children,
}: ManagementPanelProps) {
  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={title}
      description={description}
      footer={footer}
      className={className}
    >
      {children}
    </SlidePanel>
  );
}
