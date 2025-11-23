import { prisma } from '@/lib/prisma';
import { DataDashboard } from '@/components/data/DataDashboard';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DataPage() {
    const habits = await prisma.habit.findMany({
        where: { archived: false },
        include: { subvariables: true },
        orderBy: { createdAt: 'asc' }
    });

    const entries = await prisma.habitEntry.findMany({
        where: {
            habitId: { in: habits.map((h: any) => h.id) }
        },
        include: { subvariableEntries: true },
        orderBy: { logicalDate: 'desc' },
        take: 1000 // Limit for performance, maybe implement pagination later
    });

    return (
        <div className="space-y-8 pb-20">
            <header className="animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 text-[var(--color-accent)]" />
                    Dados Organizados
                </h1>
                <p className="text-[var(--text-secondary)] mt-2 text-lg">
                    Visualize o progresso dos seus hábitos em tabelas e gráficos.
                </p>
            </header>

            <div className="animate-slide-up">
                <DataDashboard habits={habits} entries={entries} />
            </div>
        </div>
    );
}
