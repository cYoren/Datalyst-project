import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import { experimentFormSchema } from '@/lib/validations';

/**
 * GET /api/experiments
 * List all experiments for the authenticated user
 * Query params: status (optional filter)
 */
export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = { userId: user.id };
        if (status) {
            where.status = status;
        }

        const experiments = await prisma.experiment.findMany({
            where,
            include: {
                independent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true,
                    },
                },
                dependent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(experiments);
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/experiments
 * Create a new experiment
 */
export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = experimentFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Verify both habits exist and belong to user
        const [independent, dependent] = await Promise.all([
            prisma.habit.findFirst({ where: { id: data.independentId, userId: user.id, archived: false } }),
            prisma.habit.findFirst({ where: { id: data.dependentId, userId: user.id, archived: false } }),
        ]);

        if (!independent) {
            return NextResponse.json({ error: 'Independent variable not found' }, { status: 404 });
        }
        if (!dependent) {
            return NextResponse.json({ error: 'Dependent variable not found' }, { status: 404 });
        }

        const experiment = await prisma.experiment.create({
            data: {
                userId: user.id,
                name: data.name,
                hypothesis: data.hypothesis || null,
                independentId: data.independentId,
                dependentId: data.dependentId,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status || 'PLANNING',
            },
            include: {
                independent: {
                    select: { id: true, name: true, icon: true, color: true },
                },
                dependent: {
                    select: { id: true, name: true, icon: true, color: true },
                },
            },
        });

        return NextResponse.json(experiment, { status: 201 });
    } catch (error) {
        console.error('Error creating experiment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
