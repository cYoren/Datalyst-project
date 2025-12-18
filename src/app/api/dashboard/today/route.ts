import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import { startOfDay, endOfDay, getDay } from 'date-fns';
import { ScheduleType } from '@prisma/client';

/**
 * GET /api/dashboard/today
 * Returns all active variables with today's log status for the Today's Log widget
 */
export async function GET() {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date range in user's timezone
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const todayDayOfWeek = getDay(now); // 0 = Sunday, 1 = Monday...

        // Fetch all active habits with their subvariables
        const habits = await prisma.habit.findMany({
            where: {
                userId: user.id,
                archived: false,
            },
            select: {
                id: true,
                name: true,
                icon: true,
                color: true,
                scheduleType: true,
                scheduleDays: true,
                timeBlock: true,
                rank: true,
                subvariables: {
                    where: {
                        active: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        unit: true,
                        prompt: true,
                        goalDirection: true,
                        metadata: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                entries: {
                    where: {
                        logicalDate: {
                            gte: todayStart,
                            lte: todayEnd,
                        },
                    },
                    select: {
                        id: true,
                        subvariableEntries: {
                            select: {
                                id: true,
                                subvariableId: true,
                                numericValue: true,
                                rawValue: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { timeBlock: 'asc' }, // Rough sort by time block enum
                { rank: 'asc' },
                { createdAt: 'asc' },
            ],
        });

        // Build the aggregated variable list
        const variables: any[] = [];

        for (const habit of habits) {
            // FILTERING RULES
            // 1. Exclude ADHOC habits from Today's Log
            if (habit.scheduleType === ScheduleType.ADHOC) {
                continue;
            }

            // 2. Filter WEEKLY habits by day
            if (habit.scheduleType === ScheduleType.WEEKLY) {
                // If scheduleDays is empty, assume daily/all days (fallback)
                if (habit.scheduleDays.length > 0 && !habit.scheduleDays.includes(todayDayOfWeek)) {
                    continue;
                }
            }

            // Create a map of today's entries by subvariable
            const todayEntriesMap = new Map<string, { entryId: string; subEntryId: string; numericValue: number; rawValue?: string }>();

            for (const entry of habit.entries) {
                for (const subEntry of entry.subvariableEntries) {
                    todayEntriesMap.set(subEntry.subvariableId, {
                        entryId: entry.id,
                        subEntryId: subEntry.id,
                        numericValue: subEntry.numericValue,
                        rawValue: subEntry.rawValue || undefined,
                    });
                }
            }

            // Add each subvariable to the variables list
            for (const sub of habit.subvariables) {
                const todayEntry = todayEntriesMap.get(sub.id);

                // Parse metadata
                let metadata = {};
                try {
                    metadata = typeof sub.metadata === 'string'
                        ? JSON.parse(sub.metadata)
                        : sub.metadata || {};
                } catch {
                    metadata = {};
                }

                variables.push({
                    id: sub.id,
                    name: sub.name,
                    type: sub.type,
                    unit: sub.unit,
                    prompt: sub.prompt,
                    goalDirection: sub.goalDirection,
                    metadata,
                    habitId: habit.id,
                    habitName: habit.name,
                    habitIcon: habit.icon,
                    habitColor: habit.color,
                    timeBlock: habit.timeBlock,
                    rank: habit.rank,
                    todayEntry: todayEntry ? {
                        entryId: todayEntry.entryId,
                        subvariableEntryId: todayEntry.subEntryId,
                        numericValue: todayEntry.numericValue,
                        rawValue: todayEntry.rawValue,
                    } : undefined,
                });
            }
        }

        const logged = variables.filter(v => v.todayEntry).length;
        const total = variables.length;

        return NextResponse.json({
            variables,
            logged,
            total,
            percentage: total > 0 ? Math.round((logged / total) * 100) : 0,
        });
    } catch (error) {
        console.error('Error fetching today\'s log:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
