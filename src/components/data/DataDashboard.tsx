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
import { Download, Filter, Edit2, BarChart3, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface DataDashboardProps {
    habits: any[];
    entries: any[];
    onRefresh?: () => void;
}

const PAGE_SIZE = 50;

export function DataDashboard({ habits, entries, onRefresh }: DataDashboardProps) {
    const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || '');
    const [editingEntry, setEditingEntry] = useState<any | null>(null);
    const [page, setPage] = useState(0);

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
            window.location.reload();
        }
    };

    if (!selectedHabit) {
        return (
            <div className="text-center py-12 space-y-4">
                <BarChart3 className="h-12 w-12 mx-auto text-[var(--text-tertiary)] opacity-50" suppressHydrationWarning />
                <div>
                    <p className="text-[var(--text-secondary)] font-medium">No protocols yet</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Create a protocol to start tracking and see your data here.
                    </p>
                </div>
                <Link
                    href="/habits/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-[var(--radius-button)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                    <PlusCircle className="h-4 w-4" suppressHydrationWarning />
                    Create Protocol
                </Link>
            </div>
        );
    }

    const handleExportCSV = () => {
        if (!selectedHabit || habitEntries.length === 0) return;

        const headers = ['Date', 'Note', ...selectedHabit.subvariables.map((s: any) => s.name)];

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
                        onClick={() => { setSelectedHabitId(habit.id); setPage(0); }}
                        className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all ${selectedHabitId === habit.id
                            ? 'bg-[var(--color-accent)] text-white shadow-md'
                            : 'bg-[var(--color-bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--color-border)]'
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
                        <h3 className="text-lg font-semibold mb-6 text-[var(--text-primary)] font-display flex items-center gap-2">
                            {sub.name}
                            <span className="text-xs font-normal text-[var(--text-tertiary)] px-2 py-1 bg-[var(--color-bg-subtle)] rounded-[var(--radius-input)] font-body">
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
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            stroke="var(--text-tertiary)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={sub.type === 'SCALE_0_10' ? [0, 10] : ['auto', 'auto']}
                                            width={25}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--color-bg-card)',
                                                borderColor: 'var(--color-border)',
                                                borderRadius: 'var(--radius-input)',
                                                boxShadow: 'var(--shadow-hover)',
                                                color: 'var(--color-text-primary)',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={sub.name}
                                            stroke="#0F766E"
                                            strokeWidth={3}
                                            dot={{ fill: 'var(--color-bg-card)', strokeWidth: 2, r: 4, stroke: '#0F766E' }}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#0F766E' }}
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
                                                borderRadius: 'var(--radius-input)',
                                                color: 'var(--color-text-primary)',
                                            }}
                                        />
                                        <Bar dataKey={sub.name} fill="#0F766E" radius={[4, 4, 0, 0]} />
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
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] font-display">Detailed History</h3>
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" suppressHydrationWarning />
                        Export CSV
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--text-tertiary)] uppercase bg-[var(--color-bg-subtle)] font-display">
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
                            {habitEntries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((entry) => (
                                <tr key={entry.id} className="bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap tabular-nums">
                                        {format(new Date(entry.logicalDate), "MMM dd, yyyy")}
                                    </td>
                                    {selectedHabit.subvariables.map((sub: any) => {
                                        const subEntry = entry.subvariableEntries.find((s: any) => s.subvariableId === sub.id);
                                        return (
                                            <td key={sub.id} className="px-6 py-4 text-[var(--text-secondary)] tabular-nums">
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
                                            className="p-2 rounded-[var(--radius-input)] hover:bg-[var(--color-bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--color-accent)] transition-colors"
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

            {/* Pagination */}
            {habitEntries.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-[var(--text-tertiary)] tabular-nums">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, habitEntries.length)} of {habitEntries.length}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" suppressHydrationWarning /> Prev
                        </Button>
                        <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= habitEntries.length} onClick={() => setPage(p => p + 1)}>
                            Next <ChevronRight className="h-4 w-4" suppressHydrationWarning />
                        </Button>
                    </div>
                </div>
            )}

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
