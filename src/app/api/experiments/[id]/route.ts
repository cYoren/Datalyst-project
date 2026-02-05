import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import { updateExperimentSchema } from '@/lib/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/experiments/[id]
 * Get a single experiment with chart data
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const experiment = await prisma.experiment.findFirst({
            where: { id, userId: user.id },
            include: {
                independent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true,
                        subvariables: {
                            where: { active: true },
                            select: { id: true, name: true, type: true, unit: true },
                        },
                    },
                },
                dependent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true,
                        subvariables: {
                            where: { active: true },
                            select: { id: true, name: true, type: true, unit: true },
                        },
                    },
                },
            },
        });

        if (!experiment) {
            return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
        }

        return NextResponse.json(experiment);
    } catch (error) {
        console.error('Error fetching experiment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH /api/experiments/[id]
 * Update experiment (name, hypothesis, dates, status)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Verify ownership
        const existing = await prisma.experiment.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.startDate !== undefined) updateData.startDate = body.startDate;
        if (body.endDate !== undefined) updateData.endDate = body.endDate;
        if (body.status !== undefined) updateData.status = body.status;

        // ========== PRE-REGISTRATION LOCK ==========
        // If hypothesis is locked, prevent changes
        if (existing.hypothesisLockedAt && body.hypothesis !== undefined && body.hypothesis !== existing.hypothesis) {
            return NextResponse.json({
                error: 'Hypothesis is locked',
                message: 'Your hypothesis was locked when the trial started to prevent p-hacking. This ensures scientific integrity.',
                lockedAt: existing.hypothesisLockedAt,
            }, { status: 403 });
        }

        // Allow hypothesis update if not locked
        if (body.hypothesis !== undefined) updateData.hypothesis = body.hypothesis;

        // Auto-lock hypothesis when transitioning to ACTIVE
        if (body.status === 'ACTIVE' && existing.status !== 'ACTIVE' && !existing.hypothesisLockedAt) {
            updateData.hypothesisLockedAt = new Date();
        }
        // ========== END PRE-REGISTRATION LOCK ==========

        const updated = await prisma.experiment.update({
            where: { id },
            data: updateData,
            include: {
                independent: {
                    select: { id: true, name: true, icon: true, color: true },
                },
                dependent: {
                    select: { id: true, name: true, icon: true, color: true },
                },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating experiment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/experiments/[id]
 * Archive an experiment (soft delete)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.experiment.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
        }

        // Soft delete by archiving
        await prisma.experiment.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error archiving experiment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
