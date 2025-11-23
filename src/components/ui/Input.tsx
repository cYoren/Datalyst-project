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
                        'flex h-10 w-full rounded-lg border border-[var(--color-slate-200)] bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]',
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
