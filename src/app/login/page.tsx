import { redirect } from 'next/navigation'

/**
 * /login redirects to /login/property by default
 *
 * OLD CRA: <Navigate to="/login/property" />
 * NEW NEXT.JS: Server-side redirect (runs before any HTML is sent)
 */
export default function LoginPage() {
  redirect('/login/property')
}
