import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-hover)]",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }
