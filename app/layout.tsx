import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Digital IMALAG IT Assets Management SaaS',
    template: '%s | Digital IMALAG IT Assets Management SaaS',
  },
  description: 'Digital IMALAG IT Assets Management SaaS for multi-company teams with asset tagging, IT help desk ticketing, user roles, billing, and secure tenant separation.',
  keywords: [
    'IT asset management',
    'help desk ticketing',
    'multi tenant SaaS',
    'asset tagging',
    'company billing',
    'HR IT admin roles',
  ],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Digital IMALAG IT Assets Management SaaS',
    description: 'Manage IT assets, tickets, users, and billing across multiple companies.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased bg-transparent">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
