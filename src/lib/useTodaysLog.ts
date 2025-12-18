'use client';

import useSWR from 'swr';

// Types for Today's Log - designed for easy React Native migration
export interface TodayVariable {
    id: string;
    name: string;
    type: 'BOOLEAN' | 'NUMERIC' | 'SCALE_0_10' | 'CATEGORY';
    unit?: string;
    metadata?: {
        min?: number;
        max?: number;
        step?: number;
        labels?: string[];
        options?: string[];
    };
    habitId: string;
    habitName: string;
    habitIcon: string;
    habitColor: string;
    timeBlock: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';
    rank: number;
    // Entry data for today (if exists)
    todayEntry?: {
        entryId: string;
        subvariableEntryId: string;
        numericValue: number;
        rawValue?: string;
    };
}

export interface TodayLogSummary {
    variables: TodayVariable[];
    logged: number;
    total: number;
    percentage: number;
}

// Fetcher for SWR
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
};

/**
 * Hook for Today's Log Widget
 * Aggregates all active protocols' variables with today's log status
 * Designed for easy migration to React Native (pure logic, no web-specific deps)
 */
export function useTodaysLog() {
    const { data, error, isLoading, mutate } = useSWR<TodayLogSummary>(
        '/api/dashboard/today',
        fetcher,
        {
            revalidateOnFocus: true,  // Refresh when user returns
            refreshInterval: 60000,   // Refresh every minute
            dedupingInterval: 5000,   // Dedupe rapid requests
        }
    );

    const logVariable = async (
        habitId: string,
        subvariableId: string,
        numericValue: number,
        rawValue?: string
    ): Promise<boolean> => {
        const today = new Date().toISOString().split('T')[0];

        // Create optimistic data
        const currentData = data || { variables: [], logged: 0, total: 0, percentage: 0 };
        const updatedVariables = currentData.variables.map((v: TodayVariable) => {
            if (v.id === subvariableId) {
                return {
                    ...v,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    todayEntry: {
                        entryId: 'optimistic',
                        subvariableEntryId: 'optimistic',
                        numericValue,
                        rawValue
                    }
                };
            }
            return v;
        });

        const newLogged = updatedVariables.filter(v => v.todayEntry).length;
        const total = updatedVariables.length;
        const optimisticData = {
            ...currentData,
            variables: updatedVariables,
            logged: newLogged,
            total,
            percentage: total > 0 ? Math.round((newLogged / total) * 100) : 0
        };

        try {
            // Apply optimistic update immediately using SWR
            await mutate(
                async () => {
                    const res = await fetch('/api/entries/quick', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            habitId,
                            subvariableId,
                            numericValue,
                            rawValue,
                            logicalDate: today,
                        }),
                    });

                    if (!res.ok) throw new Error('Failed to log');

                    // Return the actual server response (or trigger revalidation)
                    return await fetcher('/api/dashboard/today');
                },
                {
                    optimisticData,
                    rollbackOnError: true,
                    revalidate: false,  // Fetcher call above handles the new data
                    populateCache: true
                }
            );

            return true;
        } catch (error) {
            console.error('Error logging variable:', error);
            return false;
        }
    };

    return {
        summary: data || { variables: [], logged: 0, total: 0, percentage: 0 },
        isLoading,
        isError: !!error,
        logVariable,
        refresh: mutate,
    };
}
