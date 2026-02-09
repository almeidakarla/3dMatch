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
import { getHomepageData } from '../../sanity/lib/fetch'

export const revalidate = 60 // Revalidate every minute

export default async function HomePage() {
  // Fetch homepage data from Sanity (with fallback if not configured)
  let homepageData = null

  try {
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      homepageData = await getHomepageData()
    }
  } catch (error) {
    console.error('Failed to fetch homepage data from Sanity:', error)
  }

  return <LandingPage sanityData={homepageData} />
}
