'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
    user: {
        email?: string;
        name?: string;
    };
    variant?: 'desktop' | 'mobile';
}

export function UserMenu({ user, variant = 'desktop' }: UserMenuProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();

            // Also call our logout API to ensure server-side cleanup
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0].toUpperCase() || 'U';

    if (variant === 'mobile') {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 text-[var(--text-tertiary)]"
                >
                    <div className="h-6 w-6 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center text-xs font-bold mb-1">
                        {initials}
                    </div>
                    <span className="text-[10px] font-medium">Profile</span>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--color-border)] z-50 overflow-hidden">
                            <div className="p-4 border-b border-[var(--color-border)]">
                                <p className="font-medium text-[var(--text-primary)] truncate">
                                    {user.name || 'User'}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] truncate">
                                    {user.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)] transition-colors disabled:opacity-50"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative px-4 mt-auto mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isOpen ? "bg-[var(--color-slate-100)]" : "hover:bg-[var(--color-slate-50)]"
                )}
            >
                <div className="h-10 w-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center font-bold">
                    {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                        {user.name || 'User'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                        {user.email}
                    </p>
                </div>
                <ChevronDown className={cn(
                    "h-4 w-4 text-[var(--text-tertiary)] transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--color-border)] z-50 overflow-hidden">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)] transition-colors disabled:opacity-50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
