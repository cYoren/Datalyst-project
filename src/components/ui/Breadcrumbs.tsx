'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const segmentLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    habits: 'Protocols',
    new: 'New',
    edit: 'Edit',
    lab: 'Lab',
    data: 'Data',
    logs: 'Logs',
    settings: 'Settings',
    about: 'About',
};

interface BreadcrumbsProps {
    overrides?: Record<string, string>;
}

export function Breadcrumbs({ overrides }: BreadcrumbsProps) {
    const pathname = usePathname();

    if (pathname === '/dashboard') return null;

    const segments = pathname.split('/').filter(Boolean);
    const crumbs = segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = overrides?.[segment] || segmentLabels[segment] || segment;
        const isLast = i === segments.length - 1;
        return { href, label, isLast };
    });

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] mb-4 font-body">
            {crumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                    {crumb.isLast ? (
                        <span className="text-[var(--text-secondary)] font-medium">{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="hover:text-[var(--color-accent)] transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
