'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EntryEditForm } from '@/components/forms/EntryEditForm';
import { format } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Download, Filter, Edit2 } from 'lucide-react';

// Fallback if UI Table components don't exist, I'll use standard HTML for now to be safe
// Actually, I should check if Table components exist. I'll assume standard HTML with Tailwind classes for safety.

interface DataDashboardProps {
    habits: any[];
    entries: any[];
    onRefresh?: () => void;
}

export function DataDashboard({ habits, entries, onRefresh }: DataDashboardProps) {
    const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || '');
    const [editingEntry, setEditingEntry] = useState<any | null>(null);

    const selectedHabit = habits.find(h => h.id === selectedHabitId);

    const habitEntries = useMemo(() => {
        if (!selectedHabitId) return [];
        return entries
            .filter(e => e.habitId === selectedHabitId)
            .sort((a, b) => new Date(a.logicalDate).getTime() - new Date(b.logicalDate).getTime());
    }, [selectedHabitId, entries]);

    const chartData = useMemo(() => {
        return habitEntries.map(entry => {
            const dataPoint: any = {
                date: format(new Date(entry.logicalDate), 'MM/dd'),
                fullDate: format(new Date(entry.logicalDate), "MMM dd"),
            };

            entry.subvariableEntries.forEach((sub: any) => {
                const subDef = selectedHabit?.subvariables.find((s: any) => s.id === sub.subvariableId);
                if (subDef) {
                    if (subDef.type === 'CATEGORY') {
                        dataPoint[subDef.name] = sub.rawValue;
                    } else {
                        dataPoint[subDef.name] = sub.numericValue;
                    }
                }
            });
            return dataPoint;
        });
    }, [habitEntries, selectedHabit]);

    const handleEditSuccess = () => {
        setEditingEntry(null);
        if (onRefresh) {
            onRefresh();
        } else {
            // Force page refresh if no onRefresh provided
            window.location.reload();
        }
    };

    if (!selectedHabit) {
        return (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
                No habit found. Create a habit to view data.
            </div>
        );
    }

    const handleExportCSV = () => {
        if (!selectedHabit || habitEntries.length === 0) return;

        // Headers
        const headers = ['Date', 'Note', ...selectedHabit.subvariables.map((s: any) => s.name)];

        // Rows
        const rows = habitEntries.map(entry => {
            const date = format(new Date(entry.logicalDate), 'yyyy-MM-dd');
            const note = entry.note ? `"${entry.note.replace(/"/g, '""')}"` : '';

            const subValues = selectedHabit.subvariables.map((sub: any) => {
                const subEntry = entry.subvariableEntries.find((s: any) => s.subvariableId === sub.id);
                if (!subEntry) return '';
                return subEntry.rawValue || subEntry.numericValue;
            });

            return [date, note, ...subValues].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedHabit.name}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {/* Habit Selector */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-[var(--color-border)]">
                {habits.map(habit => (
                    <button
                        key={habit.id}
                        onClick={() => setSelectedHabitId(habit.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedHabitId === habit.id
                            ? 'bg-[var(--color-accent)] text-white shadow-md'
                            : 'bg-[var(--color-bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--color-bg-hover)]'
                            }`}
                    >
                        <span className="mr-2">{habit.icon}</span>
                        {habit.name}
                    </button>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-8">
                {selectedHabit.subvariables.map((sub: any) => (
                    <Card key={sub.id} className="p-6">
                        <h3 className="text-lg font-semibold mb-6 text-[var(--text-primary)] flex items-center gap-2">
                            {sub.name}
                            <span className="text-xs font-normal text-[var(--text-tertiary)] px-2 py-1 bg-[var(--color-bg-subtle)] rounded-full">
                                {sub.type}
                            </span>
                        </h3>

                        <div className="h-[300px] w-full">
                            {(sub.type === 'NUMERIC' || sub.type === 'SCALE_0_10') && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="var(--text-tertiary)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="var(--text-tertiary)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={sub.type === 'SCALE_0_10' ? [0, 10] : ['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--color-bg-card)',
                                                borderColor: 'var(--color-border)',
                                                borderRadius: '8px',
                                                boxShadow: 'var(--shadow-md)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={sub.name}
                                            stroke="var(--color-accent)"
                                            strokeWidth={3}
                                            dot={{ fill: 'var(--color-bg-page)', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            {sub.type === 'BOOLEAN' && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--color-bg-subtle)' }}
                                            contentStyle={{
                                                backgroundColor: 'var(--color-bg-card)',
                                                borderColor: 'var(--color-border)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey={sub.name} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {sub.type === 'CATEGORY' && (
                                <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">
                                    Category visualization coming soon (see table below)
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Data Table */}
            <Card className="overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Detailed History</h3>
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" suppressHydrationWarning />
                        Export CSV
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--text-tertiary)] uppercase bg-[var(--color-bg-subtle)]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                {selectedHabit.subvariables.map((sub: any) => (
                                    <th key={sub.id} className="px-6 py-3 font-medium">{sub.name}</th>
                                ))}
                                <th className="px-6 py-3 font-medium">Note</th>
                                <th className="px-6 py-3 font-medium w-16">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {habitEntries.map((entry) => (
                                <tr key={entry.id} className="bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">
                                        {format(new Date(entry.logicalDate), "MMM dd, yyyy")}
                                    </td>
                                    {selectedHabit.subvariables.map((sub: any) => {
                                        const subEntry = entry.subvariableEntries.find((s: any) => s.subvariableId === sub.id);
                                        return (
                                            <td key={sub.id} className="px-6 py-4 text-[var(--text-secondary)]">
                                                {subEntry
                                                    ? (subEntry.rawValue || subEntry.numericValue)
                                                    : '-'}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate">
                                        {entry.note || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setEditingEntry({
                                                ...entry,
                                                habit: selectedHabit
                                            })}
                                            className="p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
                                            title="Edit entry"
                                        >
                                            <Edit2 className="h-4 w-4" suppressHydrationWarning />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {habitEntries.length === 0 && (
                                <tr>
                                    <td colSpan={selectedHabit.subvariables.length + 3} className="px-6 py-8 text-center text-[var(--text-tertiary)]">
                                        No entries found for this protocol.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Entry Edit Modal */}
            <Modal
                isOpen={!!editingEntry}
                onClose={() => setEditingEntry(null)}
                title="Edit Entry"
            >
                {editingEntry && (
                    <EntryEditForm
                        entry={editingEntry}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingEntry(null)}
                        onDelete={handleEditSuccess}
                    />
                )}
            </Modal>
        </div>
    );
}
