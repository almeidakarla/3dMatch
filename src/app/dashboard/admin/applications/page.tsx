'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification, sendEmailNotification } from '@/lib/notifications'
import { CheckCircle, XCircle, Clock, ExternalLink, FileText, User, Award, Calendar } from 'lucide-react'

interface ArtistApplication {
  id: string
  full_name: string
  email: string
  phone?: string
  years_experience: number
  software?: string[]
  other_software?: string
  architecture_style?: string[]
  favorite_project_types?: string[]
  portfolio_urls?: string[]
  portfolio_files?: string[]
  additional_notes?: string
  status: string
  review_notes?: string
  reviewed_at?: string
  created_at: string
}

export default function ArtistApplicationReviewPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ArtistApplication[]>([])
  const [filter, setFilter] = useState('pending')
  const [selectedApp, setSelectedApp] = useState<ArtistApplication | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadApplications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadApplications = async () => {
    try {
      setLoading(true)
      let query = supabase.from('artist_submissions').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (applicationId: string, status: string, application: ArtistApplication) => {
    setReviewing(true)
    try {
      const { data, error } = await supabase.rpc('approve_artist_application', {
        application_id: applicationId,
        new_status: status,
        admin_notes: reviewNotes || null
      })
      if (error) { console.error('Error calling approve function:', error); throw error }
      if (!data || !data.success) throw new Error(data?.error || 'Failed to process application')

      // Get the user_id from the application
      const { data: appData } = await supabase
        .from('artist_submissions')
        .select('user_id')
        .eq('id', applicationId)
        .single()

      // Send notification to the artist
      if (status === 'approved' && appData?.user_id) {
        // Create in-app notification for approval
        const notifResult = await createNotification({
          supabase,
          userId: appData.user_id,
          type: 'application_accepted',
          title: 'Application Approved!',
          message: 'Congratulations! Your artist application has been approved. You can now browse and apply for projects on 3DMatch!',
          link: '/dashboard/artist/browse-projects'
        })
        console.log('In-app notification result:', notifResult)

        // Send email notification for approval
        if (application.email) {
          console.log('Sending approval email to:', application.email)
          const emailResult = await sendEmailNotification({
            to: application.email,
            type: 'application_accepted',
            title: 'Application Approved!',
            message: 'Congratulations! Your artist application has been approved. You can now browse and apply for projects on 3DMatch!',
            link: '/dashboard/artist/browse-projects',
            recipientName: application.full_name
          })
          console.log('Email result:', emailResult)
        } else {
          console.log('No email found for application')
        }
      }

      if (status === 'rejected' && appData?.user_id) {
        // Create in-app notification for denial
        const notifResult = await createNotification({
          supabase,
          userId: appData.user_id,
          type: 'application_rejected',
          title: 'Application Update',
          message: reviewNotes
            ? `Your artist application was not approved. Feedback: ${reviewNotes}. We welcome you to try again with an updated portfolio!`
            : 'Your artist application was not approved at this time. We welcome you to try again with an updated portfolio!',
          link: '/dashboard/artist/apply'
        })
        console.log('In-app notification result:', notifResult)

        // Send email notification for denial
        if (application.email) {
          console.log('Sending denial email to:', application.email)
          const emailResult = await sendEmailNotification({
            to: application.email,
            type: 'application_rejected',
            title: 'Application Update',
            message: reviewNotes
              ? `Your artist application was not approved. Feedback: ${reviewNotes}. We welcome you to try again with an updated portfolio!`
              : 'Your artist application was not approved at this time. We welcome you to try again with an updated portfolio!',
            link: '/dashboard/artist/apply',
            recipientName: application.full_name
          })
          console.log('Email result:', emailResult)
        } else {
          console.log('No email found for application')
        }
      }

      alert(status === 'approved' ? 'Application approved successfully!' : 'Application denied. The artist has been notified.')
      await loadApplications()
      setSelectedApp(null)
      setReviewNotes('')
    } catch (error: any) {
      console.error('Error reviewing application:', error)
      alert('Error processing review: ' + (error.message || 'Unknown error'))
    } finally {
      setReviewing(false)
    }
  }

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="status-badge status-pending"><Clock size={14} /> Pending</span>
      case 'approved': return <span className="status-badge status-approved"><CheckCircle size={14} /> Approved</span>
      case 'rejected': return <span className="status-badge status-rejected"><XCircle size={14} /> Denied</span>
      default: return null
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading) return <div className="loading">Loading applications...</div>

  return (
    <div className="admin-review-container">
      <div className="admin-header">
        <h2 className="section-title"><Award size={28} /> Artist Application Review</h2>
        <p className="subtitle">Review and approve 3D artists to ensure platform quality</p>
      </div>

      <div className="review-stats">
        <div className="stat-card" onClick={() => setFilter('all')}><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
        <div className="stat-card stat-pending" onClick={() => setFilter('pending')}><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card stat-approved" onClick={() => setFilter('approved')}><div className="stat-value">{stats.approved}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card stat-rejected" onClick={() => setFilter('rejected')}><div className="stat-value">{stats.rejected}</div><div className="stat-label">Denied</div></div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'pending' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('pending')}><Clock size={18} /> Pending ({stats.pending})</button>
        <button className={filter === 'approved' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('approved')}><CheckCircle size={18} /> Approved ({stats.approved})</button>
        <button className={filter === 'rejected' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('rejected')}><XCircle size={18} /> Denied ({stats.rejected})</button>
        <button className={filter === 'all' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('all')}><FileText size={18} /> All ({stats.total})</button>
      </div>

      <div className="applications-grid">
        {applications.length === 0 ? (
          <div className="empty-state"><FileText size={64} /><h3>No applications found</h3><p>There are no applications with status &quot;{filter}&quot;</p></div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="application-card-header">
                <div className="application-info"><h3>{app.full_name}</h3><p className="application-email">{app.email}</p></div>
                {getStatusBadge(app.status)}
              </div>
              <div className="application-card-details">
                <div className="detail-item"><User size={16} /><span>{app.years_experience} years of experience</span></div>
                <div className="detail-item"><Calendar size={16} /><span>{formatDate(app.created_at)}</span></div>
              </div>
              <div className="application-card-tags">
                <div className="tag-group">
                  <strong>Software:</strong>
                  {app.software?.slice(0, 3).map((sw, idx) => <span key={idx} className="tag">{sw}</span>)}
                  {(app.software?.length || 0) > 3 && <span className="tag">+{(app.software?.length || 0) - 3}</span>}
                </div>
              </div>
              <div className="application-card-actions">
                <button className="btn-secondary" onClick={() => setSelectedApp(app)}><FileText size={18} /> View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content application-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application from {selectedApp.full_name}</h2>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>x</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {selectedApp.full_name}</p>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                {selectedApp.phone && <p><strong>Phone/WhatsApp:</strong> {selectedApp.phone}</p>}
                <p><strong>Years of Experience:</strong> {selectedApp.years_experience}</p>
                <p><strong>Submission Date:</strong> {formatDate(selectedApp.created_at)}</p>
              </div>
              <div className="detail-section">
                <h3>Portfolio</h3>
                {selectedApp.portfolio_urls && selectedApp.portfolio_urls.length > 0 && (
                  <div><strong>Links:</strong>
                    <ul className="portfolio-links-list">
                      {selectedApp.portfolio_urls.map((url, idx) => <li key={idx}><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> {url}</a></li>)}
                    </ul>
                  </div>
                )}
                {selectedApp.portfolio_files && selectedApp.portfolio_files.length > 0 && (
                  <div><strong>Portfolio Images:</strong>
                    <div className="portfolio-images-grid">
                      {selectedApp.portfolio_files.map((file, idx) => <a key={idx} href={file} target="_blank" rel="noopener noreferrer"><img src={file} alt={`Portfolio ${idx + 1}`} /></a>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="detail-section">
                <h3>Professional Skills</h3>
                <div><strong>Software:</strong><div className="tags-list">{selectedApp.software?.map((sw, idx) => <span key={idx} className="tag">{sw}</span>)}</div></div>
                {selectedApp.other_software && <p><strong>Other Software:</strong> {selectedApp.other_software}</p>}
                <div><strong>Architecture Styles:</strong><div className="tags-list">{selectedApp.architecture_style?.map((style, idx) => <span key={idx} className="tag">{style}</span>)}</div></div>
                <div><strong>Favorite Project Types:</strong><div className="tags-list">{selectedApp.favorite_project_types?.map((type, idx) => <span key={idx} className="tag">{type}</span>)}</div></div>
              </div>
              {selectedApp.additional_notes && <div className="detail-section"><h3>Additional Information</h3><p>{selectedApp.additional_notes}</p></div>}
              {selectedApp.status === 'pending' && (
                <div className="detail-section">
                  <h3>Review Notes</h3>
                  <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes about this review (optional)" className="form-textarea" rows={4} />
                </div>
              )}
              {selectedApp.status !== 'pending' && selectedApp.review_notes && (
                <div className="detail-section"><h3>Review Notes</h3><p>{selectedApp.review_notes}</p><p className="review-meta">Reviewed on {formatDate(selectedApp.reviewed_at || '')}</p></div>
              )}
            </div>
            {selectedApp.status === 'pending' && (
              <div className="modal-footer">
                <button className="btn-danger" onClick={() => handleReview(selectedApp.id, 'rejected', selectedApp)} disabled={reviewing}><XCircle size={20} /> {reviewing ? 'Processing...' : 'Deny'}</button>
                <button className="btn-success" onClick={() => handleReview(selectedApp.id, 'approved', selectedApp)} disabled={reviewing}><CheckCircle size={20} /> {reviewing ? 'Processing...' : 'Approve'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
