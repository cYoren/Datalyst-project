'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { FlaskConical, ArrowLeft, Loader2 } from 'lucide-react';

interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewExperimentPage() {
    const router = useRouter();
    const { data: habits, isLoading } = useSWR<Habit[]>('/api/habits', fetcher);

    const [name, setName] = useState('');
    const [hypothesis, setHypothesis] = useState('');
    const [independentId, setIndependentId] = useState('');
    const [dependentId, setDependentId] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const twoWeeks = new Date();
        twoWeeks.setDate(twoWeeks.getDate() + 15);
        return twoWeeks.toISOString().split('T')[0];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/experiments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    hypothesis: hypothesis || null,
                    independentId,
                    dependentId,
                    startDate,
                    endDate,
                    status: 'PLANNING',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create experiment');
            }

            router.push('/lab');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredHabits = habits?.filter(h => !h.id.includes('archived')) || [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                        <FlaskConical className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">New Experiment</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Test a correlation hypothesis</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Experiment Name */}
                <Card className="p-5 space-y-4">
                    <h2 className="font-semibold text-[var(--text-primary)]">Experiment Details</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Does Magnesium Improve Sleep?"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">
                            Hypothesis (optional)
                        </label>
                        <textarea
                            value={hypothesis}
                            onChange={(e) => setHypothesis(e.target.value)}
                            placeholder="e.g., I expect that taking magnesium before bed will increase my sleep quality score..."
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--text-primary)] resize-none"
                            rows={3}
                        />
                    </div>
                </Card>

                {/* Variables */}
                <Card className="p-5 space-y-4">
                    <h2 className="font-semibold text-[var(--text-primary)]">Variables</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Select the independent variable (what you're changing) and dependent variable (what you're measuring).
                    </p>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Independent */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Independent Variable (Cause) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={independentId}
                                    onChange={(e) => setIndependentId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--text-primary)]"
                                    required
                                >
                                    <option value="">Select a protocol...</option>
                                    {filteredHabits.map(habit => (
                                        <option key={habit.id} value={habit.id} disabled={habit.id === dependentId}>
                                            {habit.icon} {habit.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                    The variable you're manipulating
                                </p>
                            </div>

                            {/* Dependent */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Dependent Variable (Effect) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={dependentId}
                                    onChange={(e) => setDependentId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--text-primary)]"
                                    required
                                >
                                    <option value="">Select a protocol...</option>
                                    {filteredHabits.map(habit => (
                                        <option key={habit.id} value={habit.id} disabled={habit.id === independentId}>
                                            {habit.icon} {habit.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                    The outcome you're measuring
                                </p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Date Range */}
                <Card className="p-5 space-y-4">
                    <h2 className="font-semibold text-[var(--text-primary)]">Duration</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Experiments need at least 7 days to calculate meaningful correlations.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                required
                            />
                        </div>
                    </div>
                </Card>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                        Create Experiment
                    </Button>
                </div>
            </form>
        </div>
    );
}
