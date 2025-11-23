import { prisma } from '@/lib/prisma';
import { createEntrySchema, updateEntrySchema } from '@/lib/validations';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays } from 'date-fns';

type CreateEntryInput = z.infer<typeof createEntrySchema>;
type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export class EntryService {
    /**
     * Creates a new habit entry with subvariable values
     */
    static async createEntry(userId: string, data: CreateEntryInput) {
        // Verify habit ownership
        const habit = await prisma.habit.findUnique({
            where: { id: data.habitId },
        });

        if (!habit || habit.userId !== userId) {
            throw new Error('Habit not found or access denied');
        }

        // Check if entry already exists for this date (optional logic, allowing multiple for now but could restrict)
        // For this app, we might want to allow multiple entries per day (e.g. drank water), 
        // or restrict to one. The schema allows multiple. 

        return await prisma.$transaction(async (tx) => {
            const entry = await tx.habitEntry.create({
                data: {
                    habitId: data.habitId,
                    userId,
                    logicalDate: new Date(data.logicalDate),
                    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                    note: data.note,
                },
            });

            if (data.subvariableEntries && data.subvariableEntries.length > 0) {
                await tx.subvariableEntry.createMany({
                    data: data.subvariableEntries.map(sub => ({
                        habitEntryId: entry.id,
                        subvariableId: sub.subvariableId,
                        numericValue: sub.numericValue,
                        rawValue: sub.rawValue,
                    })),
                });
            }

            // Log event
            await tx.userEvent.create({
                data: {
                    userId,
                    eventType: 'ENTRY_CREATED',
                    entityId: entry.id,
                    metadata: JSON.stringify({ habitId: data.habitId }),
                },
            });

            return entry;
        });
    }

    /**
     * Updates an existing entry
     */
    static async updateEntry(userId: string, entryId: string, data: UpdateEntryInput) {
        const existing = await prisma.habitEntry.findUnique({
            where: { id: entryId },
            include: { subvariableEntries: true },
        });

        if (!existing || existing.userId !== userId) {
            throw new Error('Entry not found or access denied');
        }

        return await prisma.$transaction(async (tx) => {
            // Update basic info
            const updatedEntry = await tx.habitEntry.update({
                where: { id: entryId },
                data: {
                    logicalDate: data.logicalDate ? new Date(data.logicalDate) : undefined,
                    note: data.note,
                },
            });

            // Update subvariables if provided
            if (data.subvariableEntries) {
                // We need to update existing ones or create new ones. 
                // Simplest strategy: Delete all existing subvariable entries for this entry and recreate them
                // OR update individually. Recreating is safer for consistency if we send the full list.

                // Let's assume the frontend sends the FULL list of subvariable values for this entry.
                await tx.subvariableEntry.deleteMany({
                    where: { habitEntryId: entryId },
                });

                await tx.subvariableEntry.createMany({
                    data: data.subvariableEntries.map(sub => ({
                        habitEntryId: entryId,
                        subvariableId: sub.subvariableId,
                        numericValue: sub.numericValue,
                        rawValue: sub.rawValue,
                    })),
                });
            }

            return updatedEntry;
        });
    }

    /**
     * Get entries for a specific date range
     */
    static async getEntries(userId: string, startDate: Date, endDate: Date) {
        return await prisma.habitEntry.findMany({
            where: {
                userId,
                logicalDate: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
            },
            include: {
                habit: {
                    select: { name: true, icon: true, color: true }
                },
                subvariableEntries: {
                    include: {
                        subvariable: {
                            select: { name: true, type: true, unit: true }
                        }
                    }
                }
            },
            orderBy: { timestamp: 'desc' },
        });
    }

    /**
     * Get recent entries for a specific habit (for history view)
     */
    static async getHabitHistory(userId: string, habitId: string, limit = 30) {
        return await prisma.habitEntry.findMany({
            where: {
                userId,
                habitId,
            },
            include: {
                subvariableEntries: true,
            },
            orderBy: { logicalDate: 'desc' },
            take: limit,
        });
    }

    /**
     * Get suggested values based on recent history (last 7 entries)
     */
    static async getSuggestedValues(userId: string, habitId: string) {
        const recentEntries = await prisma.habitEntry.findMany({
            where: { userId, habitId },
            include: { subvariableEntries: true },
            orderBy: { timestamp: 'desc' },
            take: 5,
        });

        if (recentEntries.length === 0) return null;

        // Map subvariableId -> value
        const suggestions: Record<string, number> = {};
        const counts: Record<string, number> = {};

        recentEntries.forEach(entry => {
            entry.subvariableEntries.forEach(sub => {
                if (!suggestions[sub.subvariableId]) {
                    suggestions[sub.subvariableId] = 0;
                    counts[sub.subvariableId] = 0;
                }
                suggestions[sub.subvariableId] += sub.numericValue;
                counts[sub.subvariableId]++;
            });
        });

        // Calculate average
        Object.keys(suggestions).forEach(key => {
            suggestions[key] = suggestions[key] / counts[key];
        });

        return suggestions;
    }
}
