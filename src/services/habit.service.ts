import { prisma } from '@/lib/prisma';
import { createHabitSchema, updateHabitSchema, createSubvariableSchema } from '@/lib/validations';
import { z } from 'zod';
import { SubvariableType } from '@prisma/client';

type CreateHabitInput = z.infer<typeof createHabitSchema> & {
    subvariables: Omit<z.infer<typeof createSubvariableSchema>, 'habitId'>[];
};

type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

export class HabitService {
    /**
     * Creates a new habit with its initial subvariables
     */
    static async createHabit(userId: string, data: CreateHabitInput) {
        const { subvariables, ...habitData } = data;

        // Use a transaction to create habit and subvariables together
        return await prisma.$transaction(async (tx) => {
            const habit = await tx.habit.create({
                data: {
                    userId,
                    name: habitData.name,
                    description: habitData.description,
                    color: habitData.color,
                    icon: habitData.icon,
                    schedule: JSON.stringify(habitData.schedule || {}),
                },
            });

            if (subvariables && subvariables.length > 0) {
                await tx.subvariable.createMany({
                    data: subvariables.map((sub, index) => ({
                        habitId: habit.id,
                        name: sub.name,
                        type: sub.type as SubvariableType,
                        unit: sub.unit,
                        metadata: JSON.stringify(sub.metadata || {}),
                        order: sub.order ?? index,
                    })),
                });
            }

            return habit;
        });
    }

    /**
     * Updates an existing habit
     */
    static async updateHabit(userId: string, habitId: string, data: UpdateHabitInput) {
        // Verify ownership
        const existing = await prisma.habit.findUnique({
            where: { id: habitId },
        });

        if (!existing || existing.userId !== userId) {
            throw new Error('Habit not found or access denied');
        }

        const updateData: any = { ...data };
        if (data.schedule) {
            updateData.schedule = JSON.stringify(data.schedule);
        }

        return await prisma.habit.update({
            where: { id: habitId },
            data: updateData,
        });
    }

    /**
     * Soft deletes a habit (archives it)
     */
    static async deleteHabit(userId: string, habitId: string) {
        const existing = await prisma.habit.findUnique({
            where: { id: habitId },
        });

        if (!existing || existing.userId !== userId) {
            throw new Error('Habit not found or access denied');
        }

        return await prisma.habit.update({
            where: { id: habitId },
            data: { archived: true },
        });
    }

    /**
     * Retrieves all active habits for a user
     */
    static async getUserHabits(userId: string) {
        const habits = await prisma.habit.findMany({
            where: {
                userId,
                archived: false,
            },
            include: {
                subvariables: {
                    where: { active: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Parse JSON fields
        return habits.map(habit => {
            let schedule = {};
            try {
                schedule = JSON.parse(habit.schedule);
            } catch (e) {
                console.error(`Failed to parse schedule for habit ${habit.id}`, e);
            }

            return {
                ...habit,
                schedule,
                subvariables: habit.subvariables.map(sub => {
                    let metadata = {};
                    try {
                        metadata = JSON.parse(sub.metadata);
                    } catch (e) {
                        console.error(`Failed to parse metadata for subvariable ${sub.id}`, e);
                    }
                    return {
                        ...sub,
                        metadata,
                    };
                }),
            };
        });
    }

    /**
     * Retrieves a single habit with details
     */
    static async getHabitById(userId: string, habitId: string) {
        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
            include: {
                subvariables: {
                    where: { active: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!habit || habit.userId !== userId) {
            return null;
        }

        return {
            ...habit,
            schedule: JSON.parse(habit.schedule),
            subvariables: habit.subvariables.map(sub => ({
                ...sub,
                metadata: JSON.parse(sub.metadata),
            })),
        };
    }
}
