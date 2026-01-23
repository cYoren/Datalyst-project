import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/ensure-user';
import { prisma } from '@/lib/prisma';

const safeParse = (value: string | null) => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureUserExists(user.id, user.email);

        const [
            profile,
            habits,
            entries,
            templates,
            experiments,
            sessionLogs,
            userEvents,
            insightsCache,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    onboardingCompleted: true,
                    timezone: true,
                    locale: true,
                    theme: true,
                    healthDataConsent: true,
                    healthDataConsentAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.habit.findMany({
                where: { userId: user.id },
                include: { subvariables: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.habitEntry.findMany({
                where: { userId: user.id },
                include: { subvariableEntries: true },
                orderBy: { logicalDate: 'asc' },
            }),
            prisma.habitTemplate.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.experiment.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.appSessionLog.findMany({
                where: { userId: user.id },
                orderBy: { timestamp: 'asc' },
            }),
            prisma.userEvent.findMany({
                where: { userId: user.id },
                orderBy: { timestamp: 'asc' },
            }),
            prisma.insightsCache.findUnique({
                where: { userId: user.id },
            }),
        ]);

        const normalizedHabits = habits.map(habit => ({
            ...habit,
            schedule: safeParse(habit.schedule as unknown as string),
            subvariables: habit.subvariables.map(sub => ({
                ...sub,
                metadata: safeParse(sub.metadata),
            })),
        }));

        const normalizedTemplates = templates.map(template => ({
            ...template,
            defaultSchedule: safeParse(template.defaultSchedule),
            subvariableTemplate: safeParse(template.subvariableTemplate),
        }));

        const normalizedEvents = userEvents.map(event => ({
            ...event,
            metadata: safeParse(event.metadata),
        }));

        const exportData = {
            exportedAt: new Date().toISOString(),
            user: profile,
            habits: normalizedHabits,
            entries,
            templates: normalizedTemplates,
            experiments,
            sessionLogs,
            userEvents: normalizedEvents,
            insightsCache,
        };

        const filename = `datalyst-export-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error exporting user data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
