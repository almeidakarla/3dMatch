import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware — runs BEFORE every matched request
 *
 * Why do we need middleware for auth?
 * 1. Supabase auth tokens expire. The middleware refreshes them on every request
 *    so the user doesn't get randomly logged out.
 * 2. It runs before Server Components render, so by the time your page loads,
 *    the auth cookie is always fresh.
 * 3. It can redirect unauthenticated users away from /dashboard/* routes
 *    before the page even starts rendering (faster than client-side redirects).
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for studio routes - let Sanity handle its own auth
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Forward cookies to the request (for Server Components to read)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Also set cookies on the response (so browser stores them)
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT call supabase.auth.getSession() here.
  // getUser() actually calls the Supabase auth server to validate the token.
  // getSession() only reads the local JWT without verifying it — less secure.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes — redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to access login pages, redirect to dashboard
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/login/property' ||
    request.nextUrl.pathname === '/login/artist'
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Return the supabaseResponse, NOT a plain NextResponse.next()
  // The supabaseResponse has the refreshed auth cookies attached.
  return supabaseResponse
}

/**
 * Matcher config: which routes should the middleware run on?
 *
 * We exclude:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico
 * - Public assets
 *
 * Everything else goes through middleware to keep auth cookies fresh.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
