import type { Metadata } from 'next'
import ArtistsLandingPage from '@/components/landing/ArtistsLandingPage'

export const metadata: Metadata = {
  title: 'For 3D Artists — Join 3DMatch',
  description: 'Join 3DMatch to connect with property & design professionals worldwide. Get paid for quality work, build your portfolio, and grow your 3D career.',
}

export default function ForArtistsPage() {
  return <ArtistsLandingPage />
}
