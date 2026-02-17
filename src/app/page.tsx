'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart2, CheckCircle2, Lock } from 'lucide-react';

// Homepage is a pure landing page — no server-side auth needed.
// The middleware already redirects authenticated users from /login to /dashboard,
// so users who are logged in can click "Log In" and get redirected automatically.

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-xl text-[var(--text-primary)]">Datalyst</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
              Your habits have patterns.<br /><span className="text-[var(--color-accent)]">Datalyst finds them.</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-10 leading-relaxed">
              Log your daily habits. After 14 days, Datalyst runs real statistical correlations — Pearson, Spearman, p-values — and tells you what&apos;s actually affecting your sleep, energy, and focus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 text-base gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-12 text-base">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)]">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Real Statistics, Not Vibes</h3>
              <p className="text-[var(--text-secondary)]">
                Pearson and Spearman correlations with p-values. If caffeine is hurting your sleep at r = -0.72, p &lt; 0.05 — you&apos;ll know.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)]">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Track Anything, Correlate Everything</h3>
              <p className="text-[var(--text-secondary)]">
                Create protocols with multiple variables — Sleep (hours + quality), Workout, Mood. Log daily. Datalyst finds what affects what.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)]">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Run Experiments</h3>
              <p className="text-[var(--text-secondary)]">
                Spotted a correlation? Turn it into a controlled experiment. Prove causation with 30 days of data — science-grade personal optimization.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--bg-card)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-tertiary)] text-sm">
            © {new Date().getFullYear()} Datalyst. All rights reserved. • CNPJ: 64.661.660/0001-04
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)]">Terms</Link>
            <Link href="/cookies" className="hover:text-[var(--text-primary)]">Cookies</Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
