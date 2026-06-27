import Link from 'next/link'
import { UtensilsCrossed, ShoppingBag, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-600">
          <UtensilsCrossed className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          Spice Garden
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-600">
          Sabores que encantam, ingredientes que inspiram. Peça online e
          aproveite o melhor da culinária no conforto da sua casa.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/menu">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              Ver Cardápio
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline" size="lg" className="gap-2">
              <Clock className="h-5 w-5" />
              Faça seu Pedido
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-200 bg-white p-6 text-left">
            <h3 className="font-semibold text-brand-800">Cardápio Variado</h3>
            <p className="mt-2 text-sm text-gray-500">
              Pratos preparados com ingredientes frescos e selecionados.
            </p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-white p-6 text-left">
            <h3 className="font-semibold text-brand-800">Entrega Rápida</h3>
            <p className="mt-2 text-sm text-gray-500">
              Receba seu pedido quentinho na porta da sua casa.
            </p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-white p-6 text-left">
            <h3 className="font-semibold text-brand-800">Qualidade Garantida</h3>
            <p className="mt-2 text-sm text-gray-500">
              Compromisso com sabor e satisfação em cada prato.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
