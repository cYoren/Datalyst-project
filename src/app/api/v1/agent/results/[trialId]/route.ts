/**
 * GET /api/v1/agent/results/[trialId]
 * 
 * Get results for a completed trial.
 * Returns scientific analysis + EAS attestation link.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAgent, unauthorizedResponse } from '@/lib/agent-auth';
import { calculateRigorScore, RigorScoreInput } from '@/stats/rigor';
import { getAttestationExplorerUrl } from '@/lib/crypto/eas';

interface RouteParams {
    params: Promise<{ trialId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    // Authenticate the agent
    const agent = await authenticateAgent(request);
    if (!agent) {
        return unauthorizedResponse();
    }

    try {
        const { trialId } = await params;

        // Fetch the experiment with all related data
        const experiment = await prisma.experiment.findFirst({
            where: {
                id: trialId,
                userId: agent.userId,
            },
            include: {
                protocol: true,
                independent: {
                    include: { subvariables: { where: { active: true }, take: 1 } },
                },
                dependent: {
                    include: { subvariables: { where: { active: true }, take: 1 } },
                },
                assignments: { orderBy: { date: 'asc' } },
            },
        });

        if (!experiment) {
            return NextResponse.json(
                { success: false, error: `Trial not found: ${trialId}` },
                { status: 404 }
            );
        }

        const independentSub = experiment.independent.subvariables[0];
        const dependentSub = experiment.dependent.subvariables[0];

        if (!independentSub || !dependentSub) {
            return NextResponse.json(
                { success: false, error: 'Variables must have at least one subvariable' },
                { status: 400 }
            );
        }

        // Fetch entries for both variables
        const [independentEntries, dependentEntries] = await Promise.all([
            prisma.habitEntry.findMany({
                where: {
                    habitId: experiment.independentId,
                    userId: agent.userId,
                    logicalDate: {
                        gte: new Date(experiment.startDate),
                        lte: new Date(experiment.endDate),
                    },
                },
                include: {
                    subvariableEntries: { where: { subvariableId: independentSub.id } },
                },
                orderBy: { logicalDate: 'asc' },
            }),
            prisma.habitEntry.findMany({
                where: {
                    habitId: experiment.dependentId,
                    userId: agent.userId,
                    logicalDate: {
                        gte: new Date(experiment.startDate),
                        lte: new Date(experiment.endDate),
                    },
                },
                include: {
                    subvariableEntries: { where: { subvariableId: dependentSub.id } },
                },
                orderBy: { logicalDate: 'asc' },
            }),
        ]);

        // Build maps
        const dependentMap = new Map<string, number>();
        dependentEntries.forEach(entry => {
            const dateStr = entry.logicalDate.toISOString().split('T')[0];
            const subEntry = entry.subvariableEntries[0];
            if (subEntry) dependentMap.set(dateStr, subEntry.numericValue);
        });

        // Split by condition
        const condA: number[] = [];
        const condB: number[] = [];

        for (const assignment of experiment.assignments) {
            if (assignment.isWashout) continue;
            const value = dependentMap.get(assignment.date);
            if (value === undefined) continue;

            if (assignment.condition === 'A' || assignment.condition === experiment.assignments[0]?.condition) {
                condA.push(value);
            } else {
                condB.push(value);
            }
        }

        // Calculate basic stats
        const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const std = (arr: number[]) => {
            if (arr.length < 2) return 0;
            const m = mean(arr);
            return Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / (arr.length - 1));
        };

        const condAMean = mean(condA);
        const condBMean = mean(condB);
        const pooledStd = Math.sqrt((std(condA) ** 2 + std(condB) ** 2) / 2) || 1;
        const effectSize = (condBMean - condAMean) / pooledStd;

        // Simple t-test p-value approximation
        let pValue: number | null = null;
        if (condA.length >= 2 && condB.length >= 2) {
            const se = pooledStd * Math.sqrt(1 / condA.length + 1 / condB.length);
            const t = Math.abs(condBMean - condAMean) / (se || 1);
            // Approximate p-value (simplified)
            pValue = Math.exp(-0.717 * t - 0.416 * t * t);
        }

        // Rigor score
        const rigorInput: RigorScoreInput = {
            hypothesisLockedAt: experiment.hypothesisLockedAt,
            isBlind: experiment.isBlind,
            autocorrelationIsProblematic: false, // Simplified for agent API
            nA: condA.length,
            nB: condB.length,
            type: experiment.type as 'OBSERVATIONAL' | 'RANDOMIZED' | 'BLIND_RCT',
        };
        const rigor = calculateRigorScore(rigorInput);

        // Build attestation info
        const attestation = experiment.attestationUid
            ? {
                verified: true,
                uid: experiment.attestationUid,
                txHash: experiment.attestationTx,
                explorerUrl: getAttestationExplorerUrl(experiment.attestationUid),
            }
            : { verified: false };

        return NextResponse.json({
            success: true,
            trial: {
                id: experiment.id,
                name: experiment.name,
                protocolId: experiment.protocolId,
                protocolSlug: experiment.protocol?.slug,
                status: experiment.status,
                startDate: experiment.startDate,
                endDate: experiment.endDate,
                slug: experiment.slug,
                isPublic: experiment.isPublic,
            },
            results: {
                conditionA: {
                    label: 'Baseline',
                    n: condA.length,
                    mean: Math.round(condAMean * 100) / 100,
                    std: Math.round(std(condA) * 100) / 100,
                },
                conditionB: {
                    label: 'Intervention',
                    n: condB.length,
                    mean: Math.round(condBMean * 100) / 100,
                    std: Math.round(std(condB) * 100) / 100,
                },
                effectSize: Math.round(effectSize * 100) / 100,
                effectLabel: Math.abs(effectSize) > 0.8 ? 'Large' : Math.abs(effectSize) > 0.5 ? 'Medium' : 'Small',
                pValue: pValue ? Math.round(pValue * 1000) / 1000 : null,
                significant: pValue !== null && pValue < 0.05,
            },
            rigor: {
                score: rigor.score,
                grade: rigor.grade,
                breakdown: rigor.breakdown,
                tips: rigor.tips,
            },
            attestation,
            shareUrl: experiment.slug && experiment.isPublic
                ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${experiment.slug}`
                : null,
        });
    } catch (error) {
        console.error('[Agent API] Failed to get results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get results' },
            { status: 500 }
        );
    }
}
