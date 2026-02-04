/**
 * Public Share Page
 * 
 * Displays a read-only view of experiment results.
 * Accessible without authentication via the experiment slug.
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { FlaskConical, ExternalLink, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateRigorScore, getRigorGradeColor, RigorScoreInput } from '@/stats/rigor';
import { getAttestationExplorerUrl } from '@/lib/crypto/eas';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for OG images
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const experiment = await prisma.experiment.findUnique({
        where: { slug },
        select: { name: true, isPublic: true },
    });

    if (!experiment || !experiment.isPublic) {
        return { title: 'Experiment Not Found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://datalyst.app';

    return {
        title: `${experiment.name} | Datalyst`,
        description: 'View verified scientific experiment results.',
        openGraph: {
            title: experiment.name,
            description: 'Verified N=1 experiment results',
            images: [`${appUrl}/api/og/${slug}`],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: experiment.name,
            description: 'Verified N=1 experiment results',
            images: [`${appUrl}/api/og/${slug}`],
        },
    };
}

export default async function SharePage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch the experiment
    const experiment = await prisma.experiment.findUnique({
        where: { slug },
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

    if (!experiment || !experiment.isPublic) {
        notFound();
    }

    const independentSub = experiment.independent.subvariables[0];
    const dependentSub = experiment.dependent.subvariables[0];

    // Fetch entries
    const dependentEntries = await prisma.habitEntry.findMany({
        where: {
            habitId: experiment.dependentId,
            userId: experiment.userId,
            logicalDate: {
                gte: new Date(experiment.startDate),
                lte: new Date(experiment.endDate),
            },
        },
        include: {
            subvariableEntries: { where: { subvariableId: dependentSub?.id } },
        },
    });

    // Build dependent map
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
        if (assignment.condition === 'A') condA.push(value);
        else condB.push(value);
    }

    // Calculate stats
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
    const isPositive = effectSize > 0;

    // Rigor score
    const rigorInput: RigorScoreInput = {
        hypothesisLockedAt: experiment.hypothesisLockedAt,
        isBlind: experiment.isBlind,
        autocorrelationIsProblematic: false,
        nA: condA.length,
        nB: condB.length,
        type: experiment.type as 'OBSERVATIONAL' | 'RANDOMIZED' | 'BLIND_RCT',
    };
    const rigor = calculateRigorScore(rigorInput);

    const hasAttestation = !!experiment.attestationUid;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                        <FlaskConical className="h-4 w-4" />
                        Verified Experiment
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {experiment.name}
                    </h1>
                    {experiment.protocol && (
                        <p className="text-slate-600 dark:text-slate-400">
                            Protocol: {experiment.protocol.name}
                        </p>
                    )}
                </div>

                {/* Main Results Card */}
                <Card className="p-6 space-y-6">
                    {/* Effect Size */}
                    <div className="text-center space-y-2">
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            Effect Size (Cohen's d)
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            {isPositive ? (
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            ) : (
                                <TrendingDown className="h-8 w-8 text-red-500" />
                            )}
                            <span className={`text-5xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {effectSize > 0 ? '+' : ''}{effectSize.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {Math.abs(effectSize) > 0.8 ? 'Large' : Math.abs(effectSize) > 0.5 ? 'Medium' : 'Small'} effect
                        </div>
                    </div>

                    {/* Condition Comparison */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">Baseline (n={condA.length})</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {condAMean.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400">±{std(condA).toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">Intervention (n={condB.length})</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {condBMean.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400">±{std(condB).toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Rigor Score */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Scientific Rigor</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${getRigorGradeColor(rigor.grade)}`}>
                                    {rigor.grade}
                                </span>
                                <span className="text-sm text-slate-400">({rigor.score}/100)</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Verification Badge */}
                {hasAttestation && (
                    <a
                        href={getAttestationExplorerUrl(experiment.attestationUid!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-medium">Verified on Base (EAS)</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-slate-500">
                    <p>Experiment tracked with <a href="https://datalyst.app" className="text-purple-600 hover:underline">Datalyst</a></p>
                    <p className="text-xs mt-1">
                        {experiment.startDate} → {experiment.endDate}
                    </p>
                </div>
            </div>
        </div>
    );
}
