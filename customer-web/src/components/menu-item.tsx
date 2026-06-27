'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/lib/cart-store'
import { UtensilsCrossed, Plus } from 'lucide-react'

interface MenuItemProps {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
}

export function MenuItem({ id, name, description, price, image }: MenuItemProps) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[16/9] bg-brand-100 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="h-10 w-10 text-brand-300" />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-brand-900">{name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-700">
            R$ {price.toFixed(2)}
          </span>
          <Button size="sm" onClick={() => addItem({ id, name, price })}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
