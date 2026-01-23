'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader2, ArrowRight, CheckCircle, Target, Sparkles, Play } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [focus, setFocus] = useState('');
    const [habitName, setHabitName] = useState('');
    const [healthDataConsent, setHealthDataConsent] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('No user found');

            // 1. Update User Profile
            await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingCompleted: true,
                    ...(healthDataConsent && { healthDataConsent: true }),
                    // If name was collected here, we'd update it too, but we assume it's from signup
                })
            });

            // 2. Create First Habit (if provided)
            if (habitName) {
                await fetch('/api/habits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: habitName,
                        description: `My focus: ${focus}`,
                        schedule: JSON.stringify({ frequency: 'daily' }),
                        subvariables: []
                    })
                });
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error('Onboarding error:', error);
            setLoading(false);
        }
    };

    const handleDemoSetup = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/demo/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to setup demo');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error('Demo setup error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-page)]">
            <Card className="w-full max-w-lg p-8">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                                }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-8 w-8 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                Welcome to Datalyst!
                            </h1>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Let's set up your space so you can start mastering your habits.
                            </p>
                        </div>
                        <Button onClick={() => setStep(2)} className="w-full" size="lg">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-border)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[var(--color-bg-card)] text-[var(--text-tertiary)]">
                                    or
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleDemoSetup}
                            variant="outline"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up demo...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Try with Sample Data
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-[var(--text-tertiary)]">
                            See how Datalyst works with 30 days of pre-filled data showing real correlations.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="h-8 w-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                What's your main focus?
                            </h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                This helps us personalize your experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {['Productivity', 'Physical Health', 'Mental Wellness', 'Learning', 'Finance'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { setFocus(opt); setStep(3); }}
                                    className="p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)] transition-all text-left font-medium text-[var(--text-primary)]"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                Create your first habit
                            </h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Choose something simple to get started.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Habit Name
                                </label>
                                <Input
                                    value={habitName}
                                    onChange={(e) => setHabitName(e.target.value)}
                                    placeholder="E.g., Drink 2L of water, Read 10 pages..."
                                    autoFocus
                                />
                            </div>

                            {['Physical Health', 'Mental Wellness'].includes(focus) && (
                                <label className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded border-[var(--color-slate-200)]"
                                        checked={healthDataConsent}
                                        onChange={(event) => setHealthDataConsent(event.target.checked)}
                                    />
                                    <span>
                                        I consent to processing health-related data for insights and tracking.
                                    </span>
                                </label>
                            )}

                            <Button
                                onClick={handleComplete}
                                disabled={!habitName || loading || (['Physical Health', 'Mental Wellness'].includes(focus) && !healthDataConsent)}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Finishing...
                                    </>
                                ) : (
                                    'Complete Setup'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
