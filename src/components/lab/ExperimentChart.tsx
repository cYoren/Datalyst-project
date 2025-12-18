'use client';

import React, { useState } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
    date: string;
    independent: number | null;
    dependent: number | null;
}

interface ExperimentChartProps {
    data: ChartDataPoint[];
    independentName: string;
    independentUnit: string;
    dependentName: string;
    dependentUnit: string;
    correlation: number | null;
    correlationType: 'pearson' | 'spearman';
    strength: string;
}

export default function ExperimentChart({
    data,
    independentName,
    independentUnit,
    dependentName,
    dependentUnit,
    correlation,
    correlationType,
    strength,
}: ExperimentChartProps) {
    const [normalized, setNormalized] = useState(false);

    // Calculate min/max for normalization
    const independentValues = data.map(d => d.independent).filter((v): v is number => v !== null);
    const dependentValues = data.map(d => d.dependent).filter((v): v is number => v !== null);

    const indMin = Math.min(...independentValues);
    const indMax = Math.max(...independentValues);
    const depMin = Math.min(...dependentValues);
    const depMax = Math.max(...dependentValues);

    // Normalize function
    const normalize = (value: number | null, min: number, max: number): number | null => {
        if (value === null) return null;
        if (max === min) return 50; // Avoid division by zero
        return ((value - min) / (max - min)) * 100;
    };

    // Transform data for normalized view
    const chartData = normalized
        ? data.map(d => ({
            ...d,
            independent: normalize(d.independent, indMin, indMax),
            dependent: normalize(d.dependent, depMin, depMax),
        }))
        : data;

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get correlation color
    const getCorrelationColor = () => {
        if (correlation === null) return 'text-gray-500';
        if (correlation >= 0.7) return 'text-green-600';
        if (correlation >= 0.3) return 'text-green-500';
        if (correlation >= -0.3) return 'text-gray-500';
        if (correlation >= -0.7) return 'text-red-500';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4">
            {/* Header with Correlation Badge */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn("text-3xl font-bold", getCorrelationColor())}>
                        r = {correlation !== null ? correlation.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm">
                        <div className="font-medium text-[var(--text-primary)]">{strength}</div>
                        <div className="text-[var(--text-tertiary)]">({correlationType})</div>
                    </div>
                </div>

                {/* Normalized Toggle */}
                <button
                    onClick={() => setNormalized(!normalized)}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        normalized
                            ? "bg-purple-100 border-purple-300 text-purple-700"
                            : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    {normalized ? '📊 Normalized View' : '📈 Raw Values'}
                </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-[var(--text-secondary)]">
                        {independentName} {independentUnit && `(${independentUnit})`}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-green-500 rounded-full" />
                    <span className="text-[var(--text-secondary)]">
                        {dependentName} {dependentUnit && `(${dependentUnit})`}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full">
                <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 12 }}
                            stroke="#3b82f6"
                            label={{
                                value: normalized ? '%' : independentUnit,
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 12, fill: '#3b82f6' },
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            stroke="#22c55e"
                            label={{
                                value: normalized ? '%' : dependentUnit,
                                angle: 90,
                                position: 'insideRight',
                                style: { fontSize: 12, fill: '#22c55e' },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            formatter={(value: any, name: string) => {
                                if (value === null) return ['No data', name];
                                return [
                                    `${value.toFixed(1)}${normalized ? '%' : ''}`,
                                    name === 'independent' ? independentName : dependentName,
                                ];
                            }}
                            labelFormatter={(label) => formatDate(label as string)}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="independent"
                            name="independent"
                            fill="#3b82f6"
                            opacity={0.8}
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="dependent"
                            name="dependent"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                            connectNulls={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Missing Data Warning */}
            {data.some(d => d.independent === null || d.dependent === null) && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                    ⚠️ Some days have missing data. Gaps in the chart indicate days without logged values.
                </div>
            )}
        </div>
    );
}
