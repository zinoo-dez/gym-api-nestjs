import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A styled native <select> element.
 *
 * Usage:
 *   <Select value={v} onChange={e => set(e.target.value)}>
 *     <option value="a">A</option>
 *   </Select>
 *
 * Also works with react-hook-form's {...register("field")}.
 */
const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
    <select
        ref={ref}
        className={cn(
            "flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
        )}
        {...props}
    >
        {children}
    </select>
))
Select.displayName = "Select"

export { Select }
