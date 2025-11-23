import { NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';
import { createHabitSchema, createSubvariableSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Mock user ID for MVP (In a real app, get from session)
const USER_ID = 'default-user-id';

const createHabitBodySchema = createHabitSchema.extend({
    subvariables: z.array(createSubvariableSchema.omit({ habitId: true })).optional(),
    templateId: z.string().optional(), // Optional template to use
});

export async function GET() {
    try {
        const habits = await HabitService.getUserHabits(USER_ID);
        return NextResponse.json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = createHabitBodySchema.parse(json);

        // Ensure user exists (Temporary for MVP)
        // This prevents Foreign Key constraint errors if the database is empty
        let user = await prisma.user.findUnique({ where: { id: USER_ID } });
        if (!user) {
            await prisma.user.create({
                data: {
                    id: USER_ID,
                    email: 'demo@datalyst.app',
                }
            });
        }

        const habit = await HabitService.createHabit(USER_ID, {
            ...body,
            subvariables: body.subvariables || []
        });

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error creating habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
