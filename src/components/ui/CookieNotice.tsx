'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'datalyst_cookie_notice_v1';

export function CookieNotice() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const acknowledged = window.localStorage.getItem(STORAGE_KEY);
        setVisible(!acknowledged);
    }, []);

    const handleAccept = () => {
        window.localStorage.setItem(STORAGE_KEY, 'acknowledged');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-50 px-4">
            <div className="max-w-3xl mx-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-elevated)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-[var(--text-secondary)]">
                        We use essential cookies to keep you signed in and secure your session.
                        <Link href="/cookies" className="ml-1 inline-flex min-h-[44px] items-center text-[var(--color-accent)] hover:underline">
                            Learn more
                        </Link>
                        .
                    </div>
                    <Button onClick={handleAccept} size="sm">
                        Got it
                    </Button>
                </div>
            </div>
        </div>
    );
}
