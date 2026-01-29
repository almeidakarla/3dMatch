'use client'

/**
 * DASHBOARD LAYOUT — wraps all /dashboard/* pages
 *
 * OLD CRA APPROACH:
 *   DashboardLayout.js used <Outlet /> from react-router-dom to render child routes.
 *   The layout + sidebar were only shown when inside the dashboard route.
 *   ProtectedRoute component wrapped around dashboard to check auth.
 *
 * NEW NEXT.JS APPROACH:
 *   This layout.tsx is automatically applied to all routes under /dashboard/*.
 *   Instead of <Outlet />, we receive {children} as a prop.
 *   Route protection is handled by middleware (src/middleware.ts) — no ProtectedRoute needed.
 *   The middleware redirects unauthenticated users before this layout even renders.
 *
 * WHY 'use client'?
 *   Dark mode toggle, sidebar expansion, and sign-out all require client-side state.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, signOut, error, loading } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/')
    } catch (err) {
      console.error('Error signing out:', err)
      router.replace('/')
    }
  }

  // Show error screen if profile failed to load
  if (error && !loading) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f8f9fa',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>&#9888;&#65039;</div>
            <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>Error Loading Profile</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
            <button
              onClick={handleSignOut}
              className="btn-primary"
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar
        userType={profile?.user_type}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
