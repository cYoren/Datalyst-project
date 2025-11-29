'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, BarChart2, PlusCircle, Settings, ScrollText, BarChart3, Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/ui/UserMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Try fetching full profile from API (Database)
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

            // Fallback: Get basic user info from Supabase Auth (Session)
            // This ensures the Logout button is visible even if the Database is down
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
        { href: '/data', icon: BarChart3, label: 'Dados' },
        { href: '/logs', icon: ScrollText, label: 'Logs' },
        { href: '/habits/new', icon: PlusCircle, label: 'Novo' },
        { href: '/about', icon: Microscope, label: 'Sobre' },
        // { href: '/settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-app)] pb-20 sm:pb-0 sm:pl-64">
            {/* Desktop Sidebar */}
            <aside className="hidden sm:flex fixed inset-y-0 left-0 w-64 flex-col bg-[var(--bg-card)] border-r border-[var(--color-slate-200)]">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-[var(--color-primary-600)] flex items-center gap-2">
                        <span className="text-3xl">📊</span> Datalyst
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                suppressHydrationWarning
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive
                                        ? "bg-[var(--color-primary-50)] text-[var(--color-primary-600)]"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--color-slate-50)] hover:text-[var(--text-primary)]"
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
            <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[var(--bg-card)] border-t border-[var(--color-slate-200)] flex justify-around p-2 z-40 pb-safe">
                {navItems.slice(0, 4).map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            suppressHydrationWarning
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16",
                                isActive
                                    ? "text-[var(--color-primary-600)]"
                                    : "text-[var(--text-tertiary)]"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6 mb-1", isActive && "fill-current opacity-20")} suppressHydrationWarning />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                {/* User Menu for Mobile */}
                {user && <UserMenu user={user} variant="mobile" />}
            </nav>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
