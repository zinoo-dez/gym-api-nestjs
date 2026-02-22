import { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SlidePanel({
  open,
  onClose,
  isMobile,
  title,
  description,
  children,
  footer,
  className,
}: SlidePanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <section
        className={cn(
          "absolute bg-background text-foreground shadow-lg",
          isMobile
            ? "inset-x-0 bottom-0 max-h-[90vh] rounded-t-xl border-t"
            : "inset-y-0 right-0 h-full w-full max-w-2xl border-l",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b px-4 py-4 md:px-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className={cn("overflow-y-auto p-4 md:p-6", footer ? "h-[calc(100%-140px)]" : "h-[calc(100%-74px)]")}>
          {children}
        </div>

        {footer ? <footer className="border-t px-4 py-4 md:px-6">{footer}</footer> : null}
      </section>
    </div>
  );
}
