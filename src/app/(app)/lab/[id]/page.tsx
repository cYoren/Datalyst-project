'use client';

import React, { use, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlaskConical, ArrowLeft, Play, CheckCircle, Archive, Loader2, Download, ShieldCheck, ChevronDown, AlertTriangle } from 'lucide-react';
import ExperimentChart from '@/components/lab/ExperimentChart';
import { exportRawData } from '@/stats/analysis';
import { fetcher } from '@/lib/hooks';

interface ExperimentResults {
    experiment: {
        id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
        type?: string;
        randomizationType?: string;
        washoutPeriod?: number;
        blockSize?: number;
        isBlind?: boolean;
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
    chartData: {
        date: string;
        independent: number | null;
        dependent: number | null;
        isWashout: boolean;
        condition: string | null;
    }[];
    stats: {
        totalDays: number;
        loggedDays: number;
        correlation: number | null;
        correlationType: 'pearson' | 'spearman';
        strength: string;
        conditionLabels?: string[];
        multiArmPending?: boolean;
        n1?: {
            conditionAMean: number;
            conditionBMean: number;
            conditionAStd: number;
            conditionBStd: number;
            nA: number;
            nB: number;
            effectSize: number;
            effectLabel: string;
            tTest: { tStatistic: number; pValue: number; significant: boolean } | null;
            bayesian: {
                probabilityOfEffect: number;
                posteriorMean: number;
                posteriorStd: number;
                credibleInterval: [number, number];
            };
            autocorrelation: {
                lag1: number;
                isProblematic: boolean;
                warning: string | null;
            };
            blockAnalysis?: {
                nBlocks: number;
                meanBlockDiff: number;
                tTest: { tStatistic: number; pValue: number; significant: boolean } | null;
                effectSize: number;
                missingDataWarning: string | null;
            } | null;
            carryoverTest?: {
                hasCarryover: boolean;
                warning: string | null;
            } | null;
            periodEffect?: {
                earlyMeanDiff: number;
                lateMeanDiff: number;
                hasPeriodEffect: boolean;
                warning: string | null;
            } | null;
            sequentialBoundary?: {
                currentZ: number;
                criticalValue: number;
                alphaSpent: number;
                dataFraction: number;
                nLooks: number;
                canRejectNull: boolean;
                canStopForFutility: boolean;
            } | null;
        };
    };
}



function DataQualitySection({ stats, experiment }: { stats: ExperimentResults['stats']; experiment: ExperimentResults['experiment'] }) {
    const [expanded, setExpanded] = useState(false);
    const n1 = stats.n1;
    if (!n1) return null;

    // Collect all active warnings
    const warnings: { label: string; detail: string; severity: 'red' | 'orange' | 'amber' }[] = [];

    if (n1.carryoverTest?.hasCarryover) {
        warnings.push({ label: 'Carryover effect', detail: n1.carryoverTest.warning!, severity: 'red' });
    }
    if (n1.periodEffect?.hasPeriodEffect) {
        warnings.push({ label: 'Period effect', detail: n1.periodEffect.warning!, severity: 'orange' });
    }
    if (n1.autocorrelation.isProblematic) {
        warnings.push({
            label: 'Autocorrelation',
            detail: `Day-to-day drift detected (lag-1: ${n1.autocorrelation.lag1.toFixed(2)}). Results may reflect a trend rather than your intervention.`,
            severity: 'amber',
        });
    }

    const hasSequential = n1.sequentialBoundary && experiment.status === 'ACTIVE';
    const hasBlockAnalysis = !!n1.blockAnalysis;
    const hasAnything = warnings.length > 0 || hasSequential || hasBlockAnalysis;

    if (!hasAnything) return null;

    // Summary line
    const allClear = warnings.length === 0;
    const summaryColor = allClear ? 'text-green-700' : warnings.some(w => w.severity === 'red') ? 'text-red-700' : 'text-amber-700';
    const summaryBg = allClear ? 'bg-green-50 border-green-200' : warnings.some(w => w.severity === 'red') ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
    const summary = allClear
        ? 'No issues detected'
        : `${warnings.length} issue${warnings.length > 1 ? 's' : ''} found`;

    return (
        <Card className={cn('animate-fade-in overflow-hidden border', summaryBg)}>
            {/* Clickable header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <div className="flex items-center gap-2.5">
                    <AlertTriangle className={cn('h-4 w-4', summaryColor)} />
                    <span className={cn('text-sm font-semibold', summaryColor)}>
                        Data Quality: {summary}
                    </span>
                    {hasSequential && n1.sequentialBoundary!.canRejectNull && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            Early stopping possible
                        </span>
                    )}
                </div>
                <ChevronDown className={cn(
                    'h-4 w-4 transition-transform text-[var(--text-tertiary)]',
                    expanded && 'rotate-180'
                )} />
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border)]">
                    {/* Warnings */}
                    {warnings.map((w, i) => (
                        <div key={i} className="flex gap-2 items-start pt-3 first:pt-3">
                            <span className={cn(
                                'mt-0.5 h-2 w-2 rounded-full shrink-0',
                                w.severity === 'red' ? 'bg-red-500' : w.severity === 'orange' ? 'bg-orange-500' : 'bg-amber-500'
                            )} />
                            <div>
                                <span className="text-xs font-semibold text-[var(--text-primary)]">{w.label}: </span>
                                <span className="text-xs text-[var(--text-secondary)]">{w.detail}</span>
                            </div>
                        </div>
                    ))}

                    {/* Sequential testing */}
                    {hasSequential && (
                        <div className="flex gap-2 items-start pt-3">
                            <span className={cn(
                                'mt-0.5 h-2 w-2 rounded-full shrink-0',
                                n1.sequentialBoundary!.canRejectNull ? 'bg-green-500' : 'bg-blue-500'
                            )} />
                            <div>
                                <span className="text-xs font-semibold text-[var(--text-primary)]">Interim analysis: </span>
                                <span className="text-xs text-[var(--text-secondary)]">
                                    {n1.sequentialBoundary!.canRejectNull
                                        ? 'Effect crossed the significance boundary — you may stop early.'
                                        : `${(n1.sequentialBoundary!.dataFraction * 100).toFixed(0)}% of data collected. Continue gathering data.`
                                    }
                                    {n1.sequentialBoundary!.canStopForFutility && ' Effect is very small — consider stopping for futility.'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Block analysis */}
                    {hasBlockAnalysis && (
                        <div className="pt-3 border-t border-[var(--color-border)]">
                            <div className="text-xs font-semibold text-[var(--text-primary)] mb-2">Block Analysis</div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <div className="text-[var(--text-tertiary)]">Blocks</div>
                                    <div className="font-bold text-[var(--text-primary)]">{n1.blockAnalysis!.nBlocks}</div>
                                </div>
                                <div>
                                    <div className="text-[var(--text-tertiary)]">Mean diff</div>
                                    <div className="font-bold text-[var(--text-primary)]">{n1.blockAnalysis!.meanBlockDiff.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-[var(--text-tertiary)]">Block p-value</div>
                                    <div className="font-bold text-[var(--text-primary)]">
                                        {n1.blockAnalysis!.tTest ? n1.blockAnalysis!.tTest.pValue.toFixed(3) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            {n1.blockAnalysis!.missingDataWarning && (
                                <p className="text-[10px] text-amber-700 mt-1.5">{n1.blockAnalysis!.missingDataWarning}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

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

                {/* Status & Export Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const outcomeByDate: Record<string, number> = {};
                            chartData.forEach((d: any) => {
                                if (d.dependent !== null) outcomeByDate[d.date] = d.dependent;
                            });
                            // Transform chartData to ensure condition is a string for exportRawData
                            const exportData = chartData.map((d: any) => ({
                                date: d.date,
                                condition: d.condition || 'N/A',
                                isWashout: d.isWashout
                            }));
                            const csv = exportRawData(exportData, outcomeByDate);
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${experiment.name.replace(/\s+/g, '_')}_data.csv`;
                            a.click();
                        }}
                        className="gap-2 text-[var(--text-secondary)]" title="Export Raw Data"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => alert(`Scientific Audit for: ${experiment.name}\n\nMethodology: ${experiment.type || 'Standard'}\nRandomization: ${experiment.randomizationType || 'Fixed'}\nWashout Period: ${experiment.washoutPeriod ?? 0} days\nBlock Size: ${experiment.blockSize || 'N/A'}\nBlinding: ${experiment.isBlind ? 'Yes (Double blind)' : 'No'}`)}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">Scientific Audit</span>
                    </Button>

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

            {/* Multi-arm pending notice */}
            {stats.multiArmPending && (
                <Card className="p-6 border-l-4 border-l-blue-400 bg-blue-50/50 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-blue-500 shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Multi-arm analysis coming soon</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                                Your {stats.conditionLabels?.length ?? 3}+ condition experiment is collecting data. Advanced multi-arm analysis will be available in a future update.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Scientific Analysis Metrics */}
            {stats.n1 && (
                <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
                    {/* Probability of Effect */}
                    <Card className="p-6 space-y-4 border-l-4 border-l-purple-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FlaskConical className="h-16 w-16" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                Probability of Effect
                            </h3>
                            <div className="text-4xl font-black text-[var(--text-primary)] font-display">
                                {(stats.n1.bayesian.probabilityOfEffect * 100).toFixed(1)}%
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                Chance that {independent.name} actually impacts {dependent.name}
                            </p>
                        </div>
                        <div className="pt-2">
                            <div className="h-1.5 w-full bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${stats.n1.bayesian.probabilityOfEffect * 100}%` }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Effect Size */}
                    <Card className="p-6 space-y-4 border-l-4 border-l-blue-500">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                Effect Size (d)
                            </h3>
                            <div className="text-4xl font-black text-[var(--text-primary)] font-display">
                                {stats.n1.effectSize.toFixed(2)}
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                {Math.abs(stats.n1.effectSize) > 0.8 ? 'Massive' : Math.abs(stats.n1.effectSize) > 0.5 ? 'Large' : 'Moderate'} relative impact
                            </p>
                        </div>
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                            {stats.n1.bayesian.credibleInterval[0].toFixed(2)} to {stats.n1.bayesian.credibleInterval[1].toFixed(2)} (95% CI)
                        </div>
                    </Card>

                    {/* Condition Means */}
                    <Card className="p-6 space-y-4 border-l-4 border-l-emerald-500">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                Condition Averages
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-[var(--text-secondary)] underline decoration-dotted decoration-gray-300">
                                        {experiment.isBlind ? 'Condition 2' : (stats.conditionLabels?.[1] ?? 'Target/On')} (n={stats.n1.nB})
                                    </span>
                                    <span className="text-lg font-bold text-[var(--text-primary)]">{stats.n1.conditionBMean.toFixed(2)} {dependent.unit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-[var(--text-secondary)] underline decoration-dotted decoration-gray-300">
                                        {experiment.isBlind ? 'Condition 1' : (stats.conditionLabels?.[0] ?? 'Baseline/Off')} (n={stats.n1.nA})
                                    </span>
                                    <span className="text-lg font-bold text-[var(--text-primary)]">{stats.n1.conditionAMean.toFixed(2)} {dependent.unit}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    {stats.n1.effectLabel} effect
                                </span>
                                {stats.n1.tTest && (
                                    <span className={cn(
                                        'text-xs font-medium px-2 py-0.5 rounded',
                                        stats.n1.tTest.significant
                                            ? 'text-green-700 bg-green-50'
                                            : 'text-gray-600 bg-gray-100'
                                    )}>
                                        p = {stats.n1.tTest.pValue.toFixed(3)}
                                    </span>
                                )}
                            </div>
                            <div className="pt-1 text-[10px] text-[var(--text-tertiary)] italic">
                                * Excluding washout/adaptation days
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Data Quality — grouped collapsible section */}
            <DataQualitySection stats={stats} experiment={experiment} />

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
                        conditionLabels={stats.conditionLabels}
                        isBlind={experiment.isBlind}
                    />
                )}
            </Card>

            {/* Correlation Disclaimer */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                ℹ️ <strong>Remember:</strong> Correlation ≠ Causation. This tool shows patterns, not proof.
                Other factors may influence both variables independently.
            </div>
        </div >
    );
}
