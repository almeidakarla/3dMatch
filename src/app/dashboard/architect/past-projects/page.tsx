'use client'

/**
 * PAST PROJECTS PAGE — /dashboard/architect/past-projects
 *
 * OLD CRA APPROACH:
 *   - Component imported supabase from a global singleton
 *   - Used useNavigate() for navigation
 *   - Included <style jsx> blocks for component styles
 *
 * NEW NEXT.JS APPROACH:
 *   - Uses createClient() from our browser client (cookie-based auth)
 *   - Uses useRouter() from next/navigation
 *   - Styles are in globals.css (no inline style jsx blocks)
 *   - Still a client component ('use client') because of state, effects, click handlers
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { CheckCircle, Calendar, User, Image as ImageIcon } from 'lucide-react'

interface ArtistProfile {
  id: string
  full_name: string
  profile_photo?: string
}

interface PastProject {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max?: number
  deadline: string
  status: string
  artist: ArtistProfile
  quoted_price: number
  delivery_count: number
  current_round: number
  completed_at: string
  created_at: string
}

interface ApplicationRow {
  id: string
  artist_id: string
  quoted_price: number
  delivery_status: string
  delivery_files: string[] | null
  delivery_approved_at: string | null
  current_round: number | null
  status: string
  profiles: ArtistProfile | ArtistProfile[]
}

interface ProjectRow {
  id: string
  title: string
  description: string
  budget: number
  budget_max?: number
  deadline: string
  status: string
  created_at: string
  updated_at: string
  applications: ApplicationRow[]
}

export default function ProjectHistoryPage() {
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

      console.log('Loading past projects for architect:', user.id)

      // Load completed projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          budget,
          deadline,
          status,
          created_at,
          updated_at,
          applications!inner (
            id,
            artist_id,
            quoted_price,
            delivery_status,
            delivery_files,
            delivery_approved_at,
            current_round,
            status,
            profiles!applications_artist_id_fkey (
              id,
              full_name,
              profile_photo
            )
          )
        `)
        .eq('architect_id', user.id)
        .eq('applications.status', 'completed')
        .order('updated_at', { ascending: false })

      if (projectsError) {
        console.error('Query error:', projectsError)
        throw projectsError
      }

      console.log('Completed projects:', projects)

      // Map projects with artist info
      const mappedProjects: PastProject[] = (projects as unknown as ProjectRow[])?.map(project => {
        const completedApp = project.applications[0] // Get the completed application
        const artistProfile = Array.isArray(completedApp.profiles)
          ? completedApp.profiles[0]
          : completedApp.profiles
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          budget_min: project.budget,
          budget_max: project.budget_max,
          deadline: project.deadline,
          status: project.status,
          artist: artistProfile,
          quoted_price: completedApp.quoted_price,
          delivery_count: completedApp.delivery_files?.length || 0,
          current_round: completedApp.current_round || 1,
          completed_at: completedApp.delivery_approved_at || project.updated_at,
          created_at: project.created_at,
        }
      }) || []

      console.log('Mapped past projects:', mappedProjects)
      setPastProjects(mappedProjects)
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

  if (loading) {
    return (
      <div className="past-projects-container">
        <div className="loading-container">
          <p>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="past-projects-container">
      <div className="page-header">
        <div>
          <h2 className="section-title">Project History</h2>
          <p className="subtitle">Completed projects</p>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <CheckCircle size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{pastProjects.length}</div>
              <div className="stat-label">Completed Projects</div>
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
                  <span className="detail-label">Artist:</span>
                  <span className="detail-value">{project.artist?.full_name}</span>
                </div>
                <div className="detail-row">
                  <ImageIcon size={16} />
                  <span className="detail-label">Deliveries:</span>
                  <span className="detail-value">
                    {project.delivery_count} round{project.delivery_count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/dashboard/architect/project/${project.id}`)}
                className="btn-view-details"
              >
                View Details and Renders
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
