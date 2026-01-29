'use client'

/**
 * AUTH CONTEXT — Slim client-side auth provider
 *
 * OLD CRA APPROACH (343 lines):
 *   - Stored auth tokens in localStorage
 *   - Had to manually cache auth state for optimistic loading
 *   - Needed AbortController to cancel in-flight fetches
 *   - Showed loading spinners while checking auth on every mount
 *   - Profile auto-creation logic lived in the context
 *
 * NEW NEXT.JS APPROACH (~90 lines):
 *   - Auth tokens live in HTTP-only cookies (set by @supabase/ssr)
 *   - Middleware refreshes the token BEFORE the page renders (no spinner)
 *   - Server Components can read the user directly from cookies
 *   - This context is only for Client Components that need reactive auth state
 *   - Profile fetching is simpler because middleware guarantees a valid session
 *
 * WHY SO MUCH SMALLER?
 *   The middleware (src/middleware.ts) does the heavy lifting:
 *   - Token refresh → middleware
 *   - Route protection → middleware
 *   - Cookie management → @supabase/ssr
 *   This context just subscribes to auth changes for client-side reactivity.
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_type: 'artista' | 'arquiteto' | 'admin'
  full_name: string
  approval_status: string
  profile_photo?: string
  location?: string
  years_experience?: number
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, userType: string, fullName: string) => Promise<{ data: unknown; error: unknown }>
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: unknown }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: unknown; error: unknown }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist — create from auth metadata
          const { data: { user: authUser } } = await supabase.auth.getUser()
          const userType = authUser?.user_metadata?.user_type || 'artista'
          const fullName = authUser?.user_metadata?.full_name || 'User'

          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              user_type: userType,
              full_name: fullName,
              approval_status: 'pending',
            }])
            .select()
            .single()

          if (newProfile) setProfile(newProfile as Profile)
        } else {
          console.error('Profile fetch error:', fetchError)
          setError('Failed to load profile')
        }
      } else {
        setProfile(data as Profile)
        setError(null)
      }
    } catch (err) {
      console.error('Unexpected profile fetch error:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session — the middleware already refreshed the cookie,
    // so this just reads the current state.
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    initAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase.auth])

  const signUp = async (email: string, password: string, userType: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: userType, full_name: fullName },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await supabase
          .from('profiles')
          .update({ user_type: userType, full_name: fullName })
          .eq('id', data.user.id)
      }

      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      if (!data?.user) throw new Error('Login failed - no user data')

      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      setLoading(false)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setError(null)
    } catch (err) {
      console.error('Sign out error:', err)
      setUser(null)
      setProfile(null)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user!.id)
        .select()
        .single()

      if (updateError) throw updateError

      setProfile(data as Profile)
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      return { data: null, error: err }
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
