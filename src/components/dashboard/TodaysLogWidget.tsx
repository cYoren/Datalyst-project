'use client';

import React, { useState, useCallback } from 'react';
import { useTodaysLog, TodayVariable } from '@/lib/useTodaysLog';
import { Card } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import { Check, Loader2, FlaskConical, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

// Intervention Banner Component for active experiments
const InterventionBanner = ({ assignment }: { assignment: TodayVariable['activeAssignment'] }) => {
    if (!assignment) return null;

    const isWashout = assignment.isWashout;
    const isIntervention = assignment.condition === 'A'; // Typically A = intervention

    const label = isWashout
        ? '💧 Washout Day - No intervention'
        : isIntervention
            ? `💊 ${assignment.conditionLabel || 'Intervention'} Today`
            : `🚫 ${assignment.conditionLabel || 'Control'} - Avoid Today`;

    const bgColor = isWashout
        ? 'bg-amber-500/10 border-amber-500/30'
        : isIntervention
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-rose-500/10 border-rose-500/30';

    const textColor = isWashout
        ? 'text-amber-700'
        : isIntervention
            ? 'text-emerald-700'
            : 'text-rose-700';

    return (
        <div className={cn(
            "mb-3 px-3 py-2 rounded-lg border-2 flex items-center gap-2",
            bgColor
        )}>
            <FlaskConical className={cn("h-4 w-4", textColor)} />
            <span className={cn("text-xs font-bold uppercase tracking-wide", textColor)}>
                {label}
            </span>
        </div>
    );
};

// Compliance Toggle Component
const ComplianceToggle = ({
    checked,
    onChange,
    disabled
}: {
    checked: boolean | null;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}) => {
    return (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <label className="flex items-center gap-2 cursor-pointer">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(!checked)}
                    className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        checked
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-[var(--color-border)] hover:border-emerald-500"
                    )}
                >
                    {checked && <Check className="h-3 w-3" />}
                </button>
                <span className="text-xs text-[var(--text-secondary)]">
                    I followed the protocol today
                </span>
            </label>
        </div>
    );
};

// Inline variable item component
interface VariableItemProps {
    variable: TodayVariable;
    onLog: (value: number, rawValue?: string, followedAssignment?: boolean) => Promise<void>;
    isLogging: boolean;
    isOptimisticLogged?: boolean;
}

