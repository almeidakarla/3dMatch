'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import PaymentModal from '@/components/shared/PaymentModal'
import FinalPaymentModal from '@/components/architect/FinalPaymentModal'
import EditProjectModal from '@/components/architect/EditProjectModal'
import { formatPrivateName } from '@/utils/nameFormatter'

interface Application {
  id: string
  project_id: string
  artist_id: string
  quoted_price: number
  proposed_budget: number
  proposed_currency: string
  delivery_timeline: number
  delivery_status: string
  delivery_files: any[]
  delivery_notes: string
  current_round: number
  revision_requests: any[]
  proposal: string
  status: string
  rejection_reason?: string
  created_at: string
  artist: {
    id: string
    full_name: string
    profile_photo: string
    location: string
    bio: string
  }
  project?: any
  projects?: any
}

interface ProjectWithApps {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  deadline: string
  category: string
  status: string
  number_of_rooms?: number
  renders_per_room?: number
  reference_images?: string[]
  created_at: string
  applications: Application[]
}

export default function ArchitectProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectWithApps[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFinalPaymentModal, setShowFinalPaymentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectWithApps | null>(null)
  const [message, setMessage] = useState('')
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Application | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('architect_id', user!.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      const projectsWithApplications = await Promise.all(
        (projectsData || []).map(async (project: any) => {
          const { data: applicationsData, error: appsError } = await supabase
            .from('applications')
            .select(`*, artist:artist_id ( id, full_name, profile_photo, location, bio )`)
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
          if (appsError) throw appsError
          return { ...project, applications: applicationsData || [] }
        })
      )

      const activeProjects = projectsWithApplications.filter(project => {
        return !project.applications.some((app: any) => app.status === 'completed')
      })

      setProjects(activeProjects)
    } catch (error: any) {
      console.error('Error loading projects:', error)
      setMessage('Error loading projects: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id) { loadProjects() } else { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleAccept = (application: Application) => {
    setSelectedApplication(application)
    setShowPaymentModal(true)
  }

  const handleReject = async (applicationId: string) => {
    const reason = window.prompt('Rejection reason (optional):')
    try {
      const { error } = await supabase.from('applications').update({ status: 'rejected', rejection_reason: reason || null }).eq('id', applicationId)
      if (error) throw error
      setMessage('Application rejected')
      await loadProjects()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error rejecting:', error)
      setMessage('Error rejecting application')
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    try {
      if (selectedApplication) {
        await supabase.rpc('create_default_milestones', {
          p_project_id: selectedApplication.project_id,
          p_application_id: selectedApplication.id,
          p_total_amount: selectedApplication.proposed_budget,
          p_currency: selectedApplication.proposed_currency || 'brl',
        })
      }
      setMessage('Payment completed! Artist accepted successfully.')
      await loadProjects()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error updating status')
    }
  }

  const handleEditProject = (project: ProjectWithApps) => { setSelectedProject(project); setShowEditModal(true) }

  const handleEditSuccess = () => {
    setShowEditModal(false); setSelectedProject(null)
    setMessage('Project updated successfully!'); loadProjects(); setTimeout(() => setMessage(''), 3000)
  }

  const handleViewDelivery = (application: Application) => { setSelectedDelivery(application); setShowDeliveryModal(true) }

  const handleApproveDelivery = async (application: Application) => {
    if (!window.confirm('Approve delivery and process final 50% payment?')) return
    try {
      const { data, error } = await supabase.rpc('approve_delivery_and_release_payment', { p_application_id: application.id })
      if (error) throw error
      if (!data || !(data as any).success) throw new Error((data as any)?.error || 'Failed to approve delivery')
      setMessage('Delivery approved! Processing final payment...')
      setShowDeliveryModal(false); setSelectedDelivery(null)
      setSelectedApplication(application); setShowFinalPaymentModal(true)
    } catch (err: any) {
      console.error('Error:', err); setMessage(`Error: ${err.message}`)
    }
  }

  const handleRejectDelivery = async (applicationId: string) => {
    const reason = window.prompt('Rejection reason (optional):')
    try {
      const { error } = await supabase.from('applications').update({ delivery_status: 'rejected', delivery_rejection_reason: reason || null, updated_at: new Date().toISOString() }).eq('id', applicationId)
      if (error) throw error
      setMessage('Delivery rejected. The artist can resubmit.')
      setShowDeliveryModal(false); await loadProjects(); setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error:', error); setMessage('Error rejecting delivery')
    }
  }

  const handleFinalPaymentSuccess = async () => {
    setShowFinalPaymentModal(false)
    setMessage('Final payment completed! Project finished.')
    await loadProjects(); setTimeout(() => setMessage(''), 3000)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Awaiting Response', className: 'badge-pending' },
      accepted: { label: 'Accepted', className: 'badge-accepted' },
      rejected: { label: 'Rejected', className: 'badge-rejected' },
    }
    return badges[status] || badges.pending
  }

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })

  if (loading) return <div className="loading">Loading projects...</div>

  return (
    <div className="architect-projects-container">
      <h2 className="section-title">My Projects</h2>
      <p className="subtitle">Manage your projects and received applications</p>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>{message}</div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No active projects right now</p>
          <p className="empty-state-text">Publish a project to start receiving applications from talented 3D artists!</p>
          <button className="btn-primary" onClick={() => router.push('/dashboard/architect/post-project')} style={{ marginTop: '1.5rem' }}>
            + Publish New Project
          </button>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div key={project.id} className="project-detail-card">
              <div className="project-detail-header">
                <div>
                  <h3 className="project-title" onClick={() => router.push(`/dashboard/architect/project/${project.id}`)} style={{ cursor: 'pointer', color: '#5390E3' }}>
                    {project.title}
                  </h3>
                  <p className="project-meta">
                    {project.currency} {project.budget?.toLocaleString()} | Deadline: {formatDate(project.deadline)} | {project.applications.length} application(s)
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {project.status === 'open' && (
                    <button className="btn-secondary btn-sm" onClick={() => handleEditProject(project)}>Edit</button>
                  )}
                  <span className={`status-badge badge-${project.status}`}>
                    {project.status === 'open' ? 'Open' : project.status === 'in_progress' ? 'In Progress' : project.status === 'completed' ? 'Completed' : 'Canceled'}
                  </span>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              {project.applications.length === 0 ? (
                <div className="no-applications"><p>No applications received yet.</p></div>
              ) : (
                <div className="applications-section">
                  <h4 className="applications-title">Received Applications:</h4>
                  <div className="applications-grid">
                    {project.applications.map(app => {
                      const statusBadge = getStatusBadge(app.status)
                      return (
                        <div key={app.id} className="application-card">
                          <div className="application-header">
                            <div className="artist-info">
                              <div className="artist-photo-small">
                                {app.artist.profile_photo ? (
                                  <img src={app.artist.profile_photo} alt={app.artist.full_name} />
                                ) : (
                                  <div className="photo-placeholder">{app.artist.full_name?.charAt(0)}</div>
                                )}
                              </div>
                              <div>
                                <h5 className="artist-name">{formatPrivateName(app.artist.full_name)}</h5>
                                {app.artist.location && <p className="artist-location">{app.artist.location}</p>}
                              </div>
                            </div>
                            <span className={`status-badge ${statusBadge.className}`}>{statusBadge.label}</span>
                          </div>

                          {app.artist.bio && <p className="artist-bio">{app.artist.bio}</p>}

                          <div className="application-details">
                            <div className="detail-item">
                              <span className="detail-label">Proposed Price:</span>
                              <span className="detail-value">R$ {app.quoted_price?.toFixed(2)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Delivery Timeline:</span>
                              <span className="detail-value">{app.delivery_timeline} days</span>
                            </div>
                          </div>

                          <div className="proposal-section">
                            <h6 className="proposal-title">Proposal:</h6>
                            <p className="proposal-text">{app.proposal}</p>
                          </div>

                          <p className="application-date">Submitted on: {formatDate(app.created_at)}</p>

                          {app.status === 'pending' && (
                            <div className="application-actions">
                              <button onClick={() => handleAccept(app)} className="btn-primary">Accept Artist</button>
                              <button onClick={() => handleReject(app.id)} className="btn-secondary">Reject</button>
                            </div>
                          )}

                          {app.status === 'accepted' && (
                            <div className="accepted-section">
                              {app.delivery_status === 'submitted' ? (
                                <div className="delivery-review-section">
                                  <div className="delivery-alert">Work delivered! Click to review.</div>
                                  <button onClick={() => handleViewDelivery(app)} className="btn-primary" style={{ marginTop: '10px' }}>Review Delivery</button>
                                </div>
                              ) : app.delivery_status === 'approved' ? (
                                <div className="delivery-approved-message">Delivery approved and final payment processed!</div>
                              ) : app.delivery_status === 'rejected' ? (
                                <div className="delivery-rejected-message">Delivery rejected. Waiting for artist resubmission.</div>
                              ) : (
                                <div className="accepted-message">Artist accepted! Awaiting work delivery.</div>
                              )}
                              <button onClick={() => router.push(`/dashboard/architect/project/${project.id}`)} className="btn-secondary" style={{ marginTop: '10px' }}>
                                View Project Details
                              </button>
                            </div>
                          )}

                          {app.status === 'rejected' && app.rejection_reason && (
                            <div className="rejection-reason"><strong>Rejection reason:</strong><p>{app.rejection_reason}</p></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showPaymentModal && selectedApplication && (
        <PaymentModal application={selectedApplication} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
      )}
      {showEditModal && selectedProject && (
        <EditProjectModal project={selectedProject} onClose={() => setShowEditModal(false)} onSuccess={handleEditSuccess} />
      )}
      {showFinalPaymentModal && selectedApplication && (
        <FinalPaymentModal application={selectedApplication} onClose={() => setShowFinalPaymentModal(false)} onSuccess={handleFinalPaymentSuccess} />
      )}

      {showDeliveryModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Review Deliveries</h2>
              <button onClick={() => setShowDeliveryModal(false)} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="delivery-info">
                <p><strong>Artist:</strong> {formatPrivateName(selectedDelivery.artist?.full_name)}</p>
                <p><strong>Current Round:</strong> {selectedDelivery.current_round || 1}/3</p>
              </div>
              {selectedDelivery.delivery_files && selectedDelivery.delivery_files.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                  {selectedDelivery.delivery_files.map((delivery: any, roundIndex: number) => (
                    <div key={roundIndex} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>Round {delivery.round}</h4>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(delivery.submitted_at).toLocaleString('en-US')}</span>
                      </div>
                      {delivery.note && (
                        <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
                          <strong>Artist&apos;s Note:</strong>
                          <p style={{ margin: '5px 0 0 0' }}>{delivery.note}</p>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                        {delivery.files?.map((fileUrl: string, fileIndex: number) => (
                          <div key={fileIndex} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img src={fileUrl} alt={`Round ${delivery.round} - ${fileIndex + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>File</div>
                            )}
                            <div style={{ padding: '8px', textAlign: 'center' }}>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#5390E3' }}>View/Download</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}><p>No deliveries found.</p></div>
              )}
              <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, color: '#856404' }}><strong>Attention:</strong> By approving this delivery, the final 50% payment will be processed automatically.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
              <button onClick={() => handleApproveDelivery(selectedDelivery)} className="btn-primary" style={{ background: '#28a745' }}>Approve and Pay Final 50%</button>
              {(selectedDelivery.current_round || 1) < 3 && (
                <button onClick={() => { const r = window.prompt('Describe the desired changes:'); if (r?.trim()) handleRejectDelivery(selectedDelivery.id) }} className="btn-secondary" style={{ background: '#ffc107', color: '#333' }}>
                  Request Revision (Round {(selectedDelivery.current_round || 1) + 1}/3)
                </button>
              )}
              <button onClick={() => setShowDeliveryModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
