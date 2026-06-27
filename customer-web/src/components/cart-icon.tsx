'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export function CartIcon() {
  const items = useCartStore((s) => s.items)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Link href="/cart" className="relative p-2 text-brand-700 hover:text-brand-800 transition-colors">
      <ShoppingBag className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
