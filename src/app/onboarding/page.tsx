'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, ArrowRight, Target, Sparkles, Play, Package, Check } from 'lucide-react';
import { getBundlesForFocusArea, getTemplateById, type ProtocolBundle } from '@/lib/templates';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [focus, setFocus] = useState('');
    const [selectedBundles, setSelectedBundles] = useState<Set<string>>(new Set());
    const [healthDataConsent, setHealthDataConsent] = useState(false);

    const availableBundles = useMemo(() => getBundlesForFocusArea(focus), [focus]);

    const toggleBundle = (bundleId: string) => {
        setSelectedBundles(prev => {
            const next = new Set(prev);
            if (next.has(bundleId)) next.delete(bundleId);
            else next.add(bundleId);
            return next;
        });
    };

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
                })
            });

            // 2. Create protocols from selected bundles
            const createdTemplateIds = new Set<string>();
            for (const bundleId of selectedBundles) {
                const bundle = availableBundles.find(b => b.id === bundleId);
                if (!bundle) continue;

                for (const templateId of bundle.protocolIds) {
                    if (createdTemplateIds.has(templateId)) continue; // avoid duplicates across bundles
                    createdTemplateIds.add(templateId);

                    const template = getTemplateById(templateId);
                    if (!template) continue;

                    await fetch('/api/habits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: template.name,
                            description: template.description,
                            icon: template.icon,
                            color: template.color,
                            subvariables: template.subvariables.map(sv => ({
                                name: sv.name,
                                type: sv.type,
                                unit: sv.unit || undefined,
                                order: sv.order,
                                metadata: sv.metadata || {},
                            }))
                        })
                    });
                }
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
                                Unlike habit trackers, Datalyst helps you run personal experiments. Track inputs (what you do) and outputs (how you feel) — we'll find the connections.
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
                                <Package className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                Pick your experiment bundles
                            </h2>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Each bundle includes 2-3 protocols designed to reveal real correlations.
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-2">
                                A <strong className="text-[var(--text-secondary)]">protocol</strong> is a set of variables you track daily — like Sleep (hours + quality + refreshed?).
                            </p>
                        </div>

                        <div className="space-y-3">
                            {availableBundles.map((bundle) => {
                                const isSelected = selectedBundles.has(bundle.id);
                                const protocols = bundle.protocolIds.map(id => getTemplateById(id)).filter(Boolean);
                                return (
                                    <button
                                        key={bundle.id}
                                        onClick={() => toggleBundle(bundle.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                            isSelected
                                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-sm'
                                                : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-[var(--text-primary)]">
                                                {bundle.emoji} {bundle.name}
                                            </span>
                                            {isSelected && (
                                                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                                            {bundle.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {protocols.map(t => t && (
                                                <span key={t.id} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--text-tertiary)]">
                                                    {t.icon} {t.name}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[var(--text-tertiary)] mt-2 italic">
                                            {bundle.whyItCorrelates}
                                        </p>
                                    </button>
                                );
                            })}
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
                            disabled={selectedBundles.size === 0 || loading || (['Physical Health', 'Mental Wellness'].includes(focus) && !healthDataConsent)}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating {selectedBundles.size} bundle{selectedBundles.size !== 1 ? 's' : ''}...
                                </>
                            ) : (
                                <>
                                    Start with {selectedBundles.size} bundle{selectedBundles.size !== 1 ? 's' : ''} <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                        >
                            Change focus area
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
