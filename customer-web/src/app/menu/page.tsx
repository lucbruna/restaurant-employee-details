'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { MenuItem } from '@/components/menu-item'

interface MenuCategory {
  id: string
  name: string
  items: {
    id: string
    name: string
    description: string
    price: number
    image?: string | null
  }[]
}

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch('http://localhost:3000/api/menu')
        if (!res.ok) throw new Error('Erro ao carregar cardápio')
        const data = await res.json()
        setCategories(data.categories ?? data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-lg text-red-600">{error}</p>
        <p className="mt-2 text-gray-500">Tente novamente mais tarde.</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Cardápio indisponível no momento.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Cardápio</h1>
      {categories.map((category) => (
        <section key={category.id} className="mt-8">
          <h2 className="text-xl font-semibold text-brand-800 border-b border-brand-200 pb-2 mb-4">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
