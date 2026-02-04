import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import { startOfDay, endOfDay, getDay, format } from 'date-fns';
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
        const todayStr = format(now, 'yyyy-MM-dd');

        // Fetch active experiment for this user to link with habits
        const activeExperiment = await prisma.experiment.findFirst({
            where: {
                userId: user.id,
                status: 'ACTIVE',
            },
            include: {
                assignments: {
                    where: { date: todayStr }
                }
            }
        });

        // Parse condition labels if experiment exists
        let conditionLabels: string[] = ['A', 'B'];
        if (activeExperiment) {
            try {
                const raw = (activeExperiment as any).conditions;
                if (raw && typeof raw === 'string') {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length >= 2) {
                        conditionLabels = parsed.map((c: any) => c.label);
                    }
                }
            } catch { /* use default */ }
        }

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
                    // Active Assignment details for the dashboard banner
                    activeAssignment: activeExperiment && activeExperiment.independentId === habit.id ? {
                        experimentId: activeExperiment.id,
                        experimentName: activeExperiment.name,
                        condition: activeExperiment.assignments[0]?.condition,
                        isWashout: activeExperiment.assignments[0]?.isWashout || false,
                        conditionLabel: activeExperiment.assignments[0]?.condition ?
                            (activeExperiment.assignments[0].condition === 'A' ? conditionLabels[0] :
                                activeExperiment.assignments[0].condition === 'B' ? conditionLabels[1] :
                                    activeExperiment.assignments[0].condition) : undefined
                    } : null,
                    // Flag to indicate if this variable is the independent variable in an active experiment
                    // When true, the variable should be hidden from TodaysLogWidget (managed by ProtocolCommandCenter)
                    isExperimentIndependent: activeExperiment && activeExperiment.independentId === habit.id,
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
