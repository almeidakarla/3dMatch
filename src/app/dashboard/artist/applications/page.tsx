'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import EditApplicationModal from '@/components/artist/EditApplicationModal'

interface ApplicationData {
  id: string
  quoted_price: number
  currency: string
  delivery_timeline: number
  proposal: string
  status: string
  delivery_status: string
  rejection_reason?: string
  created_at: string
  projects: {
    title: string
    architect: {
      full_name: string
    }
  }
}

const statusBadges: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'badge-pending' },
  accepted: { label: 'Accepted', className: 'badge-accepted' },
  rejected: { label: 'Not Picked', className: 'badge-declined' },
  withdrawn: { label: 'Withdrawn', className: 'badge-declined' },
  completed: { label: 'Completed', className: 'badge-completed' },
}

export default function MyApplicationsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [filter, setFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingApp, setEditingApp] = useState<ApplicationData | null>(null)
  const [message, setMessage] = useState('')

  const loadApplications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          projects:project_id (
            *,
            architect:architect_id (
              full_name
            )
          )
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications((data || []) as unknown as ApplicationData[])
    } catch (error: unknown) {
      console.error('Error loading applications:', error)
      setMessage(`Error loading applications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id) {
      loadApplications()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', appId)

      if (error) throw error

      setMessage('Application withdrawn successfully')
      await loadApplications()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error withdrawing application:', error)
      setMessage('Error withdrawing application')
    }
  }

  const handleEditApplication = (app: ApplicationData) => {
    setEditingApp(app)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingApp(null)
    setMessage('Application updated successfully!')
    loadApplications()
    setTimeout(() => setMessage(''), 3000)
  }

  const getStatusBadge = (status: string) => {
    return statusBadges[status] || statusBadges.pending
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    if (filter === 'accepted') return app.status === 'accepted' || app.status === 'completed'
    return app.status === filter
  })

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted' || a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
  }

  if (loading) {
    return <div className="loading">Loading applications...</div>
  }

  return (
    <div className="applications-container">
      <h2 className="section-title">My Applications</h2>
      <p className="subtitle">Track the status of your proposals</p>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <div className="filter-tabs">
        {(['all', 'pending', 'accepted', 'rejected', 'withdrawn'] as const).map(tab => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'rejected' ? 'Not Picked' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">
            {filter === 'all'
              ? 'No applications submitted yet'
              : `No ${filter} applications`}
          </p>
          <p className="empty-state-text">
            {filter === 'all'
              ? 'Explore available projects and submit your proposals!'
              : 'Switch to "All" to see all your applications.'}
          </p>
          {filter === 'all' && (
            <Link href="/dashboard/artist/browse-projects" className="btn-primary" style={{ marginTop: '1rem' }}>
              Explore Available Projects
            </Link>
          )}
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => {
            const badge = getStatusBadge(app.status)

            return (
              <div key={app.id} className="application-item">
                <div className="application-item-header">
                  <div className="artist-quick-info">
                    <div>
                      <h3 className="artist-name-small">{app.projects.title}</h3>
                      <p className="project-title-small">
                        Client: <strong>{app.projects.architect.full_name}</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="application-item-body">
                  <div className="application-details-compact">
                    <div className="detail-compact">
                      <span className="label">Price:</span>
                      <span className="value">R$ {app.quoted_price?.toFixed(2)}</span>
                    </div>
                    <div className="detail-compact">
                      <span className="label">Timeline:</span>
                      <span className="value">{app.delivery_timeline} days</span>
                    </div>
                    <div className="detail-compact">
                      <span className="label">Submitted:</span>
                      <span className="value">{formatDate(app.created_at)}</span>
                    </div>
                  </div>

                  <div className="proposal-preview">
                    <strong>Proposal:</strong>
                    <p>{app.proposal}</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="application-actions-inline">
                      <button onClick={() => handleEditApplication(app)} className="btn-primary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleWithdraw(app.id)} className="btn-secondary btn-sm">
                        Withdraw
                      </button>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <div className="status-message success">
                      Congratulations! Your proposal was accepted. Go to &quot;Projects&quot; to start working.
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className="status-message error">
                      <strong>Feedback:</strong>
                      <p>{app.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showEditModal && editingApp && (
        <EditApplicationModal
          application={editingApp}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
