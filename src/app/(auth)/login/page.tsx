'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();
            console.log('[Login] Attempting login with:', email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('[Login] Error details:', {
                    message: error.message,
                    status: error.status,
                    name: error.name,
                    code: (error as any).code,
                    fullError: error
                });
                throw error;
            }

            console.log('[Login] Success! Session:', data.session);
            console.log('[Login] All cookies:', document.cookie);
            console.log('[Login] Cookie count:', document.cookie.split(';').length);

            // Wait a bit for cookies to be set
            await new Promise(resolve => setTimeout(resolve, 100));

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            // Provide more specific error messages
            let errorMessage = err.message || 'Erro ao fazer login';

            if (err.message?.includes('Invalid login credentials')) {
                errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
            } else if (err.message?.includes('Email not confirmed')) {
                errorMessage = 'Por favor, confirme seu email antes de fazer login.';
            } else if (err.status === 400) {
                errorMessage = `Erro de autenticação: ${err.message}. Verifique se seu email foi confirmado.`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setMagicLinkSent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar link mágico');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar com Google');
            setLoading(false);
        }
    };

    if (magicLinkSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-page)]">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-[var(--color-accent)]" suppressHydrationWarning />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Verifique seu email
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Enviamos um link mágico para <strong>{email}</strong>. Clique no link para fazer login.
                    </p>
                    <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="w-full">
                        Voltar
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-page)]">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Entre para continuar sua jornada
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" suppressHydrationWarning />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" suppressHydrationWarning />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" suppressHydrationWarning />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <Link
                            href="/reset-password"
                            className="text-[var(--color-accent)] hover:underline"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" suppressHydrationWarning />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </Button>
                </form>

                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--color-border)]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[var(--color-bg-card)] text-[var(--text-tertiary)]">
                            ou continue com
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-6 flex items-center justify-center gap-2"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleMagicLink}
                    disabled={loading || !email}
                    className="w-full mt-3"
                >
                    <Mail className="h-4 w-4 mr-2" suppressHydrationWarning />
                    Link mágico (Email)
                </Button>

                <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </Card>
        </div>
    );
}
