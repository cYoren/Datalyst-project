import { SubvariableType } from '@prisma/client';

export const HABIT_TEMPLATES = [
    {
        id: 'gym',
        name: 'Gym Workout',
        icon: '💪',
        color: '#ef4444',
        description: 'Strength training or cardio',
        subvariables: [
            {
                name: 'Duration',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 0,
                metadata: { step: 5 }
            },
            {
                name: 'Effort',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Light', 'Exhausting'] }
            },
            {
                name: 'Satisfaction',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Poor', 'Great'] }
            }
        ]
    },
    {
        id: 'meditation',
        name: 'Meditation',
        icon: '🧘',
        color: '#8b5cf6',
        description: 'Mindfulness practice',
        subvariables: [
            {
                name: 'Time',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 0,
                metadata: { step: 1 }
            },
            {
                name: 'Focus',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Distracted', 'Focused'] }
            },
            {
                name: 'Post-calm',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Restless', 'Zen'] }
            }
        ]
    },
    {
        id: 'sleep',
        name: 'Sleep',
        icon: '😴',
        color: '#3b82f6',
        description: 'Sleep quality and duration',
        subvariables: [
            {
                name: 'Hours',
                type: SubvariableType.NUMERIC,
                unit: 'h',
                order: 0,
                metadata: { step: 0.5 }
            },
            {
                name: 'Quality',
                type: SubvariableType.SCALE_0_10,
                order: 1,
                metadata: { labels: ['Terrible', 'Excellent'] }
            },
            {
                name: 'Woke up refreshed?',
                type: SubvariableType.BOOLEAN,
                order: 2,
                metadata: {}
            }
        ]
    },
    {
        id: 'reading',
        name: 'Reading',
        icon: '📚',
        color: '#10b981',
        description: 'Reading books or articles',
        subvariables: [
            {
                name: 'Pages',
                type: SubvariableType.NUMERIC,
                unit: 'pages',
                order: 0,
                metadata: { step: 1 }
            },
            {
                name: 'Time',
                type: SubvariableType.NUMERIC,
                unit: 'min',
                order: 1,
                metadata: { step: 5 }
            },
            {
                name: 'Interest',
                type: SubvariableType.SCALE_0_10,
                order: 2,
                metadata: { labels: ['Boring', 'Amazing'] }
            }
        ]
    }
];

