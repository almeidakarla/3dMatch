import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

/**
 * /login/artist — Login page for 3D artists
 *
 * Same pattern as /login/property but with different labels.
 */

export const metadata: Metadata = {
  title: 'Login — 3D Artists',
  description: 'Sign in to 3DMatch as a 3D artist to find projects and clients.',
}

export default function ArtistLoginPage() {
  return (
    <LoginForm
      userType="artista"
      title="Login"
      subtitle="For 3D Artists"
      backHref="/for-artists"
      altLoginLabel="Are you a property/design professional?"
      altLoginHref="/login/property"
    />
  )
}
