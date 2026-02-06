import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { triggerSelectionHaptic } from "@/lib/haptics"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm hover:shadow-md",
                destructive:
                    "bg-[var(--color-error)] text-white hover:bg-red-800 shadow-sm",
                outline:
                    "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]",
                secondary:
                    "bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]/80",
                ghost: "hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                link: "text-[var(--color-accent)] underline-offset-4 hover:underline",
                data: "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-11 rounded-[var(--radius-button)] px-4",
                lg: "h-14 rounded-[var(--radius-button)] px-10 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, onClick, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    if (!props.disabled && !isLoading) {
                        void triggerSelectionHaptic();
                    }
                    onClick?.(event);
                }}
                {...props}
            >
                {/* Don't render Loader2 when asChild - Slot requires exactly one child */}
                {!asChild && isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
