'use client'

/**
 * SHARED LOGIN FORM — used by both /login/property and /login/artist
 *
 * OLD CRA APPROACH:
 *   Two nearly identical components (PropertyLogin.js, ArtistLogin.js)
 *   Used useNavigate() from react-router-dom
 *   Had clearAllStorage() for localStorage issues
 *
 * NEW NEXT.JS APPROACH:
 *   Single shared component with props for userType/labels
 *   Uses useRouter() from next/navigation
 *   No clearAllStorage needed — cookies are managed by the browser/middleware
 *   'use client' directive because it has useState, useEffect, event handlers
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface LoginFormProps {
  userType: 'arquiteto' | 'artista'
  title: string
  subtitle: string
  backHref: string
  altLoginLabel: string
  altLoginHref: string
}

export default function LoginForm({
  userType,
  title,
  subtitle,
  backHref,
  altLoginLabel,
  altLoginHref,
}: LoginFormProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { signIn, signUp, loading } = useAuth()
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (isSignup) {
        const { error } = await signUp(email, password, userType, fullName)
        if (error) throw error
        setSignupEmail(email)
        setShowConfirmation(true)
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        setMessage('Login successful! Redirecting...')
        router.push('/dashboard')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error processing your request'
      setMessage(msg)
    }
  }

  if (showConfirmation) {
    return (
      <div className="login-page">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <span role="img" aria-label="email">&#9993;</span>
          </div>
          <h1>Check your email!</h1>
          <p className="confirmation-text">We sent a confirmation link to:</p>
          <p className="confirmation-email">{signupEmail}</p>
          <div className="confirmation-tip">
            <p>
              <strong>Tip:</strong> Check your spam folder if you don&apos;t see it.
            </p>
          </div>
          <button
            onClick={() => {
              setShowConfirmation(false)
              setIsSignup(false)
            }}
            className="btn-primary btn-full"
          >
            Go to login page
          </button>
          <p className="confirmation-footer">
            After confirming your email, you can log in to the platform
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <Link href={backHref} className="btn-back">
        &larr; Back
      </Link>

      <div className="login-card">
        <h2>{isSignup ? 'Create Account' : title}</h2>
        <p className="login-subtitle">{subtitle}</p>

        <form onSubmit={handleAuth}>
          {isSignup && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="login-toggle">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignup(!isSignup)} className="link-button">
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>

        <p className="login-toggle alt-login">
          {altLoginLabel}{' '}
          <Link href={altLoginHref} className="link-button">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
