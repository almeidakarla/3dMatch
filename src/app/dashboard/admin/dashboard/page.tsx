'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, Briefcase, TrendingUp, DollarSign, Clock, CheckCircle,
  AlertTriangle, Activity, Award, UserCheck
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalArtists: number
  totalArchitects: number
  pendingArtistApplications: number
  totalProjects: number
  openProjects: number
  inProgressProjects: number
  completedProjects: number
  totalRevenue: number
  platformRevenue: number
  averageProjectValue: number
  totalApplications: number
  loyaltyMilestonesPending: number
  freeProjectsEarned: number
  recentProjects: any[]
  recentApplications: any[]
  topArchitects: any[]
  topArtists: any[]
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArtists: 0,
    totalArchitects: 0,
    pendingArtistApplications: 0,
    totalProjects: 0,
    openProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    averageProjectValue: 0,
    totalApplications: 0,
    loyaltyMilestonesPending: 0,
    freeProjectsEarned: 0,
    recentProjects: [],
    recentApplications: [],
    topArchitects: [],
    topArtists: []
  })

  useEffect(() => {
    loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [usersData, projectsData, applicationsData, artistSubmissionsData, loyaltyData, milestonesData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('applications').select('*'),
        supabase.from('artist_submissions').select('*'),
        supabase.from('loyalty_program').select('*'),
        supabase.from('loyalty_milestones').select('*').eq('processed', false)
      ])

      const users = usersData.data || []
      const totalUsers = users.length
      const totalArtists = users.filter((u: any) => u.user_type === 'artista').length
      const totalArchitects = users.filter((u: any) => u.user_type === 'arquiteto').length

      const submissions = artistSubmissionsData.data || []
      const pendingArtistApplications = submissions.filter((s: any) => s.status === 'pending').length

      const applications = applicationsData.data || []
      const totalApplications = applications.length

      const projects = projectsData.data || []
      const totalProjects = projects.length
      const openProjects = projects.filter((p: any) => p.status === 'open').length
      const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length

      const completedApplications = applications.filter((a: any) => a.status === 'accepted')
      const totalRevenue = completedApplications.reduce((sum: number, a: any) => sum + (a.quoted_price || 0), 0)
      const averageProjectValue = completedApplications.length > 0 ? totalRevenue / completedApplications.length : 0
      const platformRevenue = totalRevenue * 0.10

      const loyalty = loyaltyData.data || []
      const milestones = milestonesData.data || []
      const freeProjectsEarned = loyalty.reduce((sum: number, l: any) => sum + (l.free_projects_earned || 0), 0)
      const loyaltyMilestonesPending = milestones.length

      const recentProjects = projects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
      const recentApplications = applications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

      const architectProjectCounts: Record<string, number> = {}
      projects.forEach((p: any) => { if (p.architect_id) architectProjectCounts[p.architect_id] = (architectProjectCounts[p.architect_id] || 0) + 1 })
      const topArchitectIds = Object.entries(architectProjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)
      const topArchitects = users.filter((u: any) => topArchitectIds.includes(u.id)).map((u: any) => ({ ...u, projectCount: architectProjectCounts[u.id] }))

      const artistProjectCounts: Record<string, number> = {}
      completedApplications.forEach((app: any) => { if (app.artist_id) artistProjectCounts[app.artist_id] = (artistProjectCounts[app.artist_id] || 0) + 1 })
      const topArtistIds = Object.entries(artistProjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)
      const topArtists = users.filter((u: any) => topArtistIds.includes(u.id)).map((u: any) => ({ ...u, projectCount: artistProjectCounts[u.id] }))

      setStats({
        totalUsers, totalArtists, totalArchitects, pendingArtistApplications, totalProjects, openProjects, inProgressProjects, completedProjects,
        totalRevenue, platformRevenue, averageProjectValue, totalApplications, loyaltyMilestonesPending, freeProjectsEarned, recentProjects, recentApplications, topArchitects, topArtists
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="status-badge status-open">Open</span>
      case 'in_progress': return <span className="status-badge status-in-progress">In Progress</span>
      case 'completed': return <span className="status-badge status-completed">Completed</span>
      default: return <span className="status-badge">{status}</span>
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title"><Activity size={32} /> Administrative Dashboard</h1>
        <p className="dashboard-subtitle">Complete overview of the 3dMatch platform</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon"><Users size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalUsers}</div>
            <div className="stat-card-label">Total Users</div>
            <div className="stat-card-detail">{stats.totalArtists} Artists - {stats.totalArchitects} Designers & Developers</div>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-icon"><Briefcase size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalProjects}</div>
            <div className="stat-card-label">Total Projects</div>
            <div className="stat-card-detail">{stats.completedProjects} Completed - {stats.inProgressProjects} In Progress</div>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-icon"><DollarSign size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-card-label">Total Project Value</div>
            <div className="stat-card-detail">Platform Fee (10%): {formatCurrency(stats.platformRevenue)}</div>
          </div>
        </div>
        <div className="stat-card stat-card-orange">
          <div className="stat-card-icon"><UserCheck size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalApplications}</div>
            <div className="stat-card-label">Total Applications</div>
            <div className="stat-card-detail">{stats.pendingArtistApplications} Pending Artists</div>
          </div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="stat-card-icon"><Award size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.freeProjectsEarned}</div>
            <div className="stat-card-label">Free Projects Earned</div>
            <div className="stat-card-detail">{stats.loyaltyMilestonesPending} Pending Milestones</div>
          </div>
        </div>
        <div className="stat-card stat-card-teal">
          <div className="stat-card-icon"><Activity size={28} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.openProjects}</div>
            <div className="stat-card-label">Open Projects</div>
            <div className="stat-card-detail">Awaiting applications</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title"><TrendingUp size={24} /> Project Status</h2>
        <div className="status-breakdown-container">
          <div className="status-breakdown-item">
            <div className="status-breakdown-icon status-open"><Clock size={24} /></div>
            <div className="status-breakdown-content">
              <div className="status-breakdown-value">{stats.openProjects}</div>
              <div className="status-breakdown-label">Open</div>
              <div className="status-breakdown-percentage">{stats.totalProjects > 0 ? ((stats.openProjects / stats.totalProjects) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
          <div className="status-breakdown-item">
            <div className="status-breakdown-icon status-in-progress"><Activity size={24} /></div>
            <div className="status-breakdown-content">
              <div className="status-breakdown-value">{stats.inProgressProjects}</div>
              <div className="status-breakdown-label">In Progress</div>
              <div className="status-breakdown-percentage">{stats.totalProjects > 0 ? ((stats.inProgressProjects / stats.totalProjects) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
          <div className="status-breakdown-item">
            <div className="status-breakdown-icon status-completed"><CheckCircle size={24} /></div>
            <div className="status-breakdown-content">
              <div className="status-breakdown-value">{stats.completedProjects}</div>
              <div className="status-breakdown-label">Completed</div>
              <div className="status-breakdown-percentage">{stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-two-column">
        <div className="dashboard-section">
          <h2 className="section-title"><Users size={24} /> Top Designers & Developers</h2>
          <div className="top-users-list">
            {stats.topArchitects.length > 0 ? stats.topArchitects.map((architect: any, index: number) => (
              <div key={architect.id} className="top-user-item">
                <div className="top-user-rank">#{index + 1}</div>
                <div className="top-user-avatar">{architect.profile_photo ? <img src={architect.profile_photo} alt={architect.full_name} /> : <div className="avatar-placeholder">{architect.full_name?.charAt(0) || 'A'}</div>}</div>
                <div className="top-user-info"><div className="top-user-name">{architect.full_name || 'No name'}</div><div className="top-user-detail">{architect.projectCount} project{architect.projectCount !== 1 ? 's' : ''}</div></div>
                <div className="top-user-badge"><Briefcase size={16} /></div>
              </div>
            )) : <div className="empty-state-small">No designers & developers with projects</div>}
          </div>
        </div>
        <div className="dashboard-section">
          <h2 className="section-title"><Award size={24} /> Top Artists</h2>
          <div className="top-users-list">
            {stats.topArtists.length > 0 ? stats.topArtists.map((artist: any, index: number) => (
              <div key={artist.id} className="top-user-item">
                <div className="top-user-rank">#{index + 1}</div>
                <div className="top-user-avatar">{artist.profile_photo ? <img src={artist.profile_photo} alt={artist.full_name} /> : <div className="avatar-placeholder">{artist.full_name?.charAt(0) || 'A'}</div>}</div>
                <div className="top-user-info"><div className="top-user-name">{artist.full_name || 'No name'}</div><div className="top-user-detail">{artist.projectCount} completed project{artist.projectCount !== 1 ? 's' : ''}</div></div>
                <div className="top-user-badge"><CheckCircle size={16} /></div>
              </div>
            )) : <div className="empty-state-small">No artists with completed projects</div>}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title"><Briefcase size={24} /> Recent Projects</h2>
        <div className="recent-items-table">
          {stats.recentProjects.length > 0 ? (
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Budget</th><th>Date</th><th>Applications</th></tr></thead>
              <tbody>
                {stats.recentProjects.map((project: any) => {
                  const applicationCount = stats.recentApplications.filter((a: any) => a.project_id === project.id).length
                  return (
                    <tr key={project.id}>
                      <td className="project-title-cell">{project.title}</td>
                      <td>{getStatusBadge(project.status)}</td>
                      <td className="currency-cell">{formatCurrency(project.budget || 0)}</td>
                      <td>{formatDate(project.created_at)}</td>
                      <td className="center-cell">{applicationCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <div className="empty-state-small">No projects yet</div>}
        </div>
      </div>

      {(stats.pendingArtistApplications > 0 || stats.loyaltyMilestonesPending > 0) && (
        <div className="dashboard-section">
          <h2 className="section-title"><AlertTriangle size={24} /> Actions Required</h2>
          <div className="alerts-list">
            {stats.pendingArtistApplications > 0 && (
              <div className="alert-item alert-warning">
                <AlertTriangle size={20} />
                <div className="alert-content">
                  <div className="alert-title">{stats.pendingArtistApplications} pending artist application{stats.pendingArtistApplications !== 1 ? 's' : ''}</div>
                  <div className="alert-description">Review and approve artists to maintain platform quality</div>
                </div>
              </div>
            )}
            {stats.loyaltyMilestonesPending > 0 && (
              <div className="alert-item alert-info">
                <Award size={20} />
                <div className="alert-content">
                  <div className="alert-title">{stats.loyaltyMilestonesPending} pending loyalty milestone{stats.loyaltyMilestonesPending !== 1 ? 's' : ''}</div>
                  <div className="alert-description">Designers & developers have reached milestones and earned free projects</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
