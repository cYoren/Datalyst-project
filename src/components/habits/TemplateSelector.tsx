'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Tag, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
    useCount: number;
    subvariableTemplate: any[];
}

interface TemplateSelectorProps {
    onSelect: (template: Template | null) => void;
    selectedTemplate: Template | null;
}

export const TemplateSelector = ({ onSelect, selectedTemplate }: TemplateSelectorProps) => {
    const [query, setQuery] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const url = query
                    ? `/api/templates?q=${encodeURIComponent(query)}`
                    : '/api/templates';
                const res = await fetch(url);

                // Check if response is OK and is JSON before parsing
                if (!res.ok) {
                    console.error('Failed to fetch templates:', res.status, res.statusText);
                    setTemplates([]);
                    return;
                }

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error('Response is not JSON:', contentType);
                    setTemplates([]);
                    return;
                }

                const data = await res.json();
                // Ensure data is always an array
                setTemplates(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch templates:', error);
                setTemplates([]); // Set empty array on error
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchTemplates, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (template: Template) => {
        onSelect(template);
        setQuery(template.name);
        setIsOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery('');
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                Use existing template (optional)
            </label>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" suppressHydrationWarning />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search template or create new..."
                    className={cn(
                        "w-full h-12 pl-10 pr-4 rounded-lg border bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]",
                        selectedTemplate
                            ? "border-[var(--color-accent)] bg-[var(--color-primary-50)]"
                            : "border-[var(--color-slate-200)]"
                    )}
                />
                {selectedTemplate && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm font-medium"
                    >
                        Clear
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-[var(--color-slate-200)] shadow-lg max-h-80 overflow-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-[var(--text-secondary)]">
                            Loading...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="p-4 text-center text-[var(--text-secondary)]">
                            {query ? (
                                <>
                                    <p className="mb-2">No templates found.</p>
                                    <p className="text-sm">Keep typing to create a new habit.</p>
                                </>
                            ) : (
                                <p>No templates saved yet.</p>
                            )}
                        </div>
                    ) : (
                        <div className="py-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => handleSelect(template)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-slate-50)] transition-colors text-left"
                                >
                                    <div
                                        className="h-10 w-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                                        style={{ backgroundColor: template.color + '20' }}
                                    >
                                        {template.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[var(--text-primary)] truncate">
                                            {template.name}
                                        </div>
                                        {template.description && (
                                            <div className="text-sm text-[var(--text-secondary)] truncate">
                                                {template.description}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" suppressHydrationWarning />
                                                {template.subvariableTemplate.length} variables
                                            </span>
                                            {template.useCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" suppressHydrationWarning />
                                                    Used {template.useCount}x
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedTemplate && (
                <div className="mt-3 p-3 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-[var(--color-accent)]" suppressHydrationWarning />
                        <span className="font-medium text-[var(--text-primary)]">
                            Using template: {selectedTemplate.name}
                        </span>
                    </div>
                    {selectedTemplate.subvariableTemplate.length > 0 && (
                        <div className="mt-2 text-xs text-[var(--text-secondary)]">
                            Includes: {selectedTemplate.subvariableTemplate.map((s: any) => s.name).join(', ')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
