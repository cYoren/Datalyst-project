'use client';

import React from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlaskConical, CheckCircle2, Circle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import Link from 'next/link';
import { fetcher } from '@/lib/hooks';



export default function ActiveTrialWidget() {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { data, error, isLoading, mutate } = useSWR(`/api/experiments/active-assignment?date=${todayStr}`, fetcher);

    if (isLoading) {
        return (
            <Card className="p-6 flex items-center justify-center animate-pulse border-dashed border-2">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)] opacity-50" />
            </Card>
        );
    }

    if (error || !data || !data.experiment) {
        return null; // Don't show if no active experiment
    }

    const { experiment, assignment, hasLoggedToday, conditionLabels } = data;

    // Progress calculation
    const start = parseISO(experiment.startDate);
    const end = parseISO(experiment.endDate);
    const today = parseISO(todayStr);
    const totalDays = differenceInDays(end, start) + 1;
    const currentDay = Math.min(Math.max(differenceInDays(today, start) + 1, 1), totalDays);
    const progressPct = (currentDay / totalDays) * 100;

    const isWashout = assignment?.isWashout;
    const condition = assignment?.condition; // e.g. "A" or "B"

    // Blinding logic
    const isObservational = experiment.type === 'OBSERVATIONAL';
    const conditionIndex = conditionLabels?.indexOf(condition) ?? -1;
    const interventionLabel = isObservational
        ? experiment.independent.name
        : experiment.isBlind
            ? `Condition ${conditionIndex >= 0 ? conditionIndex + 1 : condition}`
            : (condition && conditionLabels?.[conditionIndex]) || experiment.independent.name;

    const interventionIcon = experiment.independent.icon;

    return (
        <Card className="relative overflow-hidden group border-none shadow-xl bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-subtle)] p-0">
            {/* Backdrop Glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[var(--color-accent)] opacity-[0.03] blur-3xl group-hover:opacity-[0.07] transition-opacity" />

            <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
                            </span>
                            Live Experiment
                        </div>
                        <h2 className="text-xl font-bold font-display text-[var(--text-primary)] leading-tight">
                            {experiment.name}
                        </h2>
                    </div>
                </div>

                {/* Main Instruction Area */}
                <div className={cn(
                    "flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border transition-all duration-300",
                    isWashout
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20"
                )}>
                    <div className={cn(
                        "p-4 rounded-xl shadow-inner",
                        isWashout ? "bg-amber-500/10" : "bg-[var(--color-accent)]/10"
                    )}>
                        <span className="text-4xl">{isWashout ? '💧' : interventionIcon}</span>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-tight">
                            {isWashout ? 'Adaptation Period' : "Today's Intervention"}
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)] font-display">
                            {isWashout ? 'Clearance / Washout' : interventionLabel}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                            {isWashout
                                ? "Avoid any interventions today to reset your baseline."
                                : experiment.isBlind
                                    ? "Keep your blinding integrity – avoid checking the reveal."
                                    : isObservational
                                        ? `Log your intake for the ${experiment.independent.name} protocol.`
                                        : `Follow the "${interventionLabel}" protocol today.`
                            }
                        </p>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Link href={`/habits/${experiment.independentId}`} className="block">
                            <Button
                                className={cn(
                                    "w-full sm:w-auto h-12 px-6 rounded-xl font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95",
                                    hasLoggedToday
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                        : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                                )}
                            >
                                {hasLoggedToday ? (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Logged
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Log Intake
                                        <ChevronRight className="h-5 w-5" />
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <div className="text-sm font-bold text-[var(--text-primary)]">
                                Day <span className="text-[var(--color-accent)]">{currentDay}</span> of {totalDays}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-medium">
                                Expected to end on {format(parseISO(experiment.endDate), 'MMM dd, yyyy')}
                            </div>
                        </div>
                        <div className="text-xs font-bold text-[var(--color-accent)]">
                            {Math.round(progressPct)}% Complete
                        </div>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-bg-subtle)] rounded-full overflow-hidden shadow-inner border border-[var(--color-border)]">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] transition-all duration-700 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {/* Mini Lab Link */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] opacity-60 hover:opacity-100 transition-opacity">
                    <Link href={`/lab/${experiment.id}`} className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
                        <FlaskConical className="h-3 w-3" />
                        Live Analysis & Insights
                    </Link>
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    i + 1 <= Math.ceil(currentDay / (totalDays / 5))
                                        ? "bg-[var(--color-accent)]"
                                        : "bg-[var(--color-border)]"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
