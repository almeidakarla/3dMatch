/**
 * HOME PAGE (/) — Server Component that conditionally renders
 *
 * OLD CRA APPROACH:
 *   <Route path="/" element={user && profile ? <Navigate to="/dashboard" /> : <LandingPage />} />
 *   This checked auth state client-side and showed a spinner while loading.
 *
 * NEW NEXT.JS APPROACH:
 *   The middleware already redirects logged-in users to /dashboard (see src/middleware.ts).
 *   So if a user reaches this page, they're NOT logged in — we just render the landing page.
 *   No loading spinner needed. The redirect happens at the edge before any HTML is sent.
 */

import LandingPage from '@/components/landing/LandingPage'

export default function HomePage() {
  return <LandingPage />
}
