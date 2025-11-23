import * as ss from 'simple-statistics';

export interface CorrelationResult {
    coefficient: number;
    pValue: number;
    n: number;
    method: 'pearson' | 'spearman';
}

/**
 * Calculates Pearson correlation coefficient and p-value
 * Used for continuous numeric variables
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): CorrelationResult | null {
    if (x.length !== y.length || x.length < 3) return null;

    // Check if variables have variance (std dev > 0)
    const stdX = ss.standardDeviation(x);
    const stdY = ss.standardDeviation(y);

    if (stdX === 0 || stdY === 0) return null;

    const r = ss.sampleCorrelation(x, y);
    const n = x.length;

    // Calculate t-statistic for p-value
    // t = r * sqrt(n-2) / sqrt(1-r^2)
    const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - Math.pow(r, 2));

    // Approximate p-value (two-tailed)
    // This is a simplified approximation, for production we might want a proper distribution library
    // or a lookup table. For now, we use a simple estimation or just return the coefficient.
    // Using simple-statistics t-test logic if available, or manual approximation.

    const pValue = calculatePValueFromT(t, n - 2);

    return {
        coefficient: r,
        pValue,
        n,
        method: 'pearson'
    };
}

/**
 * Calculates Spearman rank correlation
 * Used for ordinal data (scales) or non-linear relationships
 */
export function calculateSpearmanCorrelation(x: number[], y: number[]): CorrelationResult | null {
    if (x.length !== y.length || x.length < 3) return null;

    // Rank the data
    const rankX = rankData(x);
    const rankY = rankData(y);

    return {
        ...calculatePearsonCorrelation(rankX, rankY)!,
        method: 'spearman'
    };
}

// Helper: Rank data for Spearman
function rankData(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    return data.map(v => {
        // Handle ties by averaging ranks
        const firstIndex = sorted.indexOf(v);
        const lastIndex = sorted.lastIndexOf(v);
        return (firstIndex + lastIndex) / 2 + 1;
    });
}

// Helper: Approximate p-value from t-statistic
// Degrees of freedom (df) = n - 2
function calculatePValueFromT(t: number, df: number): number {
    const absT = Math.abs(t);
    // Very rough approximation for now, sufficient for "significance" indication
    // In a real scientific app we'd use jstat or similar
    if (df <= 0) return 1.0;

    // Simple heuristic for common thresholds
    if (absT > 3.291) return 0.001; // p < 0.001
    if (absT > 2.576) return 0.01;  // p < 0.01
    if (absT > 1.960) return 0.05;  // p < 0.05
    if (absT > 1.645) return 0.10;  // p < 0.10

    // Linear interpolation for values in between (very rough)
    return 1.0 / (1 + absT);
}
