'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import PaymentModal from '@/components/shared/PaymentModal'
import { formatPrivateName } from '@/utils/nameFormatter'
import { notifyUser } from '@/lib/notifications'

interface ApplicationItem {
  id: string
  project_id: string
  artist_id: string
  quoted_price: number
  delivery_timeline: number
  proposal: string
  status: string
  rejection_reason?: string
  created_at: string
  project: { id: string; title: string; budget: number; currency: string; deadline: string; architect_id: string }
  artist: { id: string; full_name: string; email: string; profile_photo: string; location: string; bio: string; base_rate: number }
}

export default function ApplicationsReceivedPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [filter, setFilter] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null)
  const [message, setMessage] = useState('')

  const loadApplications = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      setLoading(true)
      const { data: projects, error: projectsError } = await supabase.from('projects').select('id').eq('architect_id', user.id)
      if (projectsError) throw projectsError
      const projectIds = projects.map(p => p.id)
      if (projectIds.length === 0) { setApplications([]); setLoading(false); return }

      const { data, error } = await supabase
        .from('applications')
        .select(`*, project:project_id ( id, title, budget, currency, deadline, architect_id ), artist:artist_id ( id, full_name, email, profile_photo, location, bio, base_rate )`)
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
      if (error) throw error

      const validApplications = (data || []).filter((app: any) => app.project !== null)
      setApplications(validApplications as unknown as ApplicationItem[])
    } catch (error: any) {
      console.error('Error loading applications:', error)
      setMessage('Error loading applications: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id) { loadApplications() } else { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleAccept = (application: ApplicationItem) => { setSelectedApplication(application); setShowPaymentModal(true) }

  const handleReject = async (applicationId: string) => {
    const reason = window.prompt('Reason for rejection (optional):')
    const application = applications.find(app => app.id === applicationId)
    try {
      const { error } = await supabase.from('applications').update({ status: 'rejected', rejection_reason: reason || null }).eq('id', applicationId)
      if (error) throw error

      // Send in-app + email notification to artist
      if (application) {
        await notifyUser({
          supabase,
          userId: application.artist_id,
          userEmail: application.artist.email,
          userName: application.artist.full_name,
          type: 'application_rejected',
          title: 'Application Not Selected',
          message: `Your application for "${application.project.title}" was not selected.${reason ? ` Reason: ${reason}` : ''}`,
          link: '/dashboard/artist/applications',
        })
      }

      setMessage('Application rejected')
      await loadApplications()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error rejecting application')
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    try {
      if (selectedApplication) {
        await supabase.from('applications').update({ status: 'accepted' }).eq('id', selectedApplication.id).select()

        // Send in-app + email notification to artist
        await notifyUser({
          supabase,
          userId: selectedApplication.artist_id,
          userEmail: selectedApplication.artist.email,
          userName: selectedApplication.artist.full_name,
          type: 'application_accepted',
          title: 'Application Accepted!',
          message: `Congratulations! Your application for "${selectedApplication.project.title}" has been accepted. You can now start working on the project.`,
          link: `/dashboard/artist/project/${selectedApplication.project.id}`,
        })
      }
      setMessage('Payment completed! Artist accepted successfully.')
      await loadApplications()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error updating status')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'badge-pending' },
      accepted: { label: 'Accepted', className: 'badge-accepted' },
      completed: { label: 'Completed', className: 'badge-accepted' },
      rejected: { label: 'Declined', className: 'badge-rejected' },
    }
    return badges[status] || badges.pending
  }

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

  const filteredApplications = applications.filter(app => filter === 'all' || app.status === filter)

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    completed: applications.filter(a => a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  if (loading) return <div className="loading">Loading applications...</div>

  return (
    <div className="applications-container">
      <h2 className="section-title">Received Applications</h2>
      <p className="subtitle">All artist proposals for your projects</p>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>{message}</div>
      )}

      <div className="filter-tabs">
        {(['all', 'pending', 'accepted', 'completed', 'rejected'] as const).map(tab => (
          <button key={tab} className={`filter-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
            {tab === 'rejected' ? 'Declined' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">{filter === 'all' ? 'No applications received yet' : `No ${filter} applications`}</p>
          <p className="empty-state-text">Post projects to start receiving proposals from artists!</p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => {
            const statusBadge = getStatusBadge(app.status)
            return (
              <div key={app.id} className="application-item">
                <div className="application-item-header">
                  <div className="artist-quick-info">
                    <div className="artist-photo-small">
                      {app.artist.profile_photo ? (
                        <img src={app.artist.profile_photo} alt={formatPrivateName(app.artist.full_name)} />
                      ) : (
                        <div className="photo-placeholder-small">{formatPrivateName(app.artist.full_name)?.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <h3 className="artist-name-small">{formatPrivateName(app.artist.full_name)}</h3>
                      <p className="project-title-small">For: <strong>{app.project.title}</strong></p>
                    </div>
                  </div>
                  <span className={`status-badge ${statusBadge.className}`}>{statusBadge.label}</span>
                </div>

                <div className="application-item-body">
                  {app.artist.location && <p className="artist-location-small">{app.artist.location}</p>}
                  <div className="application-details-compact">
                    <div className="detail-compact"><span className="label">Price:</span><span className="value">${app.quoted_price?.toFixed(2)}</span></div>
                    <div className="detail-compact"><span className="label">Timeline:</span><span className="value">{app.delivery_timeline} days</span></div>
                    <div className="detail-compact"><span className="label">Submitted:</span><span className="value">{formatDate(app.created_at)}</span></div>
                  </div>
                  <div className="proposal-preview"><strong>Proposal:</strong><p>{app.proposal}</p></div>

                  {app.status === 'pending' && (
                    <div className="application-actions-inline">
                      <button onClick={() => handleAccept(app)} className="btn-primary btn-sm">Accept</button>
                      <button onClick={() => handleReject(app.id)} className="btn-secondary btn-sm">Reject</button>
                    </div>
                  )}
                  {app.status === 'accepted' && <div className="status-message success">Artist accepted! The project is underway.</div>}
                  {app.status === 'completed' && <div className="status-message success">Project completed! Delivery has been approved.</div>}
                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className="status-message error"><strong>Reason for rejection:</strong><p>{app.rejection_reason}</p></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showPaymentModal && selectedApplication && (
        <PaymentModal application={selectedApplication} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  )
}
