import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * SERVER CLIENT — used in Server Components, Route Handlers, and Server Actions
 *
 * Why async?
 * In Next.js 15+, cookies() is async. We must await it before reading/writing.
 *
 * Why custom cookie handlers?
 * Server Components can only READ cookies (the response is already being streamed).
 * Route Handlers and Server Actions can both read AND write cookies.
 * The @supabase/ssr package needs us to provide these cookie operations
 * so it can store/refresh the auth token in HTTP-only cookies.
 *
 * Old CRA approach: supabase stored tokens in localStorage
 * New Next.js approach: tokens live in cookies, accessible on both client AND server
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
