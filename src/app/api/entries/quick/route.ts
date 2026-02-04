import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import { z } from 'zod';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

// Validation schema
const quickEntrySchema = z.object({
    habitId: z.string().min(1),
    subvariableId: z.string().min(1),
    numericValue: z.number(),
    rawValue: z.string().optional(),
    logicalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD format
    followedAssignment: z.boolean().optional(), // N=1 compliance tracking
});

/**
 * POST /api/entries/quick
 * Quick entry endpoint for Today's Log widget
 * Creates or updates a single subvariable entry
 */
export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const json = await request.json();
        const body = quickEntrySchema.parse(json);

        // Verify the habit belongs to the user and subvariable exists
        const habit = await prisma.habit.findFirst({
            where: {
                id: body.habitId,
                userId: user.id,
                archived: false,
            },
            include: {
                subvariables: {
                    where: {
                        id: body.subvariableId,
                        active: true,
                    },
                },
            },
        });

        if (!habit || habit.subvariables.length === 0) {
            return NextResponse.json({ error: 'Invalid habit or subvariable' }, { status: 404 });
        }

        const logicalDate = parseISO(body.logicalDate);
        const dayStart = startOfDay(logicalDate);
        const dayEnd = endOfDay(logicalDate);

        // ========== EXPERIMENT ENFORCEMENT ==========
        // Check if this habit is the independent variable in an active experiment
        const activeExperiment = await prisma.experiment.findFirst({
            where: {
                independentId: body.habitId,
                userId: user.id,
                status: 'ACTIVE',
                startDate: { lte: body.logicalDate },
                endDate: { gte: body.logicalDate },
            },
            include: {
                assignments: {
                    where: { date: body.logicalDate },
                },
            },
        });

        let experimentWarning: string | null = null;
        let autoFollowedAssignment: boolean | undefined = body.followedAssignment;

        if (activeExperiment && activeExperiment.assignments.length > 0) {
            const todayAssignment = activeExperiment.assignments[0];

            // If not explicitly set, try to infer from value
            // Condition 'A' (first) typically means intervention (value 1)
            // Other conditions typically mean control/variant (value 0 for binary)
            const expectedValue = todayAssignment.condition === 'A' ? 1 : 0;
            const actualValue = body.numericValue;

            if (body.followedAssignment === undefined) {
                // User is manually logging without using Protocol Command Center
                // Infer compliance based on whether the value matches expected
                if (!todayAssignment.isWashout) {
                    autoFollowedAssignment = actualValue === expectedValue;
                    if (!autoFollowedAssignment) {
                        experimentWarning = `This entry conflicts with today's protocol assignment. Your compliance was logged as deviated.`;
                    }
                }
            }
        }
        // ========== END EXPERIMENT ENFORCEMENT ==========

        // Check if an entry already exists for this habit on this day
        let habitEntry = await prisma.habitEntry.findFirst({
            where: {
                habitId: body.habitId,
                userId: user.id,
                logicalDate: {
                    gte: dayStart,
                    lte: dayEnd,
                },
            },
            include: {
                subvariableEntries: true,
            },
        });

        // If no entry exists, create one
        if (!habitEntry) {
            const newEntry = await prisma.habitEntry.create({
                data: {
                    habitId: body.habitId,
                    userId: user.id,
                    logicalDate: logicalDate,
                    followedAssignment: autoFollowedAssignment,
                    timestamp: new Date(),
                },
                include: {
                    subvariableEntries: true,
                },
            });
            habitEntry = newEntry;
        } else if (autoFollowedAssignment !== undefined) {
            // Update compliance on existing entry
            await prisma.habitEntry.update({
                where: { id: habitEntry.id },
                data: { followedAssignment: autoFollowedAssignment },
            });
        }

        // Check if a subvariable entry already exists
        const existingSubEntry = habitEntry.subvariableEntries.find(
            se => se.subvariableId === body.subvariableId
        );

        let subvariableEntry;

        if (existingSubEntry) {
            // Update existing subvariable entry
            subvariableEntry = await prisma.subvariableEntry.update({
                where: {
                    id: existingSubEntry.id,
                },
                data: {
                    numericValue: body.numericValue,
                    rawValue: body.rawValue,
                },
            });
        } else {
            // Create new subvariable entry
            subvariableEntry = await prisma.subvariableEntry.create({
                data: {
                    habitEntryId: habitEntry.id,
                    subvariableId: body.subvariableId,
                    numericValue: body.numericValue,
                    rawValue: body.rawValue,
                },
            });
        }

        return NextResponse.json({
            success: true,
            entry: {
                habitEntryId: habitEntry.id,
                subvariableEntryId: subvariableEntry.id,
                numericValue: subvariableEntry.numericValue,
                rawValue: subvariableEntry.rawValue,
            },
            ...(experimentWarning && { warning: experimentWarning }),
        }, { status: existingSubEntry ? 200 : 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error creating quick entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
