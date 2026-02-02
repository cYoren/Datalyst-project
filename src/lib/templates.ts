import { SubvariableType } from '@prisma/client';

// ── Individual Templates ──────────────────────────────────────────

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
    },
    {
        id: 'caffeine',
        name: 'Caffeine Intake',
        icon: '☕',
        color: '#92400e',
        description: 'Track coffee, tea, and caffeine consumption',
        subvariables: [
            { name: 'Cups', type: SubvariableType.NUMERIC, unit: 'cups', order: 0, metadata: { step: 1 } },
            { name: 'Last cup time', type: SubvariableType.NUMERIC, unit: 'h (24h)', order: 1, metadata: { step: 1 } },
            { name: 'Jitters', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['None', 'Wired'] } }
        ]
    },
    {
        id: 'screen-time',
        name: 'Screen Time',
        icon: '📱',
        color: '#6366f1',
        description: 'Track daily screen usage',
        subvariables: [
            { name: 'Hours', type: SubvariableType.NUMERIC, unit: 'h', order: 0, metadata: { step: 0.5 } },
            { name: 'Before bed?', type: SubvariableType.BOOLEAN, order: 1, metadata: {} }
        ]
    },
    {
        id: 'deep-work',
        name: 'Deep Work',
        icon: '🎯',
        color: '#0891b2',
        description: 'Focused work sessions without distractions',
        subvariables: [
            { name: 'Hours', type: SubvariableType.NUMERIC, unit: 'h', order: 0, metadata: { step: 0.5 } },
            { name: 'Focus quality', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Scattered', 'Flow state'] } },
            { name: 'Tasks completed', type: SubvariableType.NUMERIC, unit: 'tasks', order: 2, metadata: { step: 1 } }
        ]
    },
    {
        id: 'mood',
        name: 'Mood',
        icon: '🌤️',
        color: '#f59e0b',
        description: 'Daily mood and emotional state',
        subvariables: [
            { name: 'Mood', type: SubvariableType.SCALE_0_10, order: 0, metadata: { labels: ['Very low', 'Great'] } },
            { name: 'Anxiety', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Calm', 'Very anxious'] } },
            { name: 'Energy', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['Drained', 'Energized'] } }
        ]
    },
    {
        id: 'exercise',
        name: 'Exercise',
        icon: '🏃',
        color: '#16a34a',
        description: 'Any physical activity',
        subvariables: [
            { name: 'Duration', type: SubvariableType.NUMERIC, unit: 'min', order: 0, metadata: { step: 5 } },
            { name: 'Intensity', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Light', 'Max effort'] } },
            { name: 'Enjoyment', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['Dreaded it', 'Loved it'] } }
        ]
    },
    {
        id: 'social',
        name: 'Social Interaction',
        icon: '👥',
        color: '#ec4899',
        description: 'Social connections and interactions',
        subvariables: [
            { name: 'Hours socializing', type: SubvariableType.NUMERIC, unit: 'h', order: 0, metadata: { step: 0.5 } },
            { name: 'Quality', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Draining', 'Energizing'] } }
        ]
    },
    {
        id: 'nutrition',
        name: 'Nutrition',
        icon: '🥗',
        color: '#84cc16',
        description: 'Meals and eating habits',
        subvariables: [
            { name: 'Meals', type: SubvariableType.NUMERIC, unit: 'meals', order: 0, metadata: { step: 1 } },
            { name: 'Water', type: SubvariableType.NUMERIC, unit: 'L', order: 1, metadata: { step: 0.25 } },
            { name: 'How healthy?', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['Junk food', 'Clean eating'] } }
        ]
    },
    {
        id: 'energy',
        name: 'Energy Level',
        icon: '⚡',
        color: '#eab308',
        description: 'Track energy throughout the day',
        subvariables: [
            { name: 'Morning energy', type: SubvariableType.SCALE_0_10, order: 0, metadata: { labels: ['Exhausted', 'Supercharged'] } },
            { name: 'Afternoon energy', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Exhausted', 'Supercharged'] } },
            { name: 'Crashed?', type: SubvariableType.BOOLEAN, order: 2, metadata: {} }
        ]
    },
    {
        id: 'soreness',
        name: 'Soreness / Recovery',
        icon: '🩹',
        color: '#f97316',
        description: 'Post-workout recovery tracking',
        subvariables: [
            { name: 'Soreness', type: SubvariableType.SCALE_0_10, order: 0, metadata: { labels: ['None', 'Can\'t move'] } },
            { name: 'Recovery feel', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Wrecked', 'Fully recovered'] } }
        ]
    },
    {
        id: 'learning',
        name: 'Learning Session',
        icon: '🧠',
        color: '#7c3aed',
        description: 'Study or skill-building sessions',
        subvariables: [
            { name: 'Duration', type: SubvariableType.NUMERIC, unit: 'min', order: 0, metadata: { step: 5 } },
            { name: 'Retention', type: SubvariableType.SCALE_0_10, order: 1, metadata: { labels: ['Nothing stuck', 'Crystal clear'] } },
            { name: 'Difficulty', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['Easy', 'Brain-melting'] } }
        ]
    },
    {
        id: 'spending',
        name: 'Daily Spending',
        icon: '💰',
        color: '#059669',
        description: 'Track daily expenses',
        subvariables: [
            { name: 'Amount', type: SubvariableType.NUMERIC, unit: '$', order: 0, metadata: { step: 1 } },
            { name: 'Necessary?', type: SubvariableType.BOOLEAN, order: 1, metadata: {} },
            { name: 'Regret', type: SubvariableType.SCALE_0_10, order: 2, metadata: { labels: ['Worth it', 'Total waste'] } }
        ]
    }
];

// ── Protocol Bundles ──────────────────────────────────────────────
// Bundles are sets of 2-3 protocols designed to produce meaningful correlations

export interface ProtocolBundle {
    id: string;
    name: string;
    emoji: string;
    description: string;
    whyItCorrelates: string;
    protocolIds: string[]; // references HABIT_TEMPLATES[].id
    focusAreas: string[]; // which onboarding focus areas show this bundle
}

export const PROTOCOL_BUNDLES: ProtocolBundle[] = [
    {
        id: 'sleep-optimization',
        name: 'Sleep Optimization',
        emoji: '🌙',
        description: 'Understand what affects your sleep quality',
        whyItCorrelates: 'Caffeine timing and screen exposure are the top 2 sleep disruptors',
        protocolIds: ['sleep', 'caffeine', 'screen-time'],
        focusAreas: ['Physical Health', 'Mental Wellness']
    },
    {
        id: 'workout-recovery',
        name: 'Workout Recovery',
        emoji: '💪',
        description: 'Optimize training and recovery cycles',
        whyItCorrelates: 'Sleep quality directly predicts next-day recovery and performance',
        protocolIds: ['gym', 'sleep', 'soreness'],
        focusAreas: ['Physical Health']
    },
    {
        id: 'focus-productivity',
        name: 'Focus & Productivity',
        emoji: '🎯',
        description: 'Find what drives your best deep work sessions',
        whyItCorrelates: 'Exercise, sleep, and caffeine form the cognitive performance triangle',
        protocolIds: ['deep-work', 'exercise', 'sleep'],
        focusAreas: ['Productivity']
    },
    {
        id: 'mood-baseline',
        name: 'Mood Baseline',
        emoji: '🌤️',
        description: 'Discover your mood drivers',
        whyItCorrelates: 'Exercise and social connection are top evidence-based mood boosters',
        protocolIds: ['mood', 'exercise', 'social'],
        focusAreas: ['Mental Wellness']
    },
    {
        id: 'energy-management',
        name: 'Energy Management',
        emoji: '⚡',
        description: 'Stop afternoon crashes and feel energized all day',
        whyItCorrelates: 'Energy levels correlate with nutrition timing, sleep, and caffeine patterns',
        protocolIds: ['energy', 'nutrition', 'sleep'],
        focusAreas: ['Physical Health', 'Productivity']
    },
    {
        id: 'learning-performance',
        name: 'Learning Performance',
        emoji: '🧠',
        description: 'Learn faster by optimizing the conditions',
        whyItCorrelates: 'Sleep and focus quality directly affect memory retention',
        protocolIds: ['learning', 'sleep', 'deep-work'],
        focusAreas: ['Learning']
    },
    {
        id: 'reading-habit',
        name: 'Reading Habit',
        emoji: '📚',
        description: 'Build a consistent reading routine',
        whyItCorrelates: 'Screen time competes with reading; energy predicts reading quality',
        protocolIds: ['reading', 'screen-time', 'energy'],
        focusAreas: ['Learning']
    },
    {
        id: 'mindful-wellness',
        name: 'Mindful Wellness',
        emoji: '🧘',
        description: 'Track meditation, mood, and sleep together',
        whyItCorrelates: 'Meditation improves sleep quality and mood — see it in your data',
        protocolIds: ['meditation', 'mood', 'sleep'],
        focusAreas: ['Mental Wellness']
    },
    {
        id: 'spending-awareness',
        name: 'Spending Awareness',
        emoji: '💰',
        description: 'Find patterns in your spending behavior',
        whyItCorrelates: 'Mood and energy levels predict impulsive spending',
        protocolIds: ['spending', 'mood', 'energy'],
        focusAreas: ['Finance']
    }
];

export function getBundlesForFocusArea(focusArea: string): ProtocolBundle[] {
    return PROTOCOL_BUNDLES.filter(b => b.focusAreas.includes(focusArea));
}

export function getTemplateById(id: string) {
    return HABIT_TEMPLATES.find(t => t.id === id);
}

