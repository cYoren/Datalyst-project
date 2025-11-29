import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart2, CheckCircle2, Lock } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If authenticated, go to dashboard
  if (user) {
    redirect('/dashboard');
  }

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
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
              Domine seus hábitos através de <span className="text-[var(--color-accent)]">dados</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-10 leading-relaxed">
              O Datalyst ajuda você a rastrear, analisar e correlacionar seus hábitos diários para descobrir insights poderosos sobre sua produtividade e bem-estar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 text-base gap-2">
                  Começar Agora <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-12 text-base">
                  Já tenho conta
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
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Análise Visual</h3>
              <p className="text-[var(--text-secondary)]">
                Visualize seu progresso com gráficos intuitivos e dashboards personalizáveis.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)]">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Rastreamento Simples</h3>
              <p className="text-[var(--text-secondary)]">
                Registre seus hábitos diários em segundos com nossa interface otimizada.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)]">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Privacidade Total</h3>
              <p className="text-[var(--text-secondary)]">
                Seus dados são seus. Segurança de ponta a ponta para sua tranquilidade.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--bg-card)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-tertiary)] text-sm">
            © {new Date().getFullYear()} Datalyst. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link href="#" className="hover:text-[var(--text-primary)]">Privacidade</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">Termos</Link>
            <Link href="#" className="hover:text-[var(--text-primary)]">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
