import { createBrowserClient } from '@supabase/ssr'

/**
 * BROWSER CLIENT — used in Client Components ('use client')
 *
 * Why a separate browser client?
 * In the old CRA app we had ONE client everywhere:
 *   const supabase = createClient(url, anonKey)
 *
 * In Next.js we need THREE because:
 * 1. Browser client  — reads/writes cookies via the browser's document.cookie
 * 2. Server client   — reads/writes cookies via Next.js headers()/cookies()
 * 3. Middleware client — reads/writes cookies via the request/response objects
 *
 * createBrowserClient from @supabase/ssr automatically handles cookie storage
 * so the auth token is stored in cookies instead of localStorage.
 * This is critical because Server Components can read cookies but NOT localStorage.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
