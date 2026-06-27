"use client";

import { StatePanel } from "@/components/ui/state-panel";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background px-6 py-8 sm:px-8">
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
          <StatePanel
            eyebrow="Recuperação"
            tone="error"
            title="Serviço temporariamente indisponível."
            description={
              error?.message ||
              "Ocorreu um erro inesperado ao carregar esta página. Você pode tentar novamente ou voltar ao painel."
            }
            primaryAction={{ label: "Tentar Novamente", onClick: reset }}
            secondaryAction={{ label: "Abrir Painel", href: "/dashboard", variant: "outline" }}
            className="w-full"
          />
        </main>
      </body>
    </html>
  );
}
