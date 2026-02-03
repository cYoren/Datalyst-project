'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlaskConical, Plus, Calendar, TrendingUp, Archive, Loader2 } from 'lucide-react';
import CorrelationMatrix from '@/components/lab/CorrelationMatrix';
import { fetcher } from '@/lib/hooks';

interface Experiment {
    id: string;
    name: string;
    hypothesis: string | null;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    independent: { id: string; name: string; icon: string; color: string };
    dependent: { id: string; name: string; icon: string; color: string };
}



const statusColors: Record<string, string> = {
    PLANNING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
    PLANNING: '📝 Planning',
    ACTIVE: '🧪 Active',
    COMPLETED: '✅ Completed',
    ARCHIVED: '📦 Archived',
};

export default function LabPage() {
    const { data: experiments, isLoading, error } = useSWR<Experiment[]>('/api/experiments', fetcher);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const experimentsList = Array.isArray(experiments) ? experiments : [];
    const filteredExperiments = experimentsList.filter(exp => {
        if (statusFilter === null) return exp.status !== 'ARCHIVED';
        return exp.status === statusFilter;
    });

    const activeCount = experimentsList.filter(e => e.status === 'ACTIVE').length;
    const completedCount = experimentsList.filter(e => e.status === 'COMPLETED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                        <FlaskConical className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">The Lab</h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Test correlations between your protocols
                        </p>
                    </div>
                </div>
                <Link href="/lab/new" className={cn(buttonVariants(), "gap-2")}>
                    <Plus className="h-4 w-4" />
                    New Experiment
                </Link>
            </div>

            {/* Explainer Banner */}
            <Card className="p-4 border-l-4 border-l-purple-500 bg-purple-50/50">
                <p className="text-sm text-[var(--text-secondary)]">
                    The Lab lets you test specific interventions with randomized experiments. Your Dashboard shows automatic correlations from your data — the Lab goes further by controlling variables to prove causation.
                </p>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{experimentsList.length}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Total</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Active</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Completed</div>
                </Card>
                <Card className="p-4 text-center cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter(statusFilter === 'ARCHIVED' ? null : 'ARCHIVED')}>
                    <div className="text-2xl font-bold text-gray-500">
                        {experimentsList.filter(e => e.status === 'ARCHIVED').length}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Archived</div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status === 'ALL' ? null : status)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            (status === 'ALL' && statusFilter === null) || status === statusFilter
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {status === 'ALL' ? 'All Active' : statusLabels[status]}
                    </button>
                ))}
            </div>

            {/* Experiments List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            ) : error ? (
                <Card className="p-8 text-center">
                    <p className="text-red-500">Failed to load experiments</p>
                </Card>
            ) : filteredExperiments.length === 0 ? (
                <Card className="p-8 text-center">
                    <FlaskConical className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        No experiments yet
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        Ready to test a theory? Pick a cause (e.g., Caffeine) and an effect (e.g., Sleep), and Datalyst will randomize your days and run the statistics.
                    </p>
                    <Link href="/lab/new" className={cn(buttonVariants({ variant: 'secondary' }), "gap-2")}>
                        <Plus className="h-4 w-4" />
                        Create Experiment
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredExperiments.map(exp => (
                        <ExperimentCard key={exp.id} experiment={exp} />
                    ))}
                </div>
            )}

            {/* Correlation Matrix */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    📊 Correlation Overview
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Based on the last 30 days of data. Click any cell to explore that correlation.
                </p>
                <CorrelationMatrix />
            </Card>
        </div>
    );
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
    const daysLeft = Math.ceil(
        (new Date(experiment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const isEnded = daysLeft < 0;

    return (
        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/lab/${experiment.id}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Status Badge */}
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2",
                        statusColors[experiment.status]
                    )}>
                        {statusLabels[experiment.status]}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                        {experiment.name}
                    </h3>

                    {/* Variables */}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-3">
                        <span className="flex items-center gap-1">
                            {experiment.independent.icon} {experiment.independent.name}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="flex items-center gap-1">
                            {experiment.dependent.icon} {experiment.dependent.name}
                        </span>
                    </div>

                    {/* Hypothesis */}
                    {experiment.hypothesis && (
                        <p className="text-sm text-[var(--text-tertiary)] italic line-clamp-2 mb-3">
                            "{experiment.hypothesis}"
                        </p>
                    )}

                    {/* Date Range */}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {experiment.startDate} → {experiment.endDate}
                        </span>
                        {experiment.status === 'ACTIVE' && !isEnded && (
                            <span className="text-green-600 font-medium">
                                {daysLeft} days left
                            </span>
                        )}
                        {experiment.status === 'ACTIVE' && isEnded && (
                            <span className="text-orange-600 font-medium">
                                Ended - ready for analysis
                            </span>
                        )}
                    </div>
                </div>

                {/* View Results Button */}
                {(experiment.status === 'ACTIVE' || experiment.status === 'COMPLETED') && (
                    <Button variant="ghost" size="sm" className="gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Results
                    </Button>
                )}
            </div>
        </Card>
    );
}
