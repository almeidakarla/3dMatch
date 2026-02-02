import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Check if Supabase env vars are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey)

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
  if (!hasSupabaseConfig) {
    // During build time without env vars, return a placeholder
    // This allows static generation to complete
    console.warn('Supabase env vars not configured - using placeholder client')
    return createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * STATIC CLIENT — used for build-time operations (generateStaticParams, etc.)
 *
 * This client doesn't use cookies and is safe to use during static generation.
 * Only use this for read-only operations on public data.
 */
export function createStaticClient() {
  if (!hasSupabaseConfig) {
    return createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
