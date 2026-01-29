'use client'

/**
 * DASHBOARD HOME — /dashboard
 *
 * Renders the appropriate dashboard based on user type.
 * This page acts as a router to the right dashboard component.
 */

import { useAuth } from '@/context/AuthContext'
import ArchitectDashboard from '@/components/architect/ArchitectDashboard'
import ArtistDashboard from '@/components/artist/ArtistDashboard'
import ProfileCompletionPrompt from '@/components/artist/ProfileCompletionPrompt'

export default function DashboardHomePage() {
  const { profile } = useAuth()

  if (profile?.user_type === 'artista') {
    if (profile?.approval_status === 'approved') {
      return <ArtistDashboard />
    }
    return <ProfileCompletionPrompt profile={profile} />
  }

  if (profile?.user_type === 'arquiteto') {
    return <ArchitectDashboard />
  }

  if (profile?.user_type === 'admin') {
    return (
      <div className="content-section">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {profile.full_name}!</p>
      </div>
    )
  }

  return (
    <div className="content-section">
      <h1>Welcome, {profile?.full_name || 'User'}!</h1>
      <p>Select an option from the sidebar to get started.</p>
    </div>
  )
}
