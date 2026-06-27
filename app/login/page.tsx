'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandMark } from '@/components/brand/brand-mark';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(166,66,24,0.18),transparent_58%)]" />
      <Card className="surface-shell relative w-full max-w-md border-border/70 bg-card/92 shadow-[var(--shadow-elevation-3)]">
        <CardHeader className="space-y-5 text-center">
          <div className="flex justify-center">
            <BrandMark withTagline />
          </div>
          <div className="space-y-2">
            <CardTitle className="brand-display text-3xl font-semibold">Bem-vindo</CardTitle>
            <CardDescription className="mx-auto max-w-sm text-sm font-medium leading-relaxed">
              Acesse o sistema para gerenciar pedidos, cozinha, mesas e operações do restaurante.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou senha inválidos');
    } else {
      router.push(searchParams.get('next') || '/dashboard');
    }
  };

  return (
    <LoginCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
      placeholder="seu@email.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <Input
      type="password"
      placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm font-medium text-error">{error}</p>}
        <Button type="submit" className="w-full uppercase tracking-[0.18em]">
          Entrar
        </Button>
      </form>
    </LoginCard>
  );
}

function LoginFallback() {
  return (
    <LoginCard>
      <div className="h-28 animate-pulse rounded-[var(--radius-large)] bg-muted" />
    </LoginCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
