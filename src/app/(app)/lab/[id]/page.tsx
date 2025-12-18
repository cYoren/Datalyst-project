'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlaskConical, ArrowLeft, Calendar, Play, CheckCircle, Archive, Loader2 } from 'lucide-react';
import ExperimentChart from '@/components/lab/ExperimentChart';

interface ExperimentResults {
    experiment: {
        id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
    };
    independent: {
        name: string;
        icon: string;
        variable: string;
        unit: string;
    };
    dependent: {
        name: string;
        icon: string;
        variable: string;
        unit: string;
    };
    chartData: { date: string; independent: number | null; dependent: number | null }[];
    stats: {
        totalDays: number;
        loggedDays: number;
        correlation: number | null;
        correlationType: 'pearson' | 'spearman';
        strength: string;
    };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ExperimentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { data: results, isLoading, error, mutate } = useSWR<ExperimentResults>(
        `/api/experiments/${id}/results`,
        fetcher
    );

    const handleStatusChange = async (newStatus: string) => {
        try {
            await fetch(`/api/experiments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            mutate();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !results) {
        return (
            <Card className="p-8 text-center">
                <p className="text-red-500 mb-4">Failed to load experiment results</p>
                <Button variant="secondary" onClick={() => router.back()}>
                    Go Back
                </Button>
            </Card>
        );
    }

    const { experiment, independent, dependent, chartData, stats } = results;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/lab')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                            <FlaskConical className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">
                                {experiment.name}
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {independent.icon} {independent.name} → {dependent.icon} {dependent.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2">
                    {experiment.status === 'PLANNING' && (
                        <Button onClick={() => handleStatusChange('ACTIVE')} className="gap-2">
                            <Play className="h-4 w-4" />
                            Start Experiment
                        </Button>
                    )}
                    {experiment.status === 'ACTIVE' && (
                        <Button onClick={() => handleStatusChange('COMPLETED')} className="gap-2 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                            Mark Complete
                        </Button>
                    )}
                    {experiment.status !== 'ARCHIVED' && (
                        <Button variant="ghost" onClick={() => handleStatusChange('ARCHIVED')} className="gap-2 text-gray-500">
                            <Archive className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-[var(--text-secondary)]">Duration</div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                        {stats.totalDays} days
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-[var(--text-secondary)]">Logged Days</div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                        {stats.loggedDays} / {stats.totalDays}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-[var(--text-secondary)]">Dates</div>
                    <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {experiment.startDate} → {experiment.endDate}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-[var(--text-secondary)]">Status</div>
                    <div className={cn(
                        "text-lg font-semibold",
                        experiment.status === 'ACTIVE' && "text-green-600",
                        experiment.status === 'COMPLETED' && "text-blue-600",
                        experiment.status === 'PLANNING' && "text-yellow-600",
                        experiment.status === 'ARCHIVED' && "text-gray-500",
                    )}>
                        {experiment.status}
                    </div>
                </Card>
            </div>

            {/* Chart */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Correlation Analysis
                </h2>

                {stats.loggedDays < 3 ? (
                    <div className="py-12 text-center">
                        <FlaskConical className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            Not enough data yet
                        </h3>
                        <p className="text-[var(--text-secondary)]">
                            Log at least 3 days of both variables to see correlation results.
                        </p>
                    </div>
                ) : (
                    <ExperimentChart
                        data={chartData}
                        independentName={independent.variable}
                        independentUnit={independent.unit}
                        dependentName={dependent.variable}
                        dependentUnit={dependent.unit}
                        correlation={stats.correlation}
                        correlationType={stats.correlationType}
                        strength={stats.strength}
                    />
                )}
            </Card>

            {/* Correlation Disclaimer */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                ℹ️ <strong>Remember:</strong> Correlation ≠ Causation. This tool shows patterns, not proof.
                Other factors may influence both variables independently.
            </div>
        </div>
    );
}
