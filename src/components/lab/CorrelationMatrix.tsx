'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2, FlaskConical, PlusCircle } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/Tooltip';
import { fetcher } from '@/lib/hooks';

interface Variable {
    id: string;
    name: string;
    habitName: string;
    habitIcon: string;
}

interface CorrelationData {
    variables: Variable[];
    matrix: (number | null)[][];
}



/**
 * Get color for correlation value
 * Teal = positive, Amber = negative, Warm gray = neutral/no data
 */
function getCorrelationColor(r: number | null): string {
    if (r === null) return 'bg-[var(--color-bg-subtle)]';

    const absR = Math.abs(r);
    if (r > 0) {
        // Positive: teal shades
        if (absR >= 0.7) return 'bg-teal-700 text-white';
        if (absR >= 0.5) return 'bg-teal-600 text-white';
        if (absR >= 0.3) return 'bg-teal-400 text-white';
        return 'bg-teal-200 text-teal-900';
    } else {
        // Negative: amber shades
        if (absR >= 0.7) return 'bg-amber-700 text-white';
        if (absR >= 0.5) return 'bg-amber-600 text-white';
        if (absR >= 0.3) return 'bg-amber-400 text-white';
        return 'bg-amber-200 text-amber-900';
    }
}

interface CorrelationMatrixProps {
    onCellClick?: (var1Id: string, var2Id: string, correlation: number | null) => void;
}

export default function CorrelationMatrix({ onCellClick }: CorrelationMatrixProps) {
    const { data, isLoading, error } = useSWR<CorrelationData>(
        '/api/correlations',
        fetcher,
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
            dedupingInterval: 120000,
        }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
            </div>
        );
    }

    if (error || !data || (data as any).error) {
        return (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
                {(data as any)?.error || 'Failed to load correlation data'}
            </div>
        );
    }

    if (!data.variables || !Array.isArray(data.variables) || data.variables.length < 2) {
        return (
            <div className="text-center py-12 space-y-4">
                <FlaskConical className="h-12 w-12 mx-auto text-[var(--text-tertiary)] opacity-50" suppressHydrationWarning />
                <div>
                    <p className="text-[var(--text-secondary)] font-medium">Not enough data yet</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Create at least 2 protocols and log data for 14+ days to see correlations.
                    </p>
                </div>
                <Link
                    href="/habits/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[var(--radius-button)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                    <PlusCircle className="h-4 w-4" suppressHydrationWarning />
                    Create Protocol
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-3 text-left text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider w-32 min-w-[120px]">Variable</th>
                        {data.variables.map((variable, i) => (
                            <th
                                key={variable.id}
                                className="p-2 text-center text-xs font-medium text-[var(--text-secondary)] min-w-[80px] max-w-[120px]"
                                title={`${variable.habitIcon} ${variable.habitName}: ${variable.name}`}
                            >
                                <div className="truncate">
                                    {variable.habitIcon} {variable.name}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.variables.map((rowVar, rowIndex) => (
                        <tr key={rowVar.id}>
                            <td
                                className="p-2 text-xs font-medium text-[var(--text-secondary)] truncate max-w-[120px]"
                                title={`${rowVar.habitIcon} ${rowVar.habitName}: ${rowVar.name}`}
                            >
                                {rowVar.habitIcon} {rowVar.name}
                            </td>
                            {data.variables.map((colVar, colIndex) => {
                                const correlation = data.matrix[rowIndex]?.[colIndex];
                                const isDiagonal = rowIndex === colIndex;

                                return (
                                    <td
                                        key={colVar.id}
                                        className={cn(
                                            "p-2 text-center text-xs font-medium transition-all",
                                            isDiagonal
                                                ? "bg-[var(--color-border)] text-[var(--text-tertiary)]"
                                                : getCorrelationColor(correlation),
                                            !isDiagonal && correlation !== null && onCellClick
                                                ? "cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[var(--color-accent)]"
                                                : ""
                                        )}
                                        onClick={() => {
                                            if (!isDiagonal && correlation !== null && onCellClick) {
                                                onCellClick(rowVar.id, colVar.id, correlation);
                                            }
                                        }}
                                        title={
                                            isDiagonal
                                                ? 'Self-correlation'
                                                : correlation !== null
                                                    ? `r = ${correlation.toFixed(2)}`
                                                    : 'Insufficient data'
                                        }
                                    >
                                        {isDiagonal ? '—' : correlation !== null ? correlation.toFixed(2) : '—'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--text-tertiary)] flex-wrap">
                <InfoTooltip text="Values range from -1 to +1. Closer to +1 means both variables increase together. Closer to -1 means when one goes up, the other goes down. Values near 0 mean no relationship." />
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-teal-700 rounded" />
                    <span>Strong +</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-teal-400 rounded" />
                    <span>Moderate +</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-[var(--color-bg-subtle)] rounded" />
                    <span>Weak/None</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-amber-400 rounded" />
                    <span>Moderate −</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-amber-700 rounded" />
                    <span>Strong −</span>
                </div>
            </div>
        </div>
    );
}
