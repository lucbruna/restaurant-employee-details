import { StatePanel } from "@/components/ui/state-panel";

export default function NotFound() {
  return (
    <main className="app-canvas flex min-h-screen items-center justify-center bg-background px-6 py-8 sm:px-8">
      <StatePanel
        eyebrow="Navegação"
        tone="empty"
        title="Esta página não foi encontrada."
        description="A página pode ter sido movida, expirado ou nunca existiu. Volte ao painel principal para continuar."
        primaryAction={{ label: "Abrir Painel", href: "/dashboard" }}
        secondaryAction={{ label: "Pedido via Tablet", href: "/tablet-ordering", variant: "outline" }}
        className="w-full max-w-5xl"
      />
    </main>
  );
}
