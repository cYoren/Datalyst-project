'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { SubvariableType } from '@prisma/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface QuickEntryFormProps {
    habit: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export const QuickEntryForm = ({ habit, onSuccess, onCancel }: QuickEntryFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [values, setValues] = useState<Record<string, number>>({});
    const [note, setNote] = useState('');
    const [logicalDate, setLogicalDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    React.useEffect(() => {
        const initial: Record<string, number> = {};
        habit.subvariables.forEach((sub: any) => {
            if (sub.type === SubvariableType.SCALE_0_10) initial[sub.id] = 5;
            else if (sub.type === SubvariableType.BOOLEAN) initial[sub.id] = 0;
            else initial[sub.id] = 0;
        });
        setValues(initial);
    }, [habit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const subvariableEntries = Object.entries(values).map(([subId, val]) => ({
                subvariableId: subId,
                numericValue: val,
            }));

            await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitId: habit.id,
                    logicalDate: new Date(logicalDate + 'T12:00:00').toISOString(),
                    note,
                    subvariableEntries
                })
            });

            onSuccess();
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const updateValue = (subId: string, val: number) => {
        setValues(prev => ({ ...prev, [subId]: val }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                {habit.subvariables.map((sub: any) => (
                    <div key={sub.id} className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex justify-between items-end">
                            <label className="text-base font-medium text-[var(--text-primary)]">
                                {sub.name}
                            </label>
                            {sub.unit && (
                                <span className="text-xs font-medium text-[var(--text-tertiary)] bg-[var(--color-bg-subtle)] px-2 py-1 rounded-full">
                                    {sub.unit}
                                </span>
                            )}
                        </div>

                        {sub.type === SubvariableType.SCALE_0_10 && (
                            <Slider
                                value={values[sub.id] || 0}
                                onChange={(v) => updateValue(sub.id, v)}
                                min={0}
                                max={10}
                                labels={sub.metadata?.labels}
                            />
                        )}

                        {sub.type === SubvariableType.NUMERIC && (
                            <div className="relative">
                                <Input
                                    type="number"
                                    step={sub.metadata?.step || 1}
                                    value={values[sub.id] || ''}
                                    onChange={(e) => updateValue(sub.id, parseFloat(e.target.value) || 0)}
                                    className="text-2xl font-bold text-center h-16 rounded-[var(--radius-input)] border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-0"
                                />
                            </div>
                        )}

                        {sub.type === SubvariableType.BOOLEAN && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateValue(sub.id, 1)}
                                    className={cn(
                                        "flex-1 py-4 rounded-[var(--radius-input)] transition-all font-medium text-lg border-2",
                                        values[sub.id] === 1
                                            ? "bg-[var(--color-accent)] text-white border-transparent shadow-md scale-[1.02]"
                                            : "bg-white border-[var(--color-bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--color-accent)]"
                                    )}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateValue(sub.id, 0)}
                                    className={cn(
                                        "flex-1 py-4 rounded-[var(--radius-input)] transition-all font-medium text-lg border-2",
                                        values[sub.id] === 0
                                            ? "bg-[var(--color-text-tertiary)] text-white border-transparent"
                                            : "bg-white border-[var(--color-bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--color-text-tertiary)]"
                                    )}
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Date Picker for Backdating */}
                <div className="pt-4 space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" suppressHydrationWarning />
                        Date
                    </label>
                    <input
                        type="date"
                        value={logicalDate}
                        onChange={(e) => setLogicalDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--text-primary)] focus:bg-white focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                    {logicalDate !== format(new Date(), 'yyyy-MM-dd') && (
                        <p className="text-xs text-[var(--color-warning)]">
                            ⚠️ Backdating entry to {new Date(logicalDate + 'T12:00:00').toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="pt-4">
                    <Input
                        placeholder="Any notes for today?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-[var(--color-bg-subtle)] border-transparent focus:bg-white"
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <Button type="button" variant="ghost" className="flex-1 h-12" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-[2] h-12 text-lg shadow-lg shadow-blue-500/20" isLoading={isSubmitting}>
                    Save Entry
                </Button>
            </div>
        </form>
    );
};
