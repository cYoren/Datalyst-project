import { NextResponse } from 'next/server';
import { HabitService } from '@/services/habit.service';
import { updateHabitSchema } from '@/lib/validations';
import { z } from 'zod';

const USER_ID = 'default-user-id';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const habit = await HabitService.getHabitById(USER_ID, id);
        if (!habit) {
            return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
        }
        return NextResponse.json(habit);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();
        const body = updateHabitSchema.parse(json);

        const habit = await HabitService.updateHabit(USER_ID, id, body);
        return NextResponse.json(habit);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await HabitService.deleteHabit(USER_ID, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
