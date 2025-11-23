'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HABIT_TEMPLATES } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedHabits, setSelectedHabit] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleHabit = (id: string) => {
        setSelectedHabit(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            const habitsToCreate = HABIT_TEMPLATES.filter(h => selectedHabits.includes(h.id));

            for (const habit of habitsToCreate) {
                await fetch('/api/habits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: habit.name,
                        description: habit.description,
                        color: habit.color,
                        icon: habit.icon,
                        subvariables: habit.subvariables
                    })
                });
            }

            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to create habits', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-bg-app)]">
            <div className="max-w-md w-full space-y-10">

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="text-center space-y-8 animate-fade-in">
                        <div className="flex justify-center mb-8">
                            <div className="h-24 w-24 bg-white rounded-[32px] shadow-[var(--shadow-soft)] flex items-center justify-center text-5xl animate-scale-in">
                                ✨
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                            Bem-vindo ao Datalyst
                        </h1>
                        <p className="text-[var(--text-secondary)] text-xl leading-relaxed">
                            Descubra padrões ocultos na sua vida. Acompanhe seus hábitos e deixe nossa IA encontrar as conexões.
                        </p>
                        <div className="pt-8">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg shadow-lg shadow-blue-500/20"
                                onClick={() => setStep(2)}
                            >
                                Começar <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Habits */}
                {step === 2 && (
                    <div className="space-y-8 animate-slide-up">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                                O que você quer acompanhar?
                            </h2>
                            <p className="text-[var(--text-secondary)] mt-3 text-lg">
                                Escolha alguns hábitos para começar.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {HABIT_TEMPLATES.map(habit => {
                                const isSelected = selectedHabits.includes(habit.id);
                                return (
                                    <Card
                                        key={habit.id}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 flex items-center p-5 border-2",
                                            isSelected
                                                ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]/30 shadow-md"
                                                : "border-transparent hover:border-[var(--color-border-hover)]"
                                        )}
                                        onClick={() => toggleHabit(habit.id)}
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mr-5">
                                            {habit.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-[var(--text-primary)] text-lg">{habit.name}</h3>
                                            <p className="text-sm text-[var(--text-secondary)]">{habit.description}</p>
                                        </div>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                                            isSelected ? "bg-[var(--color-accent)] text-white scale-100" : "bg-[var(--color-bg-subtle)] text-transparent scale-90"
                                        )}>
                                            <Check className="h-5 w-5" />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button
                                variant="ghost"
                                className="flex-1 h-14 text-lg"
                                onClick={() => setStep(1)}
                            >
                                Voltar
                            </Button>
                            <Button
                                className="flex-[2] h-14 text-lg shadow-lg shadow-blue-500/20"
                                disabled={selectedHabits.length === 0 || isSubmitting}
                                isLoading={isSubmitting}
                                onClick={handleFinish}
                            >
                                Continuar ({selectedHabits.length})
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
