'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HabitForm } from '@/components/forms/HabitForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [habit, setHabit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [habitId, setHabitId] = useState<string>('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateSaved, setTemplateSaved] = useState(false);

    useEffect(() => {
        const initParams = async () => {
            const resolvedParams = await params;
            setHabitId(resolvedParams.id);
        };
        initParams();
    }, [params]);

    useEffect(() => {
        if (!habitId) return;

        const fetchHabit = async () => {
            try {
                const res = await fetch(`/api/habits/${habitId}`);
                if (!res.ok) {
                    throw new Error('Habit not found');
                }

                // Check if response is JSON
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Invalid response format');
                }

                const data = await res.json();
                setHabit(data);
            } catch (error) {
                console.error('Failed to fetch habit:', error);
                alert('Protocol not found');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchHabit();
    }, [habitId, router]);

    const handleSubmit = async (data: any) => {
        if (!habitId) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                // Check if response is JSON before trying to parse it
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const json = await res.json();
                    const errorMessage = json.error ? JSON.stringify(json.error) : 'Error updating protocol';
                    alert(errorMessage);
                    throw new Error(errorMessage);
                } else {
                    alert('Error updating protocol: Server returned unexpected error');
                    throw new Error('Server returned non-JSON error');
                }
            }

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!habitId) return;
        setShowArchiveConfirm(false);

        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete habit');
            }

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error archiving protocol');
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!habit) return;
        setIsSavingTemplate(true);
        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: habit.name,
                    description: habit.description || '',
                    color: habit.color,
                    icon: habit.icon,
                    subvariableTemplate: habit.subvariables || [],
                }),
            });
            if (!res.ok) throw new Error('Failed to save template');
            setTemplateSaved(true);
            setTimeout(() => setTemplateSaved(false), 2000);
        } catch (error) {
            console.error(error);
            alert('Error saving template');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
        );
    }

    if (!habit) {
        return null;
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Protocol</h1>
                        <p className="text-[var(--text-secondary)]">Modify your protocol settings.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveAsTemplate}
                        disabled={isSavingTemplate || templateSaved}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {templateSaved ? 'Saved!' : isSavingTemplate ? 'Saving...' : 'Save as Template'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowArchiveConfirm(true)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Archive Protocol
                    </Button>
                </div>
            </header>

            <HabitForm
                initialData={habit}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Archive Confirmation Modal */}
            <Modal
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                title="Archive Protocol?"
            >
                <div className="space-y-4">
                    <p className="text-[var(--text-secondary)]">
                        Are you sure you want to archive this protocol? It will no longer appear on the dashboard.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowArchiveConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Archive
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
