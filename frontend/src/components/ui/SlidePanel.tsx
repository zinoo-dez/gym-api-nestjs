import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/animate-ui/components/radix/sheet";

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
    return (
        <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={cn(
                    isMobile
                        ? "max-h-[90vh] rounded-t-xl"
                        : "h-full w-full max-w-2xl",
                    className,
                )}
            >
                <SheetHeader className="border-b px-4 py-4 md:px-6">
                    <SheetTitle className="text-lg tracking-tight">{title}</SheetTitle>
                    {description ? (
                        <SheetDescription>{description}</SheetDescription>
                    ) : null}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </div>

                {footer ? (
                    <SheetFooter className="border-t px-4 py-4 md:px-6">
                        {footer}
                    </SheetFooter>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
