import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Drawer } from "vaul"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/Calendar"
import { Label } from "@/components/ui/Label"
import { useIsMobile } from "@/hooks/useIsMobile"

export interface DatePickerProps {
    label?: string
    value?: Date | string
    onChange: (date: Date | undefined) => void
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string
    helperText?: string
    minDate?: Date
    maxDate?: Date
    clearable?: boolean
    className?: string
}

export function DatePicker({
    label,
    value,
    onChange,
    placeholder = "Select date",
    required = false,
    disabled = false,
    error,
    helperText,
    minDate,
    maxDate,
    clearable = false,
    className,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const isMobile = useIsMobile()

    // Parse value to Date object if it's a string
    const selectedDate = React.useMemo(() => {
        if (!value) return undefined
        return typeof value === "string" ? new Date(value) : value
    }, [value])


    const handleSelect = (date: Date | undefined) => {
        onChange(date)
        setIsOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(undefined)
    }

    const trigger = (
        <Button
            variant="outlined"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={cn(
                "w-full justify-start text-left font-normal h-10 px-3",
                !selectedDate && "text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive",
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
        >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            <span className="flex-1 truncate">
                {selectedDate ? format(selectedDate, "PPP") : placeholder}
            </span>
            {clearable && selectedDate && !disabled && (
                <X
                    className="ml-2 h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={handleClear}
                />
            )}
        </Button>
    )

    const content = (
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
            }}
            initialFocus
        />
    )

    return (
        <div className="grid w-full items-center gap-1.5">
            {label && (
                <Label className={cn(error && "text-destructive")}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            {isMobile ? (
                <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
                    <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 outline-none">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
                            <div className="p-4 pb-8 flex flex-col items-center">
                                {content}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            ) : (
                <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Content
                        align="start"
                        className="z-50 w-auto rounded-md border bg-card p-0 text-card-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
                        sideOffset={4}
                    >
                        {content}
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Root>
            )}

            {error ? (
                <p className="text-sm font-medium text-destructive">{error}</p>
            ) : (
                helperText && (
                    <p className="text-sm text-muted-foreground">{helperText}</p>
                )
            )}
        </div>
    )
}
