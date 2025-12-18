import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    passwordHash: z.string().optional(),
    timezone: z.string().default('America/Sao_Paulo'),
    locale: z.string().default('pt-BR'),
    theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).default('SYSTEM'),
});

// Habit validation schemas
export const createHabitSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color').default('#3b82f6'),
    icon: z.string().default('🎯'),
    // New Protocol Rules fields
    scheduleType: z.enum(['DAILY', 'WEEKLY', 'ADHOC']).default('DAILY'),
    scheduleDays: z.array(z.number().min(0).max(6)).default([]), // 0=Sunday...6=Saturday
    timeBlock: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME']).default('ANYTIME'),
    // Legacy (backward compat)
    schedule: z.object({
        daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
    }).optional(),
});

export const updateHabitSchema = createHabitSchema.partial();

// Subvariable validation schemas
export const createSubvariableSchema = z.object({
    habitId: z.string().cuid(),
    name: z.string().min(1, 'Name is required').max(100),
    type: z.enum(['NUMERIC', 'SCALE_0_10', 'BOOLEAN', 'CATEGORY']),
    unit: z.string().max(50).optional(),
    prompt: z.string().max(200).optional().nullable(),
    goalDirection: z.enum(['HIGHER_BETTER', 'LOWER_BETTER', 'NEUTRAL']).default('NEUTRAL'),
    metadata: z.record(z.string(), z.any()).optional(),
    order: z.number().int().min(0).default(0),
});

// Entry validation schemas
export const createEntrySchema = z.object({
    habitId: z.string().cuid(),
    logicalDate: z.string().datetime(), // ISO 8601
    timestamp: z.string().datetime().optional(), // Optional, defaults to now
    note: z.string().max(1000).optional(),
    subvariableEntries: z.array(
        z.object({
            subvariableId: z.string().cuid(),
            numericValue: z.number(),
            rawValue: z.string().optional(),
        })
    ).min(1, 'Pelo menos uma subvariável deve ser preenchida'),
});

export const updateEntrySchema = z.object({
    logicalDate: z.string().datetime().optional(),
    note: z.string().max(1000).optional(),
    subvariableEntries: z.array(
        z.object({
            subvariableId: z.string().cuid(),
            numericValue: z.number(),
            rawValue: z.string().optional(),
        })
    ).optional(),
});

// Session log schema
export const createSessionSchema = z.object({
    origin: z.string().default('web'),
    duration: z.number().int().min(0).optional(),
});

// Date range schema for queries
export const dateRangeSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
});
