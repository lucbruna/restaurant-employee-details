'use client'

import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/cart-store'

export default function CartPage() {
  const { items, updateQuantity, updateNotes, removeItem, clearCart, total } =
    useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-brand-300" />
        <h1 className="mt-4 text-2xl font-bold text-brand-900">
          Seu carrinho está vazio
        </h1>
        <p className="mt-2 text-gray-500">
          Adicione itens do cardápio para começar.
        </p>
        <Link href="/menu">
          <Button className="mt-6">Ver Cardápio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">Seu Pedido</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Limpar Carrinho
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-900">{item.name}</h3>
                  <p className="text-sm text-brand-700 font-medium">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center rounded-md border border-brand-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-8 w-10 items-center justify-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  R$ {item.price.toFixed(2)} cada
                </span>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Observações..."
                  value={item.notes ?? ''}
                  onChange={(e) => updateNotes(item.id, e.target.value)}
                  className="w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-brand-700">R$ {total().toFixed(2)}</span>
          </div>
          <Button className="mt-4 w-full" size="lg">
            Finalizar Pedido
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
