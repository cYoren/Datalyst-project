'use client';

import useSWR from 'swr';

// Generic fetcher for SWR
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 401) {
            // Redirect to login on unauthorized
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
};

// SWR configuration for optimal caching
const swrConfig = {
    revalidateOnFocus: false, // Don't refetch when window regains focus
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Dedupe requests within 60 seconds
    errorRetryCount: 2,
};

// Hook for fetching habits
export function useHabits() {
    const { data, error, isLoading, mutate } = useSWR('/api/habits', fetcher, swrConfig);
    return {
        habits: data || [],
        isLoading,
        isError: error,
        refresh: mutate
    };
}

// Hook for fetching dashboard stats
export function useDashboardStats() {
    const { data, error, isLoading } = useSWR('/api/dashboard/stats', fetcher, swrConfig);
    return {
        stats: data,
        isLoading,
        isError: error
    };
}

// Hook for fetching insights
export function useInsights() {
    const { data, error, isLoading } = useSWR('/api/insights', fetcher, swrConfig);
    return {
        insights: data,
        isLoading,
        isError: error
    };
}

// Hook for fetching user info
export function useUser() {
    const { data, error, isLoading } = useSWR('/api/user', fetcher, {
        ...swrConfig,
        revalidateOnFocus: false,
        dedupingInterval: 300000, // User data rarely changes - cache for 5 minutes
    });
    return {
        user: data,
        isLoading,
        isError: error
    };
}

// Hook for combined dashboard data (uses individual hooks for maximum cache efficiency)
export function useDashboardData() {
    const { habits, isLoading: habitsLoading, refresh: refreshHabits } = useHabits();
    const { stats, isLoading: statsLoading } = useDashboardStats();
    const { insights, isLoading: insightsLoading } = useInsights();
    const { user, isLoading: userLoading } = useUser();

    return {
        habits,
        stats,
        insights,
        user,
        isLoading: habitsLoading || statsLoading || insightsLoading || userLoading,
        refreshHabits
    };
}

// Hook for fetching data page content
export function useDataPage() {
    const { data, error, isLoading } = useSWR('/api/data', fetcher, swrConfig);
    return {
        habits: data?.habits || [],
        entries: data?.entries || [],
        isLoading,
        isError: error
    };
}

// Hook for fetching logs page content
export function useLogsPage() {
    const { data, error, isLoading } = useSWR('/api/logs', fetcher, swrConfig);
    return {
        events: data?.events || [],
        sessions: data?.sessions || [],
        isLoading,
        isError: error
    };
}
