'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SubvariableType } from '@prisma/client';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
}

export const HabitForm = ({ initialData, onSubmit, isSubmitting }: HabitFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [color, setColor] = useState(initialData?.color || '#3b82f6');
    const [icon, setIcon] = useState(initialData?.icon || '🎯');

    // Schedule State
    let parsedSchedule = {};
    try {
        parsedSchedule = initialData?.schedule ? JSON.parse(initialData.schedule) : {};
    } catch (e) {
        console.error('Failed to parse initial schedule', e);
    }
    const initialSchedule: any = parsedSchedule;
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(initialSchedule.frequency || 'daily');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialSchedule.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
    const [logLimit, setLogLimit] = useState<'unlimited' | 'daily'>(initialSchedule.logLimit || 'unlimited');

    const [subvariables, setSubvariables] = useState<any[]>(initialData?.subvariables || []);

    const addSubvariable = (type: SubvariableType) => {
        let metadata = {};
        if (type === SubvariableType.SCALE_0_10) {
            metadata = { labels: ['Baixo', 'Alto'] };
        } else if (type === SubvariableType.CATEGORY) {
            metadata = { options: ['Opção 1', 'Opção 2'] };
        }

        setSubvariables([
            ...subvariables,
            {
                name: '',
                type,
                unit: '',
                metadata,
                order: subvariables.length
            }
        ]);
    };

    const removeSubvariable = (index: number) => {
        setSubvariables(subvariables.filter((_, i) => i !== index));
    };

    const updateSubvariable = (index: number, field: string, value: any) => {
        const newSubs = [...subvariables];
        newSubs[index] = { ...newSubs[index], [field]: value };
        setSubvariables(newSubs);
    };

    const updateSubvariableMetadata = (index: number, key: string, value: any) => {
        const newSubs = [...subvariables];
        newSubs[index] = {
            ...newSubs[index],
            metadata: { ...newSubs[index].metadata, [key]: value }
        };
        setSubvariables(newSubs);
    };

    const toggleDay = (day: number) => {
        if (daysOfWeek.includes(day)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== day));
        } else {
            setDaysOfWeek([...daysOfWeek, day]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const schedule = {
            frequency,
            daysOfWeek: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : daysOfWeek,
            logLimit
        };

        const body = {
            name,
            description,
            color,
            icon,
            schedule,
            subvariables: subvariables.map((s: any) => ({
                name: s.name,
                type: s.type,
                unit: s.unit,
                metadata: s.metadata ? (typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata) : {},
                order: s.order
            }))
        };

        onSubmit(body);
    };

    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];
    const icons = ['🎯', '💪', '🧘', '😴', '📚', '💧', '🥗', '💊', '🎸', '💻', '🧹', '🧠'];
    const weekDays = [
        { label: 'D', value: 0 },
        { label: 'S', value: 1 },
        { label: 'T', value: 2 },
        { label: 'Q', value: 3 },
        { label: 'Q', value: 4 },
        { label: 'S', value: 5 },
        { label: 'S', value: 6 },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Informações Básicas</h3>

                <Input
                    label="Nome do Hábito"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Academia, Leitura"
                    required
                />

                <Input
                    label="Descrição (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Treino de força 3x na semana"
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Frequência</label>
                    <div className="flex gap-2">
                        {(['daily', 'weekly'] as const).map((freq) => (
                            <button
                                key={freq}
                                type="button"
                                onClick={() => setFrequency(freq)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                    frequency === freq
                                        ? "bg-[var(--color-primary-50)] border-[var(--color-primary-500)] text-[var(--color-primary-700)]"
                                        : "bg-white border-[var(--color-slate-200)] text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)]"
                                )}
                            >
                                {freq === 'daily' ? 'Todos os dias' : 'Dias específicos'}
                            </button>
                        ))}
                    </div>

                    {frequency === 'weekly' && (
                        <div className="flex gap-2 mt-2">
                            {weekDays.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all border",
                                        daysOfWeek.includes(day.value)
                                            ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white"
                                            : "bg-white border-[var(--color-slate-200)] text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)]"
                                    )}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Limite de Registros</label>
                    <div className="flex gap-2">
                        {(['unlimited', 'daily'] as const).map((limit) => (
                            <button
                                key={limit}
                                type="button"
                                onClick={() => setLogLimit(limit)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                    logLimit === limit
                                        ? "bg-[var(--color-primary-50)] border-[var(--color-primary-500)] text-[var(--color-primary-700)]"
                                        : "bg-white border-[var(--color-slate-200)] text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)]"
                                )}
                            >
                                {limit === 'unlimited' ? 'Sem limite' : 'Uma vez ao dia'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Cor</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all",
                                    color === c ? "ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110" : "hover:scale-105"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Ícone</label>
                    <div className="flex flex-wrap gap-2">
                        {icons.map(i => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIcon(i)}
                                className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center text-xl transition-all border",
                                    icon === i
                                        ? "bg-[var(--color-primary-50)] border-[var(--color-primary-500)]"
                                        : "bg-white border-[var(--color-slate-200)] hover:bg-[var(--color-slate-50)]"
                                )}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subvariables */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Variáveis para rastrear</h3>
                </div>

                <div className="space-y-3">
                    {subvariables.map((sub, index) => (
                        <Card key={index} className="p-4 flex gap-4 items-start relative group">
                            <div className="mt-3 text-[var(--text-tertiary)]">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Nome da variável"
                                        value={sub.name}
                                        onChange={(e) => updateSubvariable(index, 'name', e.target.value)}
                                        className="flex-1"
                                        required
                                    />
                                    <div className="w-32">
                                        <select
                                            value={sub.type}
                                            onChange={(e) => updateSubvariable(index, 'type', e.target.value)}
                                            className="h-10 w-full rounded-lg border border-[var(--color-slate-200)] px-3 text-sm bg-white focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none"
                                        >
                                            <option value="NUMERIC">Numérico</option>
                                            <option value="SCALE_0_10">Escala 0-10</option>
                                            <option value="BOOLEAN">Sim/Não</option>
                                            <option value="CATEGORY">Categoria</option>
                                        </select>
                                    </div>
                                </div>

                                {sub.type === 'NUMERIC' && (
                                    <Input
                                        placeholder="Unidade (ex: kg, min)"
                                        value={sub.unit || ''}
                                        onChange={(e) => updateSubvariable(index, 'unit', e.target.value)}
                                    />
                                )}

                                {sub.type === 'CATEGORY' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-[var(--text-secondary)]">Opções (separadas por vírgula)</label>
                                        <Input
                                            placeholder="Ex: Feliz, Triste, Ansioso"
                                            value={sub.metadata?.options?.join(', ') || ''}
                                            onChange={(e) => updateSubvariableMetadata(index, 'options', e.target.value.split(',').map((s: string) => s.trim()))}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeSubvariable(index)}
                                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button type="button" variant="secondary" size="sm" onClick={() => addSubvariable(SubvariableType.NUMERIC)}>
                        <Plus className="h-4 w-4 mr-1" /> Numérico
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addSubvariable(SubvariableType.SCALE_0_10)}>
                        <Plus className="h-4 w-4 mr-1" /> Escala 0-10
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addSubvariable(SubvariableType.BOOLEAN)}>
                        <Plus className="h-4 w-4 mr-1" /> Sim/Não
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addSubvariable(SubvariableType.CATEGORY)}>
                        <Plus className="h-4 w-4 mr-1" /> Categoria
                    </Button>
                </div>
            </section>

            <div className="pt-6 border-t border-[var(--color-slate-200)]">
                <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                    Salvar Hábito
                </Button>
            </div>
        </form>
    );
};
