// Common TypeScript types used across the application

export type DateString = string; // ISO 8601 format: YYYY-MM-DD

export interface HabitSchedule {
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    frequency?: 'daily' | 'weekly' | 'custom';
}

export interface SubvariableMetadata {
    min?: number;
    max?: number;
    step?: number;
    labels?: string[];
    options?: string[];
}

export interface InsightData {
    id: string;
    type: 'correlation' | 'trend' | 'achievement' | 'pattern';
    title: string;
    description: string;
    significance?: 'high' | 'medium' | 'low';
    pValue?: number;
    relatedHabits?: string[];
    relatedSubvariables?: string[];
    createdAt: Date;
}

export interface CorrelationResult {
    variable1Id: string;
    variable1Name: string;
    variable2Id: string;
    variable2Name: string;
    coefficient: number; // -1 to 1
    pValue: number;
    n: number; // Sample size
    interpretation: string;
}

export interface StatsSummary {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    count: number;
}

export interface TTestResult {
    tStatistic: number;
    pValue: number;
    degreesOfFreedom: number;
    meanDifference: number;
    interpretation: string;
}

export interface RegressionResult {
    slope: number;
    intercept: number;
    r2: number;
    pValue: number;
    equation: string;
    interpretation: string;
}

export interface HabitEntry {
    id: string;
    habitId: string;
    timestamp: DateString;
    value?: number;
    notes?: string;
    metas?: Record<string, any>;
}

export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    schedule: string | { logLimit?: 'daily' | 'unlimited';[key: string]: any };
    subvariables?: any[];
    entries?: HabitEntry[];
    createdAt?: DateString;
}
