'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { CheckCircle, Calendar, DollarSign, User } from 'lucide-react'

interface PastProject {
  id: string
  applicationId: string
  title: string
  description: string
  deadline: string
  status: string
  architect: { id: string; full_name: string }
  quoted_price: number
  delivery_timeline: number
  delivery_status: string
  current_round: number
  delivery_count: number
  completed_at: string
  created_at: string
}

export default function ArtistProjectHistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [pastProjects, setPastProjects] = useState<PastProject[]>([])

  const loadPastProjects = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const { data: completedApps, error: appsError } = await supabase
        .from('applications')
        .select(`
          id, artist_id, project_id, quoted_price, delivery_timeline,
          delivery_status, delivery_files, delivery_submitted_at,
          delivery_approved_at, current_round, status, created_at, updated_at,
          projects (
            id, title, description, deadline, architect_id,
            profiles!projects_architect_id_fkey ( id, full_name )
          )
        `)
        .eq('artist_id', user.id)
        .in('status', ['completed'])
        .order('delivery_approved_at', { ascending: false })

      if (appsError) throw appsError

      const projects: PastProject[] = (completedApps || []).map((app: any) => ({
        id: app.projects.id,
        applicationId: app.id,
        title: app.projects.title,
        description: app.projects.description,
        deadline: app.projects.deadline,
        status: app.status,
        architect: Array.isArray(app.projects.profiles) ? app.projects.profiles[0] : app.projects.profiles,
        quoted_price: app.quoted_price,
        delivery_timeline: app.delivery_timeline,
        delivery_status: app.delivery_status,
        current_round: app.current_round || 1,
        delivery_count: app.delivery_files?.length || 0,
        completed_at: app.delivery_approved_at || app.updated_at,
        created_at: app.created_at,
      }))

      setPastProjects(projects)
    } catch (error) {
      console.error('Error loading past projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id) {
      loadPastProjects()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  if (loading) {
    return <div className="loading">Loading history...</div>
  }

  return (
    <div className="past-projects-container">
      <div className="page-header">
        <div>
          <h2 className="section-title">Project History</h2>
          <p className="subtitle">Completed and approved projects</p>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <CheckCircle size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{pastProjects.length}</div>
              <div className="stat-label">Projects Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <DollarSign size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(pastProjects.reduce((sum, p) => sum + (p.quoted_price || 0), 0))}
              </div>
              <div className="stat-label">Total Earned</div>
            </div>
          </div>
        </div>
      </div>

      {pastProjects.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={64} className="empty-icon" />
          <p className="empty-state-title">No completed projects yet</p>
          <p className="empty-state-text">
            Your completed projects will appear here
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {pastProjects.map(project => (
            <div key={project.id} className="past-project-card">
              <div className="project-header">
                <div className="status-badge completed">
                  <CheckCircle size={16} />
                  Completed
                </div>
                <div className="completion-date">
                  <Calendar size={14} />
                  {new Date(project.completed_at).toLocaleDateString('en-US')}
                </div>
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>

              <div className="project-details">
                <div className="detail-row">
                  <User size={16} />
                  <span className="detail-label">Client:</span>
                  <span className="detail-value">{project.architect.full_name}</span>
                </div>
                <div className="detail-row">
                  <DollarSign size={16} />
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">{formatCurrency(project.quoted_price)}</span>
                </div>
                <div className="detail-row">
                  <CheckCircle size={16} />
                  <span className="detail-label">Deliveries:</span>
                  <span className="detail-value">
                    {project.delivery_count} round{project.delivery_count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/dashboard/artist/project/${project.id}`)}
                className="btn-view-details"
              >
                View Complete Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
