import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

/**
 * /login/property — Login page for property & design professionals (architects)
 *
 * This is a Server Component page that renders the LoginForm Client Component.
 * The metadata export provides SEO-friendly title/description (SSR benefit).
 *
 * OLD CRA: <PropertyLogin /> was a fully client-rendered component
 * NEW NEXT.JS: The page shell renders on the server, the form is interactive on the client
 */

export const metadata: Metadata = {
  title: 'Login — Property Professionals',
  description: 'Sign in to 3DMatch as a property or design professional to find 3D artists.',
}

export default function PropertyLoginPage() {
  return (
    <LoginForm
      userType="arquiteto"
      title="Login"
      subtitle="For Property & Design Professionals"
      backHref="/"
      altLoginLabel="Are you a 3D artist?"
      altLoginHref="/login/artist"
    />
  )
}
