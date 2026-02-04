'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Search, Plus, Clock, X, Loader2 } from 'lucide-react';
import { fetcher } from '@/lib/hooks';

interface AdHocHabit {
    id: string;
    name: string;
    icon: string;
    color: string;
    subvariables: {
        id: string;
        name: string;
        type: string;
    }[];
}

interface AdHocLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogComplete?: () => void;
}



export default function AdHocLogModal({ isOpen, onClose, onLogComplete }: AdHocLogModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHabit, setSelectedHabit] = useState<AdHocHabit | null>(null);
    const [values, setValues] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch ADHOC habits
    const { data: habits, isLoading } = useSWR<AdHocHabit[]>(
        isOpen ? '/api/habits/adhoc' : null,
        fetcher,
        {
            keepPreviousData: true,
            dedupingInterval: 120000,
        }
    );

    // Filter habits by search query
    const filteredHabits = Array.isArray(habits) ? (
        !searchQuery.trim() ? habits : habits.filter(h =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.subvariables.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    ) : [];

    // Handle value change for a subvariable
    const handleValueChange = (subId: string, value: number) => {
        setValues(prev => ({ ...prev, [subId]: value }));
    };

    // Submit log entry
    const handleSubmit = async () => {
        if (!selectedHabit) return;

        setIsSubmitting(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitId: selectedHabit.id,
                    logicalDate: new Date(today).toISOString(),
                    subvariableEntries: Object.entries(values).map(([subId, value]) => ({
                        subvariableId: subId,
                        numericValue: value,
                    })),
                }),
            });

            if (res.ok) {
                onLogComplete?.();
                handleClose();
            }
        } catch (error) {
            console.error('Failed to log entry:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedHabit(null);
        setValues({});
        onClose();
    };

    const handleSelectHabit = (habit: AdHocHabit) => {
        setSelectedHabit(habit);
        // Initialize values for all subvariables
        const initialValues: Record<string, number> = {};
        habit.subvariables.forEach(sub => {
            initialValues[sub.id] = sub.type === 'BOOLEAN' ? 0 : 0;
        });
        setValues(initialValues);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Log Ad-hoc Item">
            <div className="space-y-4">
                {!selectedHabit ? (
                    <>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ad-hoc items..."
                                className="pl-10"
                                autoFocus
                            />
                        </div>

                        {/* Habits List */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                                </div>
                            ) : filteredHabits.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="mb-2">No ad-hoc items found</p>
                                    <p className="text-sm">Create a protocol with "Ad-hoc" schedule type</p>
                                </div>
                            ) : (
                                filteredHabits.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => handleSelectHabit(habit)}
                                        className="w-full p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left flex items-center gap-3"
                                    >
                                        <span className="text-xl">{habit.icon}</span>
                                        <div>
                                            <div className="font-medium text-[var(--text-primary)]">{habit.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {habit.subvariables.map(s => s.name).join(', ')}
                                            </div>
                                        </div>
                                        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                            🔍 Ad-hoc
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Selected Habit Header */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">{selectedHabit.icon}</span>
                            <div className="flex-1">
                                <div className="font-medium text-[var(--text-primary)]">{selectedHabit.name}</div>
                            </div>
                            <button onClick={() => setSelectedHabit(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Subvariable Inputs */}
                        <div className="space-y-3">
                            {selectedHabit.subvariables.map(sub => (
                                <div key={sub.id} className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">{sub.name}</label>
                                    {sub.type === 'BOOLEAN' ? (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleValueChange(sub.id, 0)}
                                                className={cn(
                                                    "flex-1 py-2 rounded-lg border transition-all",
                                                    values[sub.id] === 0
                                                        ? "bg-red-100 border-red-300 text-red-700"
                                                        : "bg-gray-50 border-gray-200 text-gray-600"
                                                )}
                                            >
                                                No
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleValueChange(sub.id, 1)}
                                                className={cn(
                                                    "flex-1 py-2 rounded-lg border transition-all",
                                                    values[sub.id] === 1
                                                        ? "bg-green-100 border-green-300 text-green-700"
                                                        : "bg-gray-50 border-gray-200 text-gray-600"
                                                )}
                                            >
                                                Yes
                                            </button>
                                        </div>
                                    ) : sub.type === 'SCALE_0_10' ? (
                                        <div className="flex gap-1">
                                            {[...Array(11)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleValueChange(sub.id, i)}
                                                    className={cn(
                                                        "flex-1 py-2 rounded text-sm transition-all",
                                                        values[sub.id] === i
                                                            ? "bg-purple-500 text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    )}
                                                >
                                                    {i}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={values[sub.id] || ''}
                                            onChange={(e) => handleValueChange(sub.id, parseFloat(e.target.value) || 0)}
                                            placeholder="Enter value..."
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            Log Entry
                        </Button>
                    </>
                )}
            </div>
        </Modal>
    );
}
