'use client';

import { Capacitor } from '@capacitor/core';

let hapticsModulePromise: Promise<typeof import('@capacitor/haptics') | null> | null = null;

async function loadHaptics() {
    if (!Capacitor.isNativePlatform()) return null;
    if (!hapticsModulePromise) {
        hapticsModulePromise = import('@capacitor/haptics').catch(() => null);
    }
    return hapticsModulePromise;
}

export async function triggerSelectionHaptic() {
    const mod = await loadHaptics();
    if (!mod) return;

    try {
        await mod.Haptics.selectionStart();
        await mod.Haptics.selectionChanged();
        await mod.Haptics.selectionEnd();
    } catch {
        // Swallow plugin errors to avoid blocking UI interactions.
    }
}

export async function triggerSuccessHaptic() {
    const mod = await loadHaptics();
    if (!mod) return;

    try {
        await mod.Haptics.notification({ type: mod.NotificationType.Success });
    } catch {
        // Swallow plugin errors to avoid blocking UI interactions.
    }
}
