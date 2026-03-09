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
  description: 'Find and hire talented 3D visualization artists for your architectural projects. 3DMatch connects architects, interior designers, and real estate developers with skilled 3D rendering artists.',
  keywords: ['3D rendering', '3D visualization', 'architectural visualization', '3D artist', 'hire 3D artist', 'architectural rendering', 'interior rendering', '3D freelancer', 'rendering services'],
  authors: [{ name: '3DMatch' }],
  creator: '3DMatch',
  publisher: '3DMatch',
  metadataBase: new URL('https://3dmatch.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://3dmatch.app',
    siteName: '3DMatch',
    title: '3DMatch — Connect Architects with 3D Artists',
    description: 'Find and hire talented 3D visualization artists for your architectural projects. Connect with skilled 3D rendering professionals.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '3DMatch - Connect Architects with 3D Artists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3DMatch — Connect Architects with 3D Artists',
    description: 'Find and hire talented 3D visualization artists for your architectural projects.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
