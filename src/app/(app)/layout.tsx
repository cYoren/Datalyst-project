'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, PlusCircle, Settings, BarChart3, Microscope, FlaskConical, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/ui/UserMenu';
import { ToastProvider } from '@/components/ui/Toast';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SWRProvider } from '@/providers/SWRProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    if (data.email) {
                        setUser({
                            email: data.email,
                            name: data.name || data.email.split('@')[0]
                        });
                        return;
                    }
                }
            } catch (error) {
                console.error('API user fetch failed, falling back to auth session:', error);
            }

            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser?.email) {
                    setUser({
                        email: authUser.email,
                        name: authUser.email.split('@')[0]
                    });
                }
            } catch (authError) {
                console.error('Auth session fetch failed:', authError);
            }
        };

        loadUser();
    }, []);

    const navItems = [
        { href: '/dashboard', icon: Calendar, label: 'Dashboard' },
        { href: '/lab', icon: FlaskConical, label: 'Lab', title: 'Run structured experiments' },
        { href: '/data', icon: BarChart3, label: 'Charts' },
        { href: '/habits/templates', icon: BookOpen, label: 'Templates' },
        { href: '/habits/new', icon: PlusCircle, label: 'Protocol' },
        { href: '/about', icon: Microscope, label: 'About' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ];

    const mobileNavItems = [
        { href: '/dashboard', icon: Calendar, label: 'Dashboard' },
        { href: '/lab', icon: FlaskConical, label: 'Lab' },
        { href: '/habits/new', icon: PlusCircle, label: 'Protocol', isCreate: true },
        { href: '/data', icon: BarChart3, label: 'Charts' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-app)] pb-20 sm:pb-0 sm:pl-64">
            {/* Desktop Sidebar */}
            <aside className="hidden sm:flex fixed inset-y-0 left-0 w-64 flex-col bg-[var(--bg-card)] border-r border-[var(--color-border)] shadow-sm">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-[var(--color-accent)] flex items-center gap-2 font-display">
                        <Image
                            src="/web-app-manifest-192x192.png"
                            alt="Datalyst logo"
                            width={32}
                            height={32}
                            className="rounded-lg shadow-sm"
                        />
                        Datalyst
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                suppressHydrationWarning
                                {...('title' in item && item.title ? { title: item.title } : {})}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] transition-all font-medium",
                                    isActive
                                        ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] shadow-sm"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                <item.icon className="h-5 w-5" suppressHydrationWarning />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu for Desktop */}
                {user && <UserMenu user={user} variant="desktop" />}
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[var(--bg-card)] border-t border-[var(--color-border)] flex justify-around p-2 pt-3 z-40 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(28,20,16,0.06)]">
                {mobileNavItems.map(item => {
                    const isActive = pathname === item.href;
                    const isCreate = 'isCreate' in item && item.isCreate;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            suppressHydrationWarning
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-[var(--radius-button)] transition-all w-full min-h-[48px]",
                                isCreate
                                    ? "text-white -mt-5"
                                    : isActive
                                        ? "text-[var(--color-accent)]"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            )}
                        >
                            {isCreate ? (
                                <div className="bg-[var(--color-accent)] rounded-[var(--radius-card)] p-3 shadow-lg shadow-[var(--color-accent)]/30">
                                    <item.icon className="h-6 w-6 text-white" suppressHydrationWarning />
                                </div>
                            ) : (
                                <>
                                    <item.icon className={cn("h-6 w-6 mb-1", isActive && "fill-current opacity-20")} suppressHydrationWarning />
                                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                                </>
                            )}
                        </Link>
                    );
                })}
                {/* User Menu for Mobile */}
                {user && <UserMenu user={user} variant="mobile" />}
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in min-h-screen">
                <SWRProvider>
                    <ToastProvider>
                        <Breadcrumbs />
                        {children}
                    </ToastProvider>
                </SWRProvider>
            </main>
        </div>
    );
}
