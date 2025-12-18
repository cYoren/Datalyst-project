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
        console.log('[QuickEntry] Received payload:', body);

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
        console.log('[QuickEntry] Date processing:', {
            received: body.logicalDate,
            parsed: logicalDate,
            dayStart,
            dayEnd
        });

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
        console.log('[QuickEntry] Found habitEntry:', habitEntry?.id);

        // If no entry exists, create one
        if (!habitEntry) {
            habitEntry = await prisma.habitEntry.create({
                data: {
                    habitId: body.habitId,
                    userId: user.id,
                    logicalDate: logicalDate,
                    timestamp: new Date(),
                },
                include: {
                    subvariableEntries: true,
                },
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
            console.log('[QuickEntry] Updated subvariable entry:', subvariableEntry.id);
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
            console.log('[QuickEntry] Created subvariable entry:', subvariableEntry.id);
        }

        return NextResponse.json({
            success: true,
            entry: {
                habitEntryId: habitEntry.id,
                subvariableEntryId: subvariableEntry.id,
                numericValue: subvariableEntry.numericValue,
                rawValue: subvariableEntry.rawValue,
            },
        }, { status: existingSubEntry ? 200 : 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error creating quick entry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
