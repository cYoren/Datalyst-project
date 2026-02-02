import React from 'react';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-pulse">
            <div className="h-10 w-48 bg-[var(--color-bg-subtle)] rounded-xl mb-8" />
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-[var(--color-bg-subtle)] rounded-2xl w-full" />
                ))}
            </div>
        </div>
    );
}
