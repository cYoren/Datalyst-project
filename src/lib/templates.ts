import { SubvariableType } from '@prisma/client';

export const HABIT_TEMPLATES = [
    {
        id: 'gym',
        name: 'Academia',
        icon: '💪',
        color: '#ef4444',
        description: 'Treino de força ou cardio',
        subvariables: [
            {
                name: 'Duração',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 0,
                metadata: { step: 5 }
            },
            {
                name: 'Esforço',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Leve', 'Exaustivo'] }
            },
            {
                name: 'Satisfação',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Ruim', 'Ótimo'] }
            }
        ]
    },
    {
        id: 'meditation',
        name: 'Meditação',
        icon: '🧘',
        color: '#8b5cf6',
        description: 'Prática de mindfulness',
        subvariables: [
            {
                name: 'Tempo',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 0,
                metadata: { step: 1 }
            },
            {
                name: 'Foco',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Disperso', 'Focado'] }
            },
            {
                name: 'Calma pós',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Agitado', 'Zen'] }
            }
        ]
    },
    {
        id: 'sleep',
        name: 'Sono',
        icon: '😴',
        color: '#3b82f6',
        description: 'Qualidade e duração do sono',
        subvariables: [
            {
                name: 'Horas',
                type: SubvariableType.NUMERIC,
                unit: 'h',
                order: 0,
                metadata: { step: 0.5 }
            },
            {
                name: 'Qualidade',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Péssima', 'Excelente'] }
            },
            {
                name: 'Acordou bem?',
                type: SubvariableType.BOOLEAN,
                order: 2,
                metadata: {}
            }
        ]
    },
    {
        id: 'reading',
        name: 'Leitura',
        icon: '📚',
        color: '#10b981',
        description: 'Leitura de livros ou artigos',
        subvariables: [
            {
                name: 'Páginas',
                type: SubvariableType.NUMERIC,
                unit: 'pág',
                order: 0,
                metadata: { step: 1 }
            },
            {
                name: 'Tempo',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 1,
                metadata: { step: 5 }
            },
            {
                name: 'Interesse',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Chato', 'Incrível'] }
            }
        ]
    }
];
