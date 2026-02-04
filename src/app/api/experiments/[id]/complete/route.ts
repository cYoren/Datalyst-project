/**
 * POST /api/experiments/[id]/complete
 * 
 * Complete an experiment and trigger blockchain attestation.
 * This is the "Finalize & Verify" action.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { attestExperiment, type ExperimentData, checkAttestationBalance } from '@/lib/crypto/eas';
import { nanoid } from 'nanoid';
import { ExperimentStatus } from '@prisma/client';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get authenticated user
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch the experiment with all required data
        // Note: Using 'as any' because Prisma types may be stale - run `npx prisma generate` to fix
        const experiment = await prisma.experiment.findFirst({
            where: {
                id,
                userId: authData.user.id,
            },
        }) as any;

        if (!experiment) {
            return NextResponse.json(
                { success: false, error: 'Experiment not found' },
                { status: 404 }
            );
        }

        // Check if already attested
        if (experiment.attestationUid) {
            return NextResponse.json({
                success: true,
                message: 'Already verified',
                attestation: {
                    uid: experiment.attestationUid,
                    explorerUrl: `https://base.easscan.org/attestation/view/${experiment.attestationUid}`,
                },
            });
        }

        // Generate slug for sharing if not exists
        const slug = experiment.slug || nanoid(10);

        // Prepare experiment data for attestation
        // We need to calculate results first
        const entries = await prisma.habitEntry.findMany({
            where: {
                habitId: { in: [experiment.independentId, experiment.dependentId] },
                userId: authData.user.id,
                logicalDate: {
                    gte: experiment.startDate,
                    lte: experiment.endDate,
                },
            },
            include: {
                subvariableEntries: true,
            },
        });

        // Calculate basic statistics (simplified)
        const dependentEntries = entries.filter(e => e.habitId === experiment.dependentId);
        const independentEntries = entries.filter(e => e.habitId === experiment.independentId);

        // Get condition assignments
        const assignments = await prisma.assignment.findMany({
            where: { experimentId: id },
            orderBy: { date: 'asc' },
        });

        // Separate by condition (dates are stored as strings)
        const conditionADates = new Set(
            assignments.filter(a => a.condition === 'A').map(a => a.date)
        );
        const conditionBDates = new Set(
            assignments.filter(a => a.condition === 'B').map(a => a.date)
        );

        // Get values by condition
        const aValues: number[] = [];
        const bValues: number[] = [];

        for (const entry of dependentEntries) {
            const dateStr = entry.logicalDate.toISOString().split('T')[0];
            const value = entry.subvariableEntries[0]?.numericValue;

            if (value !== undefined) {
                if (conditionADates.has(dateStr)) {
                    aValues.push(value);
                } else if (conditionBDates.has(dateStr)) {
                    bValues.push(value);
                }
            }
        }

        // Calculate means
        const meanA = aValues.length > 0 ? aValues.reduce((a, b) => a + b, 0) / aValues.length : 0;
        const meanB = bValues.length > 0 ? bValues.reduce((a, b) => a + b, 0) / bValues.length : 0;

        // Calculate effect size (Cohen's d simplified)
        const pooledStd = Math.sqrt(
            ((variance(aValues) * (aValues.length - 1)) + (variance(bValues) * (bValues.length - 1))) /
            (aValues.length + bValues.length - 2)
        ) || 1;
        const effectSize = (meanB - meanA) / pooledStd;

        // Prepare attestation data (dates are already strings in DB)
        const attestationData: ExperimentData = {
            experimentId: id,
            protocolId: experiment.protocolId || undefined,
            name: experiment.name,
            hypothesis: experiment.hypothesis || undefined,
            startDate: experiment.startDate,
            endDate: experiment.endDate,
            type: experiment.type,
            isBlind: experiment.isBlind,
            results: {
                effectSize: Number(effectSize.toFixed(4)),
                conditionAMean: Number(meanA.toFixed(4)),
                conditionBMean: Number(meanB.toFixed(4)),
                nA: aValues.length,
                nB: bValues.length,
            },
        };

        // Attempt attestation
        const attestResult = await attestExperiment(attestationData);

        // Update experiment
        const updateData: {
            status: ExperimentStatus;
            slug: string;
            isPublic: boolean;
            attestationUid?: string;
            attestationTx?: string;
        } = {
            status: ExperimentStatus.COMPLETED,
            slug,
            isPublic: true,
        };

        if (attestResult.success && attestResult.uid) {
            updateData.attestationUid = attestResult.uid;
            updateData.attestationTx = attestResult.txHash || undefined;
        }

        await prisma.experiment.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            experiment: {
                id,
                status: 'COMPLETED',
                slug,
                shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${slug}`,
            },
            attestation: attestResult.success ? {
                uid: attestResult.uid,
                txHash: attestResult.txHash,
                explorerUrl: attestResult.explorerUrl,
                dataHash: attestResult.dataHash,
            } : {
                skipped: true,
                reason: attestResult.error === 'LOW_BALANCE'
                    ? 'Insufficient balance for attestation'
                    : attestResult.error,
            },
            statistics: {
                effectSize,
                conditionAMean: meanA,
                conditionBMean: meanB,
                nA: aValues.length,
                nB: bValues.length,
            },
        });
    } catch (error) {
        console.error('[Complete Experiment] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to complete experiment' },
            { status: 500 }
        );
    }
}

// GET endpoint to check attestation status/balance
export async function GET() {
    try {
        const balance = await checkAttestationBalance();

        return NextResponse.json({
            success: true,
            attestation: {
                available: balance.canAttest,
                isLow: balance.isLow,
                estimatedRemaining: balance.estimatedAttestations,
                balanceEth: balance.balanceEth,
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            attestation: { available: false },
        });
    }
}

// Helper function for variance
function variance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}