const VariableItem = ({ variable, onLog, isLogging, isOptimisticLogged = false }: VariableItemProps) => {
    const [localValue, setLocalValue] = useState<number>(
        variable.todayEntry?.numericValue ?? (variable.type === 'SCALE_0_10' ? 5 : 0)
    );
    const [followedProtocol, setFollowedProtocol] = useState<boolean | null>(null);
    const isLogged = !!variable.todayEntry || isOptimisticLogged;
    const hasActiveExperiment = !!variable.activeAssignment;

    const handleBooleanClick = async (value: number) => {
        setLocalValue(value);
        await onLog(value, value === 1 ? 'Yes' : 'No', hasActiveExperiment ? followedProtocol ?? undefined : undefined);
    };

    const handleNumericSubmit = async () => {
        await onLog(localValue, undefined, hasActiveExperiment ? followedProtocol ?? undefined : undefined);
    };

    const handleSliderChange = (value: number) => {
        setLocalValue(value);
    };

    const handleSliderCommit = async () => {
        await onLog(localValue, undefined, hasActiveExperiment ? followedProtocol ?? undefined : undefined);
    };

    return (
        <div
            className={cn(
                "p-4 rounded-xl transition-all duration-300",
                hasActiveExperiment
                    ? "ring-2 ring-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20"
                    : isLogged
                        ? "bg-[var(--color-success)]/5 border border-[var(--color-success)]/20"
                        : "bg-[var(--color-bg-subtle)] border border-transparent hover:border-[var(--color-border)]"
            )}
        >
            {/* Intervention Banner for active experiments */}
            {hasActiveExperiment && <InterventionBanner assignment={variable.activeAssignment} />}

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="text-lg"
                        style={{ filter: isLogged ? 'grayscale(0)' : 'grayscale(0.5)' }}
                    >
                        {variable.habitIcon}
                    </span>
                    <div className="flex flex-col">
                        <span className={cn(
                            "font-medium text-sm",
                            isLogged ? "text-[var(--color-success)]" : "text-[var(--text-primary)]"
                        )}>
                            {variable.name}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                            {variable.habitName}
                        </span>
                    </div>
                </div>

                {isLogging ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
                ) : isLogged ? (
                    <div className="flex items-center gap-1 text-[var(--color-success)] text-xs font-medium">
                        <Check className="h-4 w-4" />
                        <span>Logged</span>
                    </div>
                ) : (
                    variable.unit && (
                        <span className="text-xs text-[var(--text-tertiary)] bg-[var(--color-bg-card)] px-2 py-1 rounded-full">
                            {variable.unit}
                        </span>
                    )
                )}
            </div>

            {/* Input Controls */}
            {variable.type === 'BOOLEAN' && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleBooleanClick(1)}
                        disabled={isLogging}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg transition-all font-medium text-sm border-2",
                            isLogged && localValue === 1
                                ? "bg-[var(--color-success)] text-white border-transparent"
                                : localValue === 1
                                    ? "bg-[var(--color-accent)] text-white border-transparent"
                                    : "bg-white border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--color-accent)]"
                        )}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        onClick={() => handleBooleanClick(0)}
                        disabled={isLogging}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg transition-all font-medium text-sm border-2",
                            isLogged && localValue === 0
                                ? "bg-[var(--color-success)] text-white border-transparent"
                                : localValue === 0 && variable.todayEntry
                                    ? "bg-[var(--text-tertiary)] text-white border-transparent"
                                    : "bg-white border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
                        )}
                    >
                        No
                    </button>
                </div>
            )}

            {variable.type === 'SCALE_0_10' && (
                <div className="space-y-2">
                    <Slider
                        value={localValue}
                        onChange={handleSliderChange}
                        min={0}
                        max={10}
                        labels={variable.metadata?.labels}
                    />
                    {!isLogged && (
                        <button
                            onClick={handleSliderCommit}
                            disabled={isLogging}
                            className="w-full py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                        >
                            Log Value
                        </button>
                    )}
                </div>
            )}

            {variable.type === 'NUMERIC' && (
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={localValue || ''}
                        onChange={(e) => setLocalValue(parseFloat(e.target.value) || 0)}
                        step={variable.metadata?.step || 1}
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-center font-medium focus:outline-none focus:border-[var(--color-accent)]"
                        placeholder="0"
                    />
                    <button
                        onClick={handleNumericSubmit}
                        disabled={isLogging}
                        className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                        {isLogged ? 'Update' : 'Log'}
                    </button>
                </div>
            )}

            {/* Compliance Toggle for active experiments */}
            {hasActiveExperiment && !isLogged && (
                <ComplianceToggle
                    checked={followedProtocol}
                    onChange={setFollowedProtocol}
                    disabled={isLogging}
                />
            )}
        </div>
    );
};

