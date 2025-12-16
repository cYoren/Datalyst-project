'use client';

import { DataDashboard } from '@/components/data/DataDashboard';
import { BarChart3, Loader2 } from 'lucide-react';
import { useDataPage, useUser } from '@/lib/hooks';

export default function DataPage() {
    const { user, isLoading: userLoading } = useUser();
    const { habits, entries, isLoading: dataLoading } = useDataPage();

    const isLoading = userLoading || dataLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div className="space-y-8 pb-20">
                <header className="animate-fade-in">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-[var(--color-accent)]" suppressHydrationWarning />
                        Data Insights
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-lg">
                        Visualize your habit progress in tables and charts.
                    </p>
                </header>

                <div className="animate-slide-up border border-dashed border-[var(--color-border)] rounded-[var(--radius-card)] p-12 text-center bg-[var(--color-bg-card)]">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="h-24 w-24 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="h-10 w-10 text-[var(--text-tertiary)]" suppressHydrationWarning />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            Your data will appear here
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            As soon as you start logging your habits, we will generate detailed charts and tables for you to track your progress.
                        </p>

                        {/* Mock Graph Preview */}
                        <div className="mt-8 p-6 bg-[var(--color-bg-page)] rounded-xl border border-[var(--color-border)] opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-end justify-between h-32 gap-2">
                                {[40, 70, 45, 90, 60, 80, 95].map((h, i) => (
                                    <div key={i} className="w-full bg-[var(--color-accent)] rounded-t-sm" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mt-4 font-mono">Visualization example</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 text-[var(--color-accent)]" suppressHydrationWarning />
                    Data Insights
                </h1>
                <p className="text-[var(--text-secondary)] mt-2 text-lg">
                    Visualize your habit progress in tables and charts.
                </p>
            </header>

            <div className="animate-slide-up">
                <DataDashboard habits={habits} entries={entries} />
            </div>
        </div>
    );
}
