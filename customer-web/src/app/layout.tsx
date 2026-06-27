import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CartIcon } from '@/components/cart-icon'
import Link from 'next/link'

const geist = Geist({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cardápio - Spice Garden',
  description: 'Faça seu pedido online no Spice Garden',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} bg-brand-50 text-brand-950 min-h-screen`}>
        <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold text-brand-700 tracking-tight">
              Spice Garden
            </Link>
            <CartIcon />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
