import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex h-11 w-full rounded-[var(--radius-input)] border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                        error && 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)] focus-visible:border-[var(--color-error)]',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-[var(--color-error)]">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
