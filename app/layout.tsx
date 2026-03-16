import type { Metadata } from 'next'
import { Unbounded, DM_Sans, Playfair_Display, Gochi_Hand } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeContext'

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  weight: ['400', '700', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['italic'],
})

const gochiHand = Gochi_Hand({
  subsets: ['latin'],
  variable: '--font-gochi',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Locks Flow — More than a Salon, an Attitude',
  description: 'Salon de locks a Neuilly-sur-Marne. Retwist, Depart, Detartrage.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${unbounded.variable} ${dmSans.variable} ${playfair.variable} ${gochiHand.variable}`}>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  )
}
