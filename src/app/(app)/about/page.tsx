'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Brain, Microscope, LineChart, Sparkles } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <header className="space-y-4 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 bg-[var(--color-bg-subtle)] rounded-full mb-4">
                    <Microscope className="h-8 w-8 text-[var(--color-accent)]" suppressHydrationWarning />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                    Scientist of Yourself
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                    Datalyst is not just a habit tracker. It is a personal laboratory to discover what really works for you.
                </p>
            </header>

            <div className="grid gap-8 max-w-4xl mx-auto">
                <Card className="p-8 border-l-4 border-l-[var(--color-accent)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <LineChart className="h-6 w-6 text-[var(--color-accent)]" suppressHydrationWarning />
                        Correlation, Not Just Consistency
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        Most apps focus on "keeping the streak". We focus on <strong>understanding why</strong>.
                        By tracking variables (like sleep hours, stress levels, caffeine intake) alongside your habits,
                        our algorithms find hidden patterns. You might discover that reading 10 pages a day reduces your anxiety by 20%,
                        or that your focus triples when you work out in the morning.
                    </p>
                </Card>

                <Card className="p-8 border-l-4 border-l-[var(--color-warning)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <Brain className="h-6 w-6 text-[var(--color-warning)]" suppressHydrationWarning />
                        Self-Experimentation
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        We encourage you to treat your life as an experiment. Change one variable, keep the others constant, and observe the results.
                        Datalyst provides the tools to measure the impact of these changes accurately, turning intuition into data.
                    </p>
                </Card>

                <Card className="p-8 border-l-4 border-l-[var(--color-success)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-[var(--color-success)]" suppressHydrationWarning />
                        Your Personal Truth
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        What works for "gurus" might not work for you. We are biologically and psychologically unique.
                        Datalyst helps you build your own instruction manual, based on evidence from your own life, not on generic advice.
                    </p>
                </Card>
            </div>

            <div className="text-center pt-10">
                <p className="text-[var(--text-tertiary)] italic">
                    "What gets measured gets managed." — Peter Drucker
                </p>
            </div>
        </div>
    );
}
