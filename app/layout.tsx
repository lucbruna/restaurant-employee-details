import type { Metadata, Viewport } from 'next';
import { Manrope, Noto_Sans_Devanagari, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const metadataBase = process.env.APP_URL ? new URL(process.env.APP_URL) : undefined;
const bhukkadSans = Manrope({
  subsets: ['latin'],
  variable: '--font-bhukkad-sans',
  display: 'swap',
});
const bhukkadDisplay = Sora({
  subsets: ['latin'],
  variable: '--font-bhukkad-display',
  display: 'swap',
});
const bhukkadScript = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-bhukkad-script',
  display: 'swap',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase,
  applicationName: 'Restaurant OS',
  title: {
    default: 'Restaurant OS',
    template: '%s | Restaurant OS',
  },
  description:
    'Sistema operacional completo para gestão de restaurantes: POS, cozinha, reservas, cardápio, estoque e relatórios.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ef' },
    { media: '(prefers-color-scheme: dark)', color: '#1a100c' },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
      <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${bhukkadSans.variable} ${bhukkadDisplay.variable} ${bhukkadScript.variable} bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
