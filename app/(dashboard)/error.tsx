"use client";

import { StatePanel } from "@/components/ui/state-panel";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-canvas flex min-h-screen items-center justify-center bg-background p-4 md:p-6">
      <StatePanel
        eyebrow="Operações Bhukkad"
        tone="error"
        title="Esta superfície operacional não pôde terminar de carregar."
        description={
          error?.message ||
          "Mantivemos o shell do painel online e isolamos a falha nesta rota. Tente novamente o painel ou volte ao painel principal enquanto o fallback mantém o resto do workspace disponível."
        }
        primaryAction={{ label: "Tentar novamente", onClick: reset }}
        secondaryAction={{ label: "Voltar ao painel", href: "/dashboard", variant: "outline" }}
        className="w-full max-w-5xl"
      />
    </div>
  );
}
