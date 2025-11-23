'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Plus, ArrowRight, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
    habit: any;
    onRegister: () => void;
    isCompleted?: boolean;
}

export const HabitCard = ({ habit, onRegister, isCompleted = false }: HabitCardProps) => {
    const router = useRouter();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onRegister
        router.push(`/habits/${habit.id}/edit`);
    };

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 group cursor-pointer border-0",
                isCompleted
                    ? "bg-[var(--color-bg-subtle)] shadow-none opacity-80"
                    : "bg-white hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
            )}
            onClick={onRegister}
        >
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    {/* Icon Container */}
                    <div
                        className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-colors",
                            isCompleted
                                ? "bg-[var(--color-border)] text-[var(--color-text-tertiary)] grayscale"
                                : "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                        )}
                        style={!isCompleted ? { backgroundColor: `${habit.color}15`, color: habit.color } : {}}
                    >
                        {habit.icon}
                    </div>

                    {/* Text Info */}
                    <div>
                        <h3 className={cn(
                            "text-lg font-semibold transition-colors",
                            isCompleted ? "text-[var(--text-secondary)] line-through decoration-[var(--color-border)]" : "text-[var(--text-primary)]"
                        )}>
                            {habit.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                            {isCompleted ? 'Concluído hoje' : habit.description || `${habit.subvariables.length} variáveis`}
                        </p>
                    </div>
                </div>

                {/* Action Indicators */}
                <div className="flex items-center gap-2">
                    {/* Edit Button - Always visible */}
                    <button
                        onClick={handleEdit}
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                            "bg-[var(--color-slate-100)] text-[var(--text-secondary)] hover:bg-[var(--color-slate-200)] hover:text-[var(--text-primary)]"
                        )}
                        title="Editar hábito"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Completion Indicator */}
                    {isCompleted ? (
                        <div className="h-10 w-10 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center animate-scale-in">
                            <Check className="h-5 w-5" />
                        </div>
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all">
                            <Plus className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar (Fake for now, can be real later) */}
            {!isCompleted && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-bg-subtle)]">
                    <div
                        className="h-full bg-[var(--color-accent)] opacity-20"
                        style={{ width: '30%', backgroundColor: habit.color }}
                    />
                </div>
            )}
        </Card>
    );
};
