import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/experiments/[id]/results
 * Get experiment results: chart data and correlation coefficient
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch experiment with variable details
        const experiment = await prisma.experiment.findFirst({
            where: { id, userId: user.id },
            include: {
                independent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        subvariables: {
                            where: { active: true },
                            take: 1,
                            select: { id: true, name: true, unit: true, type: true },
                        },
                    },
                },
                dependent: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        subvariables: {
                            where: { active: true },
                            take: 1,
                            select: { id: true, name: true, unit: true, type: true },
                        },
                    },
                },
            },
        });

        if (!experiment) {
            return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
        }

        // Get primary subvariables
        const independentSub = experiment.independent.subvariables[0];
        const dependentSub = experiment.dependent.subvariables[0];

        if (!independentSub || !dependentSub) {
            return NextResponse.json({
                error: 'Variables must have at least one subvariable',
            }, { status: 400 });
        }

        // Fetch entries for both variables within date range
        const [independentEntries, dependentEntries] = await Promise.all([
            prisma.habitEntry.findMany({
                where: {
                    habitId: experiment.independentId,
                    userId: user.id,
                    logicalDate: {
                        gte: new Date(experiment.startDate),
                        lte: new Date(experiment.endDate),
                    },
                },
                include: {
                    subvariableEntries: {
                        where: { subvariableId: independentSub.id },
                    },
                },
                orderBy: { logicalDate: 'asc' },
            }),
            prisma.habitEntry.findMany({
                where: {
                    habitId: experiment.dependentId,
                    userId: user.id,
                    logicalDate: {
                        gte: new Date(experiment.startDate),
                        lte: new Date(experiment.endDate),
                    },
                },
                include: {
                    subvariableEntries: {
                        where: { subvariableId: dependentSub.id },
                    },
                },
                orderBy: { logicalDate: 'asc' },
            }),
        ]);

        // Build date-indexed maps
        const independentMap = new Map<string, number>();
        independentEntries.forEach(entry => {
            const dateStr = entry.logicalDate.toISOString().split('T')[0];
            const subEntry = entry.subvariableEntries[0];
            if (subEntry) {
                independentMap.set(dateStr, subEntry.numericValue);
            }
        });

        const dependentMap = new Map<string, number>();
        dependentEntries.forEach(entry => {
            const dateStr = entry.logicalDate.toISOString().split('T')[0];
            const subEntry = entry.subvariableEntries[0];
            if (subEntry) {
                dependentMap.set(dateStr, subEntry.numericValue);
            }
        });

        // Build chart data (all dates in range)
        const chartData: { date: string; independent: number | null; dependent: number | null }[] = [];
        const pairedValues: { x: number; y: number }[] = [];

        const startDate = new Date(experiment.startDate);
        const endDate = new Date(experiment.endDate);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const indValue = independentMap.get(dateStr) ?? null;
            const depValue = dependentMap.get(dateStr) ?? null;

            chartData.push({
                date: dateStr,
                independent: indValue,
                dependent: depValue,
            });

            // Only include in correlation if both values exist
            if (indValue !== null && depValue !== null) {
                pairedValues.push({ x: indValue, y: depValue });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Calculate Pearson correlation
        const correlation = calculatePearsonCorrelation(pairedValues);

        return NextResponse.json({
            experiment: {
                id: experiment.id,
                name: experiment.name,
                status: experiment.status,
                startDate: experiment.startDate,
                endDate: experiment.endDate,
            },
            independent: {
                name: experiment.independent.name,
                icon: experiment.independent.icon,
                variable: independentSub.name,
                unit: independentSub.unit || '',
            },
            dependent: {
                name: experiment.dependent.name,
                icon: experiment.dependent.icon,
                variable: dependentSub.name,
                unit: dependentSub.unit || '',
            },
            chartData,
            stats: {
                totalDays: chartData.length,
                loggedDays: pairedValues.length,
                correlation: correlation,
                correlationType: 'pearson',
                strength: getCorrelationStrength(correlation),
            },
        });
    } catch (error) {
        console.error('Error fetching experiment results:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(pairs: { x: number; y: number }[]): number | null {
    if (pairs.length < 3) return null; // Need at least 3 data points

    const n = pairs.length;
    const sumX = pairs.reduce((acc, p) => acc + p.x, 0);
    const sumY = pairs.reduce((acc, p) => acc + p.y, 0);
    const sumXY = pairs.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = pairs.reduce((acc, p) => acc + p.x * p.x, 0);
    const sumY2 = pairs.reduce((acc, p) => acc + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return null;

    const r = numerator / denominator;
    return Math.round(r * 100) / 100; // Round to 2 decimal places
}

/**
 * Get human-readable correlation strength
 */
function getCorrelationStrength(r: number | null): string {
    if (r === null) return 'insufficient data';
    const absR = Math.abs(r);
    if (absR >= 0.7) return r > 0 ? 'strong positive' : 'strong negative';
    if (absR >= 0.3) return r > 0 ? 'moderate positive' : 'moderate negative';
    return 'weak/none';
}
