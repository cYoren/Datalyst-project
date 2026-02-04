'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlaskConical, Check, Loader2, AlertTriangle } from 'lucide-react';

interface ActiveExperimentData {
    experiment: {
        id: string;
        name: string;
        type: string;
        isBlind: boolean;
        independent: { name: string; icon: string; color: string };
        dependent: { name: string; icon: string; color: string };
        startDate: string;
        endDate: string;
    };
    assignment: {
        date: string;
        condition: string;
        blockIndex: number;
        isWashout: boolean;
    } | null;
    hasLoggedToday: boolean;
    conditionLabels: string[];
    todayDate: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

/**
 * Protocol Command Center
 * 
 * Replaces passive habit logging with active protocol execution.
 * Shows the user exactly what to do today and logs compliance, not raw values.
 */
export function ProtocolCommandCenter() {
    const { data, error, isLoading, mutate } = useSWR<ActiveExperimentData>(
        '/api/experiments/active-assignment',
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 30000,
            keepPreviousData: true,
        }
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // No active experiment = don't render
    if (isLoading) {
        return (
            <Card className="p-6 mb-6 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[var(--color-bg-subtle)]" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-[var(--color-bg-subtle)] rounded" />
                        <div className="h-3 w-24 bg-[var(--color-bg-subtle)] rounded" />
                    </div>
                </div>
            </Card>
        );
    }

    if (error || !data?.experiment || !data?.assignment) {
        return null; // No active experiment
    }

    const { experiment, assignment, hasLoggedToday, conditionLabels } = data;

    // Calculate day number
    const startDate = new Date(experiment.startDate);
    const today = new Date(data.todayDate);
    const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const endDate = new Date(experiment.endDate);
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Determine condition type
    const isWashout = assignment.isWashout;
    // Find the index of the current condition in conditionLabels
    const conditionIndex = conditionLabels.findIndex(
        (label, i) => assignment.condition === String.fromCharCode(65 + i) || assignment.condition === label
    );
    // First condition (index 0) is considered the "intervention" (primary treatment)
    // All other conditions are variants/controls
    const isIntervention = conditionIndex === 0;
    const currentConditionLabel = conditionLabels[conditionIndex] || assignment.condition;
    const conditionLabel = experiment.isBlind
        ? (isWashout ? 'Washout' : `Condition ${conditionIndex + 1}`)
        : (isWashout ? 'Washout' : currentConditionLabel);

    // Visual config based on condition
    // For multi-arm: first condition gets intervention style, others get control style
    const visualConfig = isWashout
        ? {
            emoji: '💧',
            title: 'WASHOUT DAY',
            subtitle: 'No intervention - let your system reset',
            bgColor: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-800',
            ringColor: 'ring-amber-500/30',
        }
        : isIntervention
            ? {
                emoji: '💊',
                title: experiment.isBlind ? 'INTERVENTION DAY' : `${currentConditionLabel.toUpperCase()}`,
                subtitle: `Follow your ${experiment.independent.name} protocol (${currentConditionLabel}) today`,
                bgColor: 'bg-emerald-50 border-emerald-200',
                textColor: 'text-emerald-800',
                ringColor: 'ring-emerald-500/30',
            }
            : {
                emoji: conditionLabels.length > 2 ? '🔄' : '🚫',
                title: experiment.isBlind ? `VARIANT DAY` : `${currentConditionLabel.toUpperCase()}`,
                subtitle: conditionLabels.length > 2
                    ? `Follow condition: ${currentConditionLabel}`
                    : `Do NOT take ${experiment.independent.name} today`,
                bgColor: conditionLabels.length > 2 ? 'bg-blue-50 border-blue-200' : 'bg-rose-50 border-rose-200',
                textColor: conditionLabels.length > 2 ? 'text-blue-800' : 'text-rose-800',
                ringColor: conditionLabels.length > 2 ? 'ring-blue-500/30' : 'ring-rose-500/30',
            };

    const handleCompliance = async (followed: boolean) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Value: 1 = took intervention, 0 = did not take
            // If followed=true, log the expected value
            // If followed=false, log the opposite value
            const expectedValue = isIntervention ? 1 : 0;
            const actualValue = followed ? expectedValue : (1 - expectedValue);

            const res = await fetch('/api/experiments/log-compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experimentId: experiment.id,
                    followedAssignment: followed,
                    numericValue: actualValue,
                    date: data.todayDate,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to log compliance');
            }

            // Refresh data
            await mutate();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card
            className={cn(
                "p-6 mb-6 border-2 transition-all duration-300",
                visualConfig.bgColor,
                `ring-2 ${visualConfig.ringColor}`
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <FlaskConical className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">
                            {experiment.name}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Day {dayNumber} of {totalDays}
                        </p>
                    </div>
                </div>

                {/* Condition Badge */}
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                    visualConfig.bgColor,
                    visualConfig.textColor
                )}>
                    {conditionLabel}
                </div>
            </div>

            {/* Main Instruction */}
            <div className="text-center py-6">
                <div className="text-6xl mb-4">
                    {visualConfig.emoji}
                </div>
                <h3 className={cn(
                    "text-2xl font-bold mb-2",
                    visualConfig.textColor
                )}>
                    {visualConfig.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
                    {visualConfig.subtitle}
                </p>
            </div>

            {/* Action Buttons */}
            {hasLoggedToday ? (
                <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                    <Check className="h-5 w-5 text-[var(--color-success)]" />
                    <span className="font-medium text-[var(--color-success)]">
                        Logged for today
                    </span>
                </div>
            ) : (
                <div className="space-y-3">
                    {submitError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleCompliance(true)}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="h-5 w-5 mr-2" />
                                    I Followed Instructions
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={() => handleCompliance(false)}
                            disabled={isSubmitting}
                            variant="outline"
                            className="flex-1 py-4 border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    I Slipped Up
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-[var(--text-tertiary)]">
                        Your response is logged automatically. Be honest — it helps the science.
                    </p>
                </div>
            )}
        </Card>
    );
}

export default ProtocolCommandCenter;
