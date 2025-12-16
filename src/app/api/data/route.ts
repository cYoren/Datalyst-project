import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const habits = await prisma.habit.findMany({
            where: { archived: false, userId: user.id },
            include: { subvariables: true },
            orderBy: { createdAt: 'asc' }
        });

        const entries = await prisma.habitEntry.findMany({
            where: {
                habitId: { in: habits.map((h: any) => h.id) },
                userId: user.id
            },
            include: { subvariableEntries: true },
            orderBy: { logicalDate: 'desc' },
            take: 500
        });

        return NextResponse.json({ habits, entries });
    } catch (error) {
        console.error('Error fetching data page info:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
