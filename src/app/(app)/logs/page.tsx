'use client';

import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollText, Activity, Clock, Loader2 } from 'lucide-react';
import { useLogsPage, useUser } from '@/lib/hooks';

export default function LogsPage() {
    const { user, isLoading: userLoading } = useUser();
    const { events, sessions, isLoading: logsLoading } = useLogsPage();

    const isLoading = userLoading || logsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
        );
    }

    // Combine and sort
    const allLogs = [
        ...events.map((e: any) => ({ ...e, type: 'EVENT', sortTime: e.timestamp })),
        ...sessions.map((s: any) => ({ ...s, type: 'SESSION', sortTime: s.timestamp }))
    ].sort((a, b) => new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime());

    return (
        <div className="space-y-8 pb-20">
            <header className="animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                    <ScrollText className="h-10 w-10 text-[var(--color-accent)]" suppressHydrationWarning />
                    Logs do Sistema
                </h1>
                <p className="text-[var(--text-secondary)] mt-2 text-lg">
                    Registro bruto de atividades e sessões.
                </p>
            </header>

            <div className="space-y-4 animate-slide-up">
                {allLogs.map((log: any) => (
                    <Card key={log.id} className="p-4 border-l-4 border-l-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {log.type === 'EVENT' ? (
                                        <Activity className="h-5 w-5 text-blue-500" suppressHydrationWarning />
                                    ) : (
                                        <Clock className="h-5 w-5 text-green-500" suppressHydrationWarning />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-mono text-sm font-bold text-[var(--text-primary)]">
                                        {log.type === 'EVENT' ? log.eventType : 'APP_SESSION_START'}
                                    </h3>
                                    <p className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
                                        ID: {log.id}
                                    </p>
                                    {log.metadata && log.metadata !== '{}' && (
                                        <div className="mt-2 bg-[var(--color-bg-page)] p-2 rounded text-xs font-mono text-[var(--text-secondary)] overflow-x-auto max-w-xl">
                                            {log.metadata}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end text-right gap-1">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                    {format(new Date(log.sortTime), "dd 'de' MMM, HH:mm:ss", { locale: ptBR })}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {user?.email}
                                </span>
                                {log.origin && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--text-secondary)]">
                                        {log.origin}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {allLogs.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-tertiary)]">
                        Nenhum log encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
