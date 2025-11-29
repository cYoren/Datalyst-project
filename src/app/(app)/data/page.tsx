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

    if (habits.length === 0) {
        return (
            <div className="space-y-8 pb-20">
                <header className="animate-fade-in">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-[var(--color-accent)]" suppressHydrationWarning />
                        Dados Organizados
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-lg">
                        Visualize o progresso dos seus hábitos em tabelas e gráficos.
                    </p>
                </header>

                <div className="animate-slide-up border border-dashed border-[var(--color-border)] rounded-[var(--radius-card)] p-12 text-center bg-[var(--color-bg-card)]">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="h-24 w-24 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="h-10 w-10 text-[var(--text-tertiary)]" suppressHydrationWarning />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            Seus dados aparecerão aqui
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Assim que você começar a registrar seus hábitos, nós geraremos gráficos e tabelas detalhadas para você acompanhar seu progresso.
                        </p>

                        {/* Mock Graph Preview */}
                        <div className="mt-8 p-6 bg-[var(--color-bg-page)] rounded-xl border border-[var(--color-border)] opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-end justify-between h-32 gap-2">
                                {[40, 70, 45, 90, 60, 80, 95].map((h, i) => (
                                    <div key={i} className="w-full bg-[var(--color-accent)] rounded-t-sm" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mt-4 font-mono">Exemplo de visualização</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 text-[var(--color-accent)]" suppressHydrationWarning />
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
