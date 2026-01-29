import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

/**
 * ROOT LAYOUT — wraps every page in the app
 *
 * This is a Server Component by default (no 'use client').
 * It can read cookies, fetch data, etc. on the server.
 *
 * AuthProvider is a Client Component ('use client') that provides
 * reactive auth state to all client components in the tree.
 *
 * OLD CRA APPROACH:
 *   <BrowserRouter>
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 *   </BrowserRouter>
 *
 * NEW NEXT.JS APPROACH:
 *   layout.tsx (Server Component) wraps children with AuthProvider
 *   Middleware handles route protection before rendering
 *   No BrowserRouter needed — Next.js handles routing via the file system
 */

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: '3DMatch — Connect Architects with 3D Artists',
    template: '%s | 3DMatch',
  },
  description: 'Find and hire talented 3D visualization artists for your architectural projects.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
