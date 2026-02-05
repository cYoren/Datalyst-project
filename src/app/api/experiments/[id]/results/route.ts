import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/ensure-user';
import {
    performN1Stats,
    performBlockAnalysis,
    testCarryoverEffect,
    testPeriodEffect,
    calculateSequentialBoundary,
    calculateBayesianPosterior,
    performMultiArmAnalysis,
    interpretResults,
    zFromP,
    normalCDF,
} from '@/stats/analysis';

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
                assignments: {
                    orderBy: { date: 'asc' },
                }
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
        const chartData: any[] = [];
        const pairedValues: { x: number; y: number }[] = [];

        const startDate = new Date(experiment.startDate);
        const endDate = new Date(experiment.endDate);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const indValue = independentMap.get(dateStr) ?? null;
            const depValue = dependentMap.get(dateStr) ?? null;

            // Find active assignment for this day (to identify washout vs A vs B)
            const assignment = (experiment as any).assignments?.find((a: any) => a.date === dateStr);

            chartData.push({
                date: dateStr,
                independent: indValue,
                dependent: depValue,
                isWashout: assignment?.isWashout ?? false,
                condition: assignment?.condition ?? null,
            });

            // Only include in correlation if both values exist
            if (indValue !== null && depValue !== null) {
                pairedValues.push({ x: indValue, y: depValue });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Parse conditions from experiment (backward compat: default to A/B)
        let parsedConditions: { label: string }[] = [{ label: 'A' }, { label: 'B' }];
        try {
            const raw = (experiment as any).conditions;
            if (raw && typeof raw === 'string') {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length >= 2) parsedConditions = parsed;
            }
        } catch { /* use default */ }
        const conditionLabels = parsedConditions.map(c => c.label);

        // Split data by condition for N=1 analysis
        const conditionGroups = new Map<string, number[]>();
        for (const label of conditionLabels) {
            conditionGroups.set(
                label,
                chartData
                    .filter(d => d.condition === label && !d.isWashout && d.dependent !== null)
                    .map(d => d.dependent as number)
            );
        }

        // For backward compat: extract first two for existing 2-condition analysis
        const condA = conditionGroups.get(conditionLabels[0]) ?? [];
        const condB = conditionGroups.get(conditionLabels[1]) ?? [];

        // Build chronologically ordered dependent values (excluding washout) for autocorrelation
        const temporalValues = chartData
            .filter(d => !d.isWashout && d.dependent !== null)
            .map(d => d.dependent as number);

        // Block analysis (only for BLOCKED randomization)
        const isBlocked = (experiment as any).randomizationType === 'BLOCKED';
        const blockAnalysis = isBlocked
            ? performBlockAnalysis(chartData, (experiment as any).assignments ?? [])
            : null;

        // Carryover test (requires block assignments)
        const carryoverTest = isBlocked
            ? testCarryoverEffect(chartData, (experiment as any).assignments ?? [])
            : null;

        // Period effect test (requires block differences)
        const periodEffect = blockAnalysis
            ? testPeriodEffect(blockAnalysis.blockDifferences)
            : null;

        // Sequential testing for ACTIVE experiments
        let sequentialBoundary = null;
        if (experiment.status === 'ACTIVE' && condA.length >= 3 && condB.length >= 3) {
            const bayesian = calculateBayesianPosterior(condA, condB);
            if (bayesian) {
                const currentZ = bayesian.posteriorMean / bayesian.posteriorStd;
                let analysisParams: Record<string, any> | null = null;
                try {
                    const raw = (experiment as any).analysisParams;
                    if (raw && typeof raw === 'string') analysisParams = JSON.parse(raw);
                } catch { /* invalid JSON, use defaults */ }
                const totalLooks = analysisParams?.sequentialTesting?.nLooks ?? 5;
                // Estimate current look based on data fraction
                const totalPlannedDays = chartData.length;
                const currentDay = chartData.filter(d => d.dependent !== null).length;
                const dataFraction = Math.max(0.01, currentDay / Math.max(totalPlannedDays, 1));
                const currentLook = Math.max(1, Math.ceil(dataFraction * totalLooks));
                sequentialBoundary = calculateSequentialBoundary(currentZ, currentLook, totalLooks);
            }
        }

        // Perform advanced N=1 analysis (only for 2-condition experiments)
        const isMultiArm = conditionLabels.length > 2;
        const n1Stats = isMultiArm ? null : performN1Stats(condA, condB, temporalValues, blockAnalysis, carryoverTest, periodEffect, sequentialBoundary);

        // Multi-arm analysis (3+ conditions)
        let multiArmResults = null;
        if (isMultiArm) {
            // Parse doses if available
            const conditionDoses = new Map<string, number>();
            try {
                const raw = (experiment as any).conditions;
                if (raw && typeof raw === 'string') {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((c: { label: string; dose?: number }) => {
                            if (c.dose !== undefined) {
                                conditionDoses.set(c.label, c.dose);
                            }
                        });
                    }
                }
            } catch { /* no doses */ }

            multiArmResults = performMultiArmAnalysis(
                conditionGroups,
                conditionDoses.size > 0 ? conditionDoses : undefined,
                temporalValues
            );
        }

        // ========== RESULTS GATING ==========
        // For ACTIVE experiments, gate inferential statistics to prevent peeking bias
        if (experiment.status === 'ACTIVE') {
            const loggedDays = pairedValues.length;
            const totalDays = chartData.length;
            const complianceRate = totalDays > 0 ? Math.round((loggedDays / totalDays) * 100) : 0;

            return NextResponse.json({
                gated: true,
                message: 'Results are locked until experiment completion. This prevents peeking bias which can invalidate N=1 studies.',
                experiment: {
                    id: experiment.id,
                    name: experiment.name,
                    status: experiment.status,
                    startDate: experiment.startDate,
                    endDate: experiment.endDate,
                },
                progress: {
                    totalDays,
                    loggedDays,
                    complianceRate,
                    daysRemaining: Math.max(0, Math.ceil((new Date(experiment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
                },
                // Only show sequential boundary if it allows stopping
                sequentialBoundary: sequentialBoundary?.canRejectNull || sequentialBoundary?.canStopForFutility
                    ? sequentialBoundary
                    : null,
            });
        }
        // ========== END RESULTS GATING ==========

        // Calculate Pearson correlation
        const correlation = calculatePearsonCorrelation(pairedValues);

        return NextResponse.json({
            experiment: {
                id: experiment.id,
                name: experiment.name,
                status: experiment.status,
                startDate: experiment.startDate,
                endDate: experiment.endDate,
                type: (experiment as any).type,
                randomizationType: (experiment as any).randomizationType,
                washoutPeriod: (experiment as any).washoutPeriod,
                blockSize: (experiment as any).blockSize,
                isBlind: (experiment as any).isBlind,
            },
            independent: {
                name: (experiment as any).independent.name,
                icon: (experiment as any).independent.icon,
                variable: independentSub.name,
                unit: independentSub.unit || '',
            },
            dependent: {
                name: (experiment as any).dependent.name,
                icon: (experiment as any).dependent.icon,
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
                n1: n1Stats,
                multiArm: multiArmResults,
                conditionLabels,
                interpretation: interpretResults(
                    n1Stats,
                    multiArmResults,
                    conditionLabels,
                    experiment.dependent.name,
                    experiment.independent.name,
                    'HIGHER_BETTER' // TODO: get from habit goal direction
                ),
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
