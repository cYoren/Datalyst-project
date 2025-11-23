'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HabitForm } from '@/components/forms/HabitForm';

export default function NewHabitPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const json = await res.json();
                const errorMessage = json.error ? JSON.stringify(json.error) : 'Erro ao criar hábito';
                alert(errorMessage);
                throw new Error(errorMessage);
            }

            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Novo Hábito</h1>
                <p className="text-[var(--text-secondary)]">Configure o que você quer acompanhar.</p>
            </header>

            <HabitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
