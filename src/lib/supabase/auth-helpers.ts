import { createClient } from './server'

/**
 * SERVER-SIDE AUTH HELPERS
 *
 * These functions run on the server (in Server Components, Route Handlers, Server Actions).
 * They read auth state from cookies — no localStorage, no client-side context.
 *
 * OLD CRA APPROACH:
 *   const { user, profile } = useAuth()  // Client-side hook, needs loading spinner
 *
 * NEW NEXT.JS APPROACH (for Server Components):
 *   const { user, profile } = await getAuthUser()  // Runs on server, instant
 *
 * For Client Components, still use useAuth() from AuthContext.
 */

export async function getAuthUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

/**
 * Get just the user (lighter query, no profile fetch)
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
