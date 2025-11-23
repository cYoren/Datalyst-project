'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Brain, Microscope, LineChart, Sparkles } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <header className="space-y-4 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 bg-[var(--color-bg-subtle)] rounded-full mb-4">
                    <Microscope className="h-8 w-8 text-[var(--color-accent)]" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                    Cientista de Si Mesmo
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                    Datalyst não é apenas um rastreador de hábitos. É um laboratório pessoal para descobrir o que realmente funciona para você.
                </p>
            </header>

            <div className="grid gap-8 max-w-4xl mx-auto">
                <Card className="p-8 border-l-4 border-l-[var(--color-accent)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <LineChart className="h-6 w-6 text-[var(--color-accent)]" />
                        Correlação, não apenas consistência
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        A maioria dos apps foca em "manter o dia a dia". Nós focamos em <strong>entender o porquê</strong>.
                        Ao rastrear variáveis (como horas de sono, nível de estresse, doses de cafeína) junto com seus hábitos,
                        nossos algoritmos encontram padrões ocultos. Talvez você descubra que ler 10 páginas por dia reduz sua ansiedade em 20%,
                        ou que seu foco triplica quando você treina pela manhã.
                    </p>
                </Card>

                <Card className="p-8 border-l-4 border-l-[var(--color-warning)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <Brain className="h-6 w-6 text-[var(--color-warning)]" />
                        Auto-Experimentação
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        Encorajamos você a tratar sua vida como um experimento. Mude uma variável, mantenha as outras constantes e observe os resultados.
                        Datalyst fornece as ferramentas para medir o impacto dessas mudanças com precisão, transformando intuição em dados.
                    </p>
                </Card>

                <Card className="p-8 border-l-4 border-l-[var(--color-success)]">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-[var(--color-success)]" />
                        Sua Verdade Pessoal
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        O que funciona para os "gurus" pode não funcionar para você. Somos biologicamente e psicologicamente únicos.
                        Datalyst ajuda você a construir seu próprio manual de instruções, baseado em evidências da sua própria vida, não em conselhos genéricos.
                    </p>
                </Card>
            </div>

            <div className="text-center pt-10">
                <p className="text-[var(--text-tertiary)] italic">
                    "O que não é medido não é gerenciado." — Peter Drucker
                </p>
            </div>
        </div>
    );
}
