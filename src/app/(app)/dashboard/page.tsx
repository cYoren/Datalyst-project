'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HabitCard } from '@/components/habits/HabitCard';
import { QuickEntryForm } from '@/components/forms/QuickEntryForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Flame, TrendingUp, Brain, ArrowUpRight, Target, Calendar, BarChart3 } from 'lucide-react';

interface DashboardStats {
    streak: number;
    weeklyCompletion: number;
    consistency: number;
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
    const [habits, setHabits] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHabit, setSelectedHabit] = useState<any | null>(null);
    const [currentDate, setCurrentDate] = useState('');
    const [greeting, setGreeting] = useState('');
    const [userName, setUserName] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [habitsRes, statsRes, insightsRes, userRes] = await Promise.all([
                fetch('/api/habits'),
                fetch('/api/dashboard/stats'),
                fetch('/api/insights'),
                fetch('/api/user'),
            ]);

            if (habitsRes.ok) {
                const habitsData = await habitsRes.json();
                setHabits(Array.isArray(habitsData) ? habitsData : []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                setInsights(insightsData);
            }

            if (userRes.ok) {
                const userData = await userRes.json();
                setUserName(userData.name || userData.user_metadata?.name || userData.email?.split('@')[0] || 'Usuário');
            } else if (userRes.status === 401) {
                // Redirect to login if unauthorized
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const date = new Date();
        setCurrentDate(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }));

        const hour = date.getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        fetchData();
    }, []);

    const handleRegisterSuccess = () => {
        setSelectedHabit(null);
        fetchData();
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" suppressHydrationWarning />
            </div>
        );
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
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                    {greeting}, {userName}.
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Streak */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Flame className="h-5 w-5 text-orange-600" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {stats?.streak || 0}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">Dias de sequência</p>
                            </div>
                        </div>
                    </Card>

                    {/* Today's Progress */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Target className="h-5 w-5 text-blue-600" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {stats?.dailyProgress.percentage || 0}%
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                    Hoje ({stats?.dailyProgress.completed}/{stats?.dailyProgress.total})
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Weekly Completion */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Calendar className="h-5 w-5 text-green-600" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {stats?.weeklyCompletion || 0}%
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">Semana</p>
                            </div>
                        </div>
                    </Card>

                    {/* Consistency */}
                    <Card className="p-4 hover:shadow-[var(--shadow-hover)] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <BarChart3 className="h-5 w-5 text-purple-600" suppressHydrationWarning />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {stats?.consistency || 0}%
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">Consistência</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </header>

            {/* Habits List */}
            <div className="space-y-6 animate-slide-up">
                {habits.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--color-bg-card)] rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)]">
                        <p className="text-[var(--text-secondary)] mb-6 text-lg">Sua jornada começa agora.</p>
                        <Button onClick={() => window.location.href = '/habits/new'} size="lg">
                            Criar primeiro hábito
                        </Button>
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
                                    Concluídos
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
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Brain className="h-6 w-6 text-[var(--color-accent)]" suppressHydrationWarning />
                        Insights
                    </h2>

                    {/* Hero Card - Top Insight */}
                    {insights.correlations[0] && (
                        <Card className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white border-none p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="h-32 w-32" suppressHydrationWarning />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-blue-100 mb-2 text-sm font-medium uppercase tracking-wider">
                                    <TrendingUp className="h-4 w-4" suppressHydrationWarning />
                                    Correlação Forte
                                </div>
                                <h3 className="text-2xl font-bold mb-4 leading-tight">
                                    {insights.correlations[0].text}
                                </h3>
                                <div className="flex items-center gap-6 text-sm text-blue-50">
                                    <div className="flex flex-col">
                                        <span className="text-blue-100 text-xs uppercase">Confiança</span>
                                        <span className="font-mono font-medium">
                                            {((1 - insights.correlations[0].pValue) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-blue-100 text-xs uppercase">Amostra</span>
                                        <span className="font-mono font-medium">{insights.correlations[0].n} dias</span>
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
                                        <div className="bg-[var(--color-bg-subtle)] px-3 py-1 rounded-full text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                                            Correlação
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" suppressHydrationWarning />
                                    </div>

                                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                        {corr.text}
                                    </h4>

                                    <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-tertiary)] text-xs uppercase">Confiança</span>
                                            <span className="font-mono font-medium">{((1 - corr.pValue) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-tertiary)] text-xs uppercase">Amostra</span>
                                            <span className="font-mono font-medium">{corr.n} dias</span>
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
                title={selectedHabit ? `Registrar ${selectedHabit.name}` : ''}
            >
                {selectedHabit && (
                    <QuickEntryForm
                        habit={selectedHabit}
                        onSuccess={handleRegisterSuccess}
                        onCancel={() => setSelectedHabit(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