// Main Widget Component
export const TodaysLogWidget = () => {
    const { summary, isLoading, logVariable } = useTodaysLog();
    const [loggingIds, setLoggingIds] = useState<Set<string>>(new Set());
    const [optimisticLoggedIds, setOptimisticLoggedIds] = useState<Set<string>>(new Set());
    const [isCollapsed, setIsCollapsed] = useState(false);
    const handleLog = useCallback(async (
        habitId: string,
        subvariableId: string,
        numericValue: number,
        rawValue?: string,
        followedAssignment?: boolean
    ) => {
        setLoggingIds(prev => new Set(prev).add(subvariableId));
        setOptimisticLoggedIds(prev => new Set(prev).add(subvariableId)); // Instant optimistic update

        await logVariable(habitId, subvariableId, numericValue, rawValue, followedAssignment);

        setLoggingIds(prev => {
            const next = new Set(prev);
            next.delete(subvariableId);
            return next;
        });

        // We keep it in optimisticLoggedIds until real data arrives, 
        // effectively it stays "green" seamlessly.
    }, [logVariable]);

    // Group variables by time block - MUST be before any conditional return
    // Filter out independent variables (managed by ProtocolCommandCenter)
    const groupedVariables = React.useMemo(() => {
        const groups: Record<string, TodayVariable[]> = {
            'MORNING': [],
            'AFTERNOON': [],
            'EVENING': [],
            'ANYTIME': []
        };

        // Filter out variables that are the independent variable in an active experiment
        // Those are managed by ProtocolCommandCenter, not this widget
        const filteredVariables = summary.variables.filter(v => !v.isExperimentIndependent);

        filteredVariables.forEach(variable => {
            const block = variable.timeBlock || 'ANYTIME';
            if (!groups[block]) groups[block] = [];
            groups[block].push(variable);
        });

        return groups;
    }, [summary.variables]);

    // Check if any variable has an active experiment
    const hasActiveExperiment = summary.variables.some(v => !!v.activeAssignment);

    const getBlockLabel = (block: string) => {
        switch (block) {
            case 'MORNING': return 'Morning';
            case 'AFTERNOON': return 'Afternoon';
            case 'EVENING': return 'Evening';
            case 'ANYTIME': return 'Anytime';
            default: return 'Anytime';
        }
    };

    const getBlockIcon = (block: string) => {
        switch (block) {
            case 'MORNING': return '🌅';
            case 'AFTERNOON': return '☀️';
            case 'EVENING': return '🌙';
            case 'ANYTIME': return '⏰';
            default: return '⏰';
        }
    };

    // Don't render if no variables - AFTER all hooks are called
    if (!isLoading && summary.variables.length === 0) {
        return null;
    }

    // Simplified positioning - always sticky
    return (
        <Card
            className={cn(
                "z-20 p-0 overflow-hidden shadow-lg border-0 bg-white/95 backdrop-blur-sm transition-all duration-300",
                "rounded-[var(--radius-card)]",
                hasActiveExperiment && "ring-2 ring-[var(--color-accent)]/20"
            )}
        >
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--color-bg-subtle)]/50 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br",
                        hasActiveExperiment
                            ? "from-purple-500 to-pink-500"
                            : "from-[var(--color-accent)] to-[var(--color-accent-hover)]"
                    )}>
                        <FlaskConical className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">
                            Today's Log
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {isLoading ? 'Loading...' : `${summary.logged + optimisticLoggedIds.size}/${summary.total} logged`}
                            {hasActiveExperiment && (
                                <span className="ml-2 text-xs text-[var(--color-accent)] font-medium">
                                    • Experiment Active
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress Ring */}
                    {!isLoading && (
                        <div className="relative h-10 w-10">
                            <svg className="h-10 w-10 -rotate-90">
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    fill="none"
                                    stroke="var(--color-bg-subtle)"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    fill="none"
                                    stroke={summary.percentage === 100 ? 'var(--color-success)' : 'var(--color-accent)'}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${((summary.logged + optimisticLoggedIds.size) / summary.total) * 100.5} 100.5`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                                {Math.min(100, Math.round(((summary.logged + optimisticLoggedIds.size) / summary.total) * 100))}%
                            </span>
                        </div>
                    )}

                    {isCollapsed ? (
                        <ChevronDown className="h-5 w-5 text-[var(--text-tertiary)]" />
                    ) : (
                        <ChevronUp className="h-5 w-5 text-[var(--text-tertiary)]" />
                    )}
                </div>
            </div>

            {/* Variables List */}
            {!isCollapsed && (
                <div className="px-4 pb-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1">
                            {Object.entries(groupedVariables).map(([block, variables]) => {
                                if (variables.length === 0) return null;
                                return (
                                    <div key={block} className="space-y-3">
                                        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-2 pl-1">
                                            <span>{getBlockIcon(block)}</span>
                                            <span>{getBlockLabel(block)}</span>
                                        </h3>
                                        <div className="grid gap-3">
                                            {variables.map((variable) => (
                                                <VariableItem
                                                    key={variable.id}
                                                    variable={variable}
                                                    onLog={(value, rawValue, followedAssignment) => handleLog(
                                                        variable.habitId,
                                                        variable.id,
                                                        value,
                                                        rawValue,
                                                        followedAssignment
                                                    )}
                                                    isLogging={loggingIds.has(variable.id)}
                                                    isOptimisticLogged={optimisticLoggedIds.has(variable.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Completion Celebration */}
            {summary.percentage === 100 && !isCollapsed && (
                <div className="px-4 pb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-[var(--color-success)]/10 to-[var(--color-accent)]/10 border border-[var(--color-success)]/20 text-center">
                        <span className="text-sm font-medium text-[var(--color-success)]">
                            🎉 All logged for today!
                        </span>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default TodaysLogWidget;
