'use client';

import { SWRConfig, Cache } from 'swr';
import { ReactNode, useEffect, useState } from 'react';

// LocalStorage provider for SWR cache persistence
function localStorageProvider(): Map<string, any> {
    const map = new Map<string, any>();

    // Only run on client
    if (typeof window === 'undefined') {
        return map;
    }

    // Load from localStorage on init
    const stored = localStorage.getItem('datalyst-swr-cache');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            for (const [key, value] of Object.entries(parsed)) {
                map.set(key, value);
            }
        } catch (e) {
            console.warn('Failed to parse SWR cache from localStorage:', e);
        }
    }

    // Persist to localStorage before unload
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            const obj: Record<string, any> = {};
            map.forEach((value, key) => {
                // Only cache API responses, not errors
                if (key.startsWith('/api') || key.startsWith('$swr$')) {
                    obj[key] = value;
                }
            });
            localStorage.setItem('datalyst-swr-cache', JSON.stringify(obj));
        });
    }

    return map;
}

// Global SWR configuration
const swrGlobalConfig = {
    // Show stale data immediately, revalidate in background
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: true,

    // Keep previous data while loading new data (no flash of loading)
    keepPreviousData: true,

    // Aggressive deduplication (2 minutes)
    dedupingInterval: 120000,

    // Throttle focus-based revalidation (1 minute)
    focusThrottleInterval: 60000,

    // Retry settings
    errorRetryCount: 2,
    errorRetryInterval: 5000,

    // Use localStorage for persistence
    provider: localStorageProvider,
};

interface SWRProviderProps {
    children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Render children without SWR config during SSR to avoid hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <SWRConfig value={swrGlobalConfig}>
            {children}
        </SWRConfig>
    );
}
