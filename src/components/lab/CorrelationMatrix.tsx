'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Get color for correlation value
 * Green = positive, Red = negative, Gray = neutral/no data
 */
function getCorrelationColor(r: number | null): string {
    if (r === null) return 'bg-gray-100';

    const absR = Math.abs(r);
    if (r > 0) {
        // Positive: green shades
        if (absR >= 0.7) return 'bg-green-600 text-white';
        if (absR >= 0.5) return 'bg-green-500 text-white';
        if (absR >= 0.3) return 'bg-green-400 text-white';
        return 'bg-green-200 text-green-800';
    } else {
        // Negative: red shades
        if (absR >= 0.7) return 'bg-red-600 text-white';
        if (absR >= 0.5) return 'bg-red-500 text-white';
        if (absR >= 0.3) return 'bg-red-400 text-white';
        return 'bg-red-200 text-red-800';
    }
}

interface CorrelationMatrixProps {
    onCellClick?: (var1Id: string, var2Id: string, correlation: number | null) => void;
}

export default function CorrelationMatrix({ onCellClick }: CorrelationMatrixProps) {
    const { data, isLoading, error } = useSWR<CorrelationData>(
        '/api/correlations',
        fetcher,
        { revalidateOnFocus: false }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-8 text-gray-500">
                Failed to load correlation data
            </div>
        );
    }

    if (data.variables.length < 2) {
        return (
            <div className="text-center py-8 text-gray-500">
                Need at least 2 variables with data to show correlations
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 text-left text-xs font-medium text-gray-500 w-32"></th>
                        {data.variables.map((variable, i) => (
                            <th
                                key={variable.id}
                                className="p-2 text-center text-xs font-medium text-gray-600 min-w-[80px] max-w-[120px]"
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
                                className="p-2 text-xs font-medium text-gray-600 truncate max-w-[120px]"
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
                                                ? "bg-gray-200 text-gray-400"
                                                : getCorrelationColor(correlation),
                                            !isDiagonal && correlation !== null && onCellClick
                                                ? "cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-purple-400"
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
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-600 rounded" />
                    <span>Strong +</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-300 rounded" />
                    <span>Moderate +</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <span>Weak/None</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-300 rounded" />
                    <span>Moderate −</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-600 rounded" />
                    <span>Strong −</span>
                </div>
            </div>
        </div>
    );
}
