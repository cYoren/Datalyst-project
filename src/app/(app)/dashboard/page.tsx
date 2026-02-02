'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { HabitCard } from '@/components/habits/HabitCard';
import { QuickEntryForm } from '@/components/forms/QuickEntryForm';
import { TodaysLogWidget } from '@/components/dashboard/TodaysLogWidget';
import AdHocLogModal from '@/components/dashboard/AdHocLogModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { TrendingUp, Brain, ArrowUpRight, Target, Calendar, BarChart3, Plus, Sparkles, Hash } from 'lucide-react';
import { useDashboard } from '@/lib/hooks';
import { InfoTooltip } from '@/components/ui/Tooltip';
import ActiveTrialWidget from '@/components/lab/ActiveTrialWidget';

interface DashboardStats {
    weeklyCompletion: number;
    totalLoggingDays: number;
    dailyProgress: {
        completed: number;
        total: number;
        percentage: number;
    };
    weeklySummary: {
        daysActive: number;
        totalEntries: number;
        avgEntriesPerDay: number;
    };
}

export default function DashboardPage() {
    const { habits, stats, insights, user, isLoading, refresh: refreshHabits } = useDashboard();
    const [selectedHabit, setSelectedHabit] = useState<any | null>(null);
    const [isAdHocModalOpen, setIsAdHocModalOpen] = useState(false);
    const [showInsightCelebration, setShowInsightCelebration] = useState(false);
    const [newInsightText, setNewInsightText] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState('');
    const [greeting, setGreeting] = useState('');

    // First-insight celebration + new insight detection
    useEffect(() => {
        if (!insights?.correlations || insights.correlations.length === 0) return;

        const seen = localStorage.getItem('datalyst_insight_celebrated');
        if (!seen) {
            setShowInsightCelebration(true);
            localStorage.setItem('datalyst_insight_celebrated', '1');
            localStorage.setItem('datalyst_seen_insight_count', String(insights.correlations.length));
            return;
        }

        // Check for new insights since last visit
        const prevCount = parseInt(localStorage.getItem('datalyst_seen_insight_count') || '0', 10);
        if (insights.correlations.length > prevCount) {
            setNewInsightText(insights.correlations[0].text);
            localStorage.setItem('datalyst_seen_insight_count', String(insights.correlations.length));
        }
    }, [insights]);

    useEffect(() => {
        const date = new Date();
        setCurrentDate(format(date, "EEEE, MMMM do"));

        const hour = date.getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const handleRegisterSuccess = () => {
        setSelectedHabit(null);
        refreshHabits();
    };

    const userName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

    const isHabitCompleted = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return false;

        let schedule: any = {};
        try {
            schedule = typeof habit.schedule === 'string'
                ? JSON.parse(habit.schedule)
                : habit.schedule;
        } catch (e) {
            schedule = habit.schedule || {};
        }

        const logLimit = schedule.logLimit || 'unlimited';

        if (logLimit === 'unlimited') {
            return false;
        }

        if (logLimit === 'daily') {
            return habit.entries && habit.entries.length > 0;
        }

        return false;
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const pendingHabits = habits.filter(h => !isHabitCompleted(h.id));
    const completedHabits = habits.filter(h => isHabitCompleted(h.id));

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">
                    <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]"></span>
                    {currentDate}
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight font-display">
                    {greeting}, {userName}.
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Days Logged */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--color-accent-light)]">
                                <Hash className="h-5 w-5 text-[var(--color-accent)]" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                    {stats?.totalLoggingDays || 0}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">Days Logged <InfoTooltip text="Total unique days you've logged at least one entry." /></p>
                            </div>
                        </div>
                    </Card>

                    {/* Today's Progress */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100">
                                <Target className="h-5 w-5 text-amber-700" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                    {stats?.dailyProgress.percentage || 0}%
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                    Today ({stats?.dailyProgress.completed}/{stats?.dailyProgress.total})
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Weekly Completion */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <Calendar className="h-5 w-5 text-emerald-700" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                    {stats?.weeklyCompletion || 0}%
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">Week</p>
                            </div>
                        </div>
                    </Card>

                    {/* This Week: X/7 Days */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--color-bg-subtle)]">
                                <BarChart3 className="h-5 w-5 text-[var(--text-secondary)]" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                    {stats?.weeklySummary.daysActive || 0}/7
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">This Week</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </header>

            {/* Active Experiment Guidance */}
            <ActiveTrialWidget />

            {/* New Insight Banner */}
            {newInsightText && (
                <Card className="p-4 border-l-4 border-l-[var(--color-accent)] animate-fade-in">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-[var(--color-accent)] shrink-0" suppressHydrationWarning />
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">New insight discovered</p>
                                <p className="text-sm text-[var(--text-secondary)]">{newInsightText}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNewInsightText(null)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg leading-none shrink-0"
                        >
                            &times;
                        </button>
                    </div>
                </Card>
            )}

            {/* Insights Countdown */}
            {habits.length > 0 && (!insights?.correlations || insights.correlations.length === 0) && (
                <Card className="p-6 border-l-4 border-l-[var(--color-accent)] animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-[var(--color-accent-light)] shrink-0">
                            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" suppressHydrationWarning />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[var(--text-primary)] font-display">
                                {(stats?.totalLoggingDays || 0) >= 14
                                    ? 'Insights are cooking...'
                                    : 'Insights unlock soon'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                {(stats?.totalLoggingDays || 0) >= 14
                                    ? 'You have enough data! Correlations will appear once calculated.'
                                    : `Log daily for ${14 - (stats?.totalLoggingDays || 0)} more day${14 - (stats?.totalLoggingDays || 0) !== 1 ? 's' : ''} to discover correlations between your protocols.`}
                            </p>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                                    <span>{Math.min(stats?.totalLoggingDays || 0, 14)} / 14 days</span>
                                    <span>{Math.min(Math.round(((stats?.totalLoggingDays || 0) / 14) * 100), 100)}%</span>
                                </div>
                                <div className="h-2 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((stats?.totalLoggingDays || 0) / 14) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Today's Log Widget - Sticky Section */}
            <TodaysLogWidget />

            {/* Protocols List */}
            <div className="space-y-6 animate-slide-up">
                {habits.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-subtle)] rounded-[var(--radius-card)] border border-[var(--color-border)]">
                        {/* Illustration */}
                        <div className="relative mx-auto w-32 h-32 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-hover)]/20 rounded-full" style={{ animation: 'pulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                            <div className="absolute inset-4 bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-accent-hover)]/30 rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl">🧪</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">
                            Start Your First Experiment
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                            Create a protocol to track something you care about.
                            Discover patterns and correlations in your data.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => window.location.href = '/habits/new'}
                                size="lg"
                                className="shadow-lg shadow-[var(--color-accent)]/20"
                            >
                                Create Protocol
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        await fetch('/api/demo/setup', { method: 'POST' });
                                        refreshHabits();
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                size="lg"
                            >
                                Try Demo Data
                            </Button>
                        </div>

                        <p className="text-xs text-[var(--text-tertiary)] mt-6">
                            Popular: Sleep tracking, Workout logs, Mood journals
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Pending */}
                        {pendingHabits.length > 0 && (
                            <div className="grid gap-4">
                                {pendingHabits.map(habit => (
                                    <HabitCard
                                        key={habit.id}
                                        habit={habit}
                                        isCompleted={false}
                                        onRegister={() => setSelectedHabit(habit)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Completed */}
                        {completedHabits.length > 0 && (
                            <div className="pt-8">
                                <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4 pl-1">
                                    Completed
                                </h2>
                                <div className="grid gap-4 opacity-60 hover:opacity-100 transition-opacity">
                                    {completedHabits.map(habit => (
                                        <HabitCard
                                            key={habit.id}
                                            habit={habit}
                                            isCompleted={true}
                                            onRegister={() => { }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Insights Section */}
            {insights?.correlations && insights.correlations.length > 0 && (
                <section className="space-y-6 pt-10 border-t border-[var(--color-border)] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
                        <Brain className="h-6 w-6 text-[var(--color-accent)]" suppressHydrationWarning />
                        Insights
                        <InfoTooltip text="Correlations are calculated from your logged data. Higher confidence means the pattern is statistically significant. This is not proof of causation — experiment to find out!" />
                    </h2>

                    {/* Hero Card - Top Insight */}
                    {insights.correlations[0] && (
                        <Card className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white border-none p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="h-32 w-32" suppressHydrationWarning />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-teal-100 mb-2 text-sm font-medium uppercase tracking-wider">
                                    <TrendingUp className="h-4 w-4" suppressHydrationWarning />
                                    Strong Correlation
                                </div>
                                <h3 className="text-2xl font-bold mb-4 leading-tight font-display">
                                    {insights.correlations[0].text}
                                </h3>
                                <div className="flex items-center gap-6 text-sm text-teal-50">
                                    <div className="flex flex-col">
                                        <span className="text-teal-100 text-xs uppercase">Confidence</span>
                                        <span className="font-mono font-medium tabular-nums">
                                            {((1 - insights.correlations[0].pValue) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-teal-100 text-xs uppercase">Sample</span>
                                        <span className="font-mono font-medium tabular-nums">{insights.correlations[0].n} days</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Additional Insights */}
                    {insights.correlations.length > 1 && (
                        <div className="grid gap-6">
                            {insights.correlations.slice(1, 4).map((corr: any, i: number) => (
                                <Card key={i} className="p-6 hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group border-l-4 border-l-[var(--color-accent)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-[var(--color-bg-subtle)] px-3 py-1 rounded-[var(--radius-input)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                                            Correlation
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" suppressHydrationWarning />
                                    </div>

                                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2 font-display">
                                        {corr.text}
                                    </h4>

                                    <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-tertiary)] text-xs uppercase">Confidence</span>
                                            <span className="font-mono font-medium tabular-nums">{((1 - corr.pValue) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-tertiary)] text-xs uppercase">Sample</span>
                                            <span className="font-mono font-medium tabular-nums">{corr.n} days</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Quick Entry Modal */}
            <Modal
                isOpen={!!selectedHabit}
                onClose={() => setSelectedHabit(null)}
                title={selectedHabit ? `Log ${selectedHabit.name}` : ''}
            >
                {selectedHabit && (
                    <QuickEntryForm
                        habit={selectedHabit}
                        onSuccess={handleRegisterSuccess}
                        onCancel={() => setSelectedHabit(null)}
                    />
                )}
            </Modal>

            {/* Ad-Hoc Log Modal */}
            <AdHocLogModal
                isOpen={isAdHocModalOpen}
                onClose={() => setIsAdHocModalOpen(false)}
                onLogComplete={refreshHabits}
            />

            {/* First-Insight Celebration Modal */}
            <Modal
                isOpen={showInsightCelebration}
                onClose={() => setShowInsightCelebration(false)}
                title="Your first correlation is ready!"
            >
                <div className="space-y-4 text-center">
                    <div className="text-5xl">🎉</div>
                    <p className="text-[var(--text-secondary)]">
                        You've logged enough data for Datalyst to discover patterns.
                        Scroll down to the <strong>Insights</strong> section to see your first correlations.
                    </p>
                    <Button onClick={() => setShowInsightCelebration(false)} className="w-full">
                        See My Insights
                    </Button>
                </div>
            </Modal>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsAdHocModalOpen(true)}
                className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex items-center gap-2 px-4 py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] hover:bg-[var(--color-accent-hover)] hover:scale-105 transition-all"
                title="Log ad-hoc item"
            >
                <Plus className="h-5 w-5" />
                <span className="hidden md:inline font-medium">Log Anything</span>
            </button>
        </div>
    );
}
