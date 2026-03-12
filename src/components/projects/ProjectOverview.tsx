'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { notifyUser } from '@/lib/notifications'
import {
  ArrowLeft, MessageSquare,
  CheckCircle, Clock, AlertCircle, Upload, ChevronDown, ChevronUp
} from 'lucide-react'
import Messages from '@/components/messages/Messages'
import PaymentModal from '@/components/shared/PaymentModal'
import FinalPaymentModal from '@/components/architect/FinalPaymentModal'
import WatermarkedImage from '@/components/shared/WatermarkedImage'

interface DeliveryFile {
  round: number
  files: string[]
  note?: string
  submitted_at: string
}

interface RevisionRequest {
  message: string
  requested_at: string
  round: number
}

interface Application {
  id: string
  artist_id: string
  project_id: string
  status: string
  quoted_price: number
  delivery_timeline?: number
  upfront_payment_status?: string
  upfront_paid_at?: string
  delivery_status?: string
  delivery_submitted_at?: string
  delivery_approved_at?: string
  delivery_files?: DeliveryFile[]
  revision_requests?: RevisionRequest[]
  current_round?: number
  updated_at: string
  artist?: { id: string; full_name: string; location?: string }
}

interface Project {
  id: string
  title: string
  description?: string
  status: string
  category?: string
  deadline?: string
  number_of_rooms?: number
  renders_per_room?: number
  reference_images?: string[]
  architect_id: string
  created_at: string
  architect?: { id: string; full_name: string; location?: string }
}

export default function ProjectOverview() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClient()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [artist, setArtist] = useState<{ id: string; full_name: string; location?: string } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFinalPaymentModal, setShowFinalPaymentModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deliveryForm, setDeliveryForm] = useState<{ files: File[]; note: string }>({ files: [], note: '' })
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set())

  const isArchitect = profile?.user_type === 'arquiteto'
  const isArtist = profile?.user_type === 'artista'

  const getNextRound = () => {
    const existingRounds = application?.delivery_files?.length || 0
    return Math.min(existingRounds + 1, 3)
  }

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`*, architect:profiles!projects_architect_id_fkey (id, full_name, location)`)
        .eq('id', id)
        .single()

      if (projectError) throw projectError
      if (!projectData) throw new Error('Project not found')

      setProject(projectData as unknown as Project)

      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`*, artist:profiles!applications_artist_id_fkey (id, full_name, location)`)
        .eq('project_id', id)
        .in('status', ['accepted', 'accepted_paid', 'in_progress', 'submitted', 'completed'])
        .maybeSingle()

      if (appError && appError.code !== 'PGRST116') throw appError

      if (appData) {
        setApplication(appData as unknown as Application)
        setArtist((appData as unknown as Application).artist || null)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => { loadProjectData() }, [loadProjectData])

  useEffect(() => {
    if (application?.delivery_files && application.delivery_files.length > 0) {
      const latestRoundIndex = application.delivery_files.length - 1
      setExpandedRounds(new Set([latestRoundIndex]))
    }
  }, [application?.delivery_files])

  const handleApproveDelivery = async () => {
    if (!window.confirm('Approve this delivery and process final payment of 50%?')) return
    setShowFinalPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    try {
      if (!application || !project) return
      await supabase.from('applications').update({ delivery_status: 'approved', delivery_approved_at: new Date().toISOString(), status: 'completed' }).eq('id', application.id)
      await supabase.from('projects').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', project.id)
      setShowFinalPaymentModal(false)
      alert('Delivery approved and final payment completed successfully!')
      await loadProjectData()
    } catch (error: unknown) {
      const err = error as Error
      alert('Error: ' + err.message)
    }
  }

  const handleRequestRevision = async () => {
    const message = prompt('Describe the desired changes:')
    if (!message?.trim() || !application || !project) return

    try {
      const currentRevisions = application.revision_requests || []
      const currentRound = application.delivery_files?.length || 1
      const newRevision = { message: message.trim(), requested_at: new Date().toISOString(), round: currentRound }

      await supabase.from('applications').update({
        delivery_status: 'revision_requested',
        revision_requests: [...currentRevisions, newRevision],
        current_round: currentRound + 1
      }).eq('id', application.id)

      await notifyUser({
        supabase,
        userId: application.artist_id,
        userName: application.artist?.full_name,
        type: 'revision_requested',
        title: 'Revision Requested',
        message: `Revision requested for "${project.title}"`,
        link: `/dashboard/artist/project/${id}`,
      })

      alert(`Revision requested! Round ${currentRound + 1}/3`)
      await loadProjectData()
    } catch (error: unknown) {
      const err = error as Error
      alert('Error: ' + err.message)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDeliveryForm(prev => ({ ...prev, files: [...prev.files, ...files] }))
  }

  const removeFile = (index: number) => {
    setDeliveryForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))
  }

  const handleDeliverWork = async () => {
    if (deliveryForm.files.length === 0 || !user || !application || !project) {
      alert('Please select at least one file')
      return
    }

    const nextRound = getNextRound()
    if (nextRound > 3) { alert('Limit of 3 rounds reached.'); return }

    setUploading(true)
    try {
      const fileUrls: string[] = []
      for (const file of deliveryForm.files) {
        const fileName = `${user.id}/deliveries/${application.id}/round${nextRound}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('project-references').upload(fileName, file)
        if (uploadError) throw new Error(`Error uploading ${file.name}: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('project-references').getPublicUrl(fileName)
        fileUrls.push(urlData.publicUrl)
      }

      const { data: result, error: rpcError } = await supabase.rpc('submit_delivery', {
        p_application_id: application.id,
        p_file_urls: fileUrls,
        p_note: deliveryForm.note || ''
      })

      if (rpcError) throw new Error(`Error saving delivery: ${rpcError.message}`)
      if (!result?.success) throw new Error(result?.error || 'Unknown error saving delivery')

      await notifyUser({
        supabase,
        userId: project.architect_id,
        userName: project.architect?.full_name,
        type: 'project_delivered',
        title: 'Project Delivered',
        message: `The artist delivered Round ${result.round} of project "${project.title}"`,
        link: `/dashboard/architect/project/${id}`,
      })

      alert(`Round ${result.round} delivered successfully!`)
      setDeliveryForm({ files: [], note: '' })
      await loadProjectData()
    } catch (error: unknown) {
      const err = error as Error
      alert(`Error sending delivery: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getTimelineSteps = () => {
    const currentRoundDisplay = application?.delivery_files?.length || 0
    if (isArtist) {
      return [
        { label: 'Project Accepted', completed: !!application, date: application?.updated_at },
        { label: 'Payment Confirmed', completed: application?.upfront_payment_status === 'paid', date: application?.upfront_paid_at },
        { label: `Round ${currentRoundDisplay || 1} Delivered`, completed: currentRoundDisplay > 0, date: application?.delivery_submitted_at },
        { label: 'Delivery Approved', completed: application?.delivery_status === 'approved', date: application?.delivery_approved_at },
        { label: 'Project Completed', completed: application?.status === 'completed', date: undefined }
      ]
    }
    return [
      { label: 'Project Created', completed: true, date: project?.created_at },
      { label: 'Artist Accepted', completed: !!application, date: application?.updated_at },
      { label: 'Initial Payment (50%)', completed: application?.upfront_payment_status === 'paid', date: application?.upfront_paid_at },
      { label: `Round ${currentRoundDisplay || 1} Delivered`, completed: currentRoundDisplay > 0, date: application?.delivery_submitted_at },
      { label: 'Delivery Approved', completed: application?.delivery_status === 'approved', date: application?.delivery_approved_at },
      { label: 'Final Payment (50%)', completed: application?.status === 'completed', date: undefined },
      { label: 'Project Completed', completed: application?.status === 'completed', date: undefined }
    ]
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL' }).format(amount)
  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const toggleRound = (index: number) => {
    setExpandedRounds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }

  if (loading) return <div className="loading">Loading project...</div>
  if (!project) return <div className="error-state"><h2>Project not found</h2><button className="btn btn-primary" onClick={() => router.back()}>Back</button></div>

  const timelineSteps = getTimelineSteps()
  const nextRound = getNextRound()

  return (
    <div className="project-overview">
      <div className="overview-header">
        <button className="back-button" onClick={() => router.back()}><ArrowLeft size={20} /> Back</button>
        <div className="header-content">
          <h1>{project.title}</h1>
          <span className={`status-badge status-${project.status}`}>
            {project.status === 'open' ? 'Open' : project.status === 'in_progress' ? 'In Progress' : project.status === 'completed' ? 'Completed' : 'Cancelled'}
          </span>
        </div>
      </div>

      <div className="overview-content">
        <div className="left-column">
          <div className="section timeline-section">
            <h3>Timeline</h3>
            <div className="timeline">
              {timelineSteps.map((step, index) => (
                <div key={index} className={`timeline-item ${step.completed ? 'completed' : ''}`}>
                  <div className="timeline-marker">{step.completed ? <CheckCircle size={20} /> : <Clock size={20} />}</div>
                  <div className="timeline-content">
                    <div className="timeline-label">{step.label}</div>
                    {step.date && <div className="timeline-date">{formatDate(step.date)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section info-section">
            <h3>Project Information</h3>
            <div className="info-grid">
              <div className="info-item"><label>Category:</label><span>{project.category || 'Not specified'}</span></div>
              <div className="info-item"><label>Deadline:</label><span>{formatDate(project.deadline)}</span></div>
              <div className="info-item"><label>Rooms:</label><span>{project.number_of_rooms || '-'}</span></div>
              <div className="info-item"><label>Renders/Room:</label><span>{project.renders_per_room || '-'}</span></div>
            </div>
          </div>

          {application && artist && (
            <div className="section artist-section">
              <h3>3D Artist</h3>
              <div className="person-card">
                <div className="person-info">
                  <div className="person-name">{artist.full_name}</div>
                  <div className="person-location">{artist.location || 'Location not provided'}</div>
                </div>
              </div>
              <div className="info-grid">
                {isArchitect && <div className="info-item"><label>Budget:</label><span className="price">{formatCurrency(application.quoted_price)}</span></div>}
                <div className="info-item"><label>Deadline:</label><span>{application.delivery_timeline || '-'} days</span></div>
                <div className="info-item"><label>Deliveries:</label><span>{application.delivery_files?.length || 0}/3 rounds</span></div>
                <div className="info-item"><label>Status:</label><span className="delivery-status">
                  {application.delivery_status === 'submitted' ? 'Awaiting Review' : application.delivery_status === 'approved' ? 'Approved' : application.delivery_status === 'revision_requested' ? 'Revision Requested' : 'Pending'}
                </span></div>
              </div>
              {isArchitect && application.status === 'accepted' && application.upfront_payment_status !== 'paid' && (
                <div className="payment-alert">
                  <AlertCircle size={20} />
                  <div><strong>Initial Payment Pending</strong><p>Pay 50% for the artist to start.</p></div>
                  <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>Pay 50%</button>
                </div>
              )}
            </div>
          )}

          {project.reference_images && project.reference_images.length > 0 && (
            <div className="section references-section">
              <h3>References</h3>
              <div className="reference-grid">
                {project.reference_images.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="reference-image"><img src={url} alt={`Reference ${index + 1}`} /></a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Upload size={18} /> Deliveries</button>
            {application && <button className={`tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}><MessageSquare size={18} /> Messages</button>}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <>
                {application && application.delivery_files && application.delivery_files.length > 0 ? (
                  <div className="deliveries-section">
                    <h3>Deliveries ({application.delivery_files.length} round{application.delivery_files.length > 1 ? 's' : ''})</h3>
                    {application.delivery_files.map((delivery, index) => {
                      const isExpanded = expandedRounds.has(index)
                      const isLatest = index === application.delivery_files!.length - 1
                      return (
                        <div key={index} className={`delivery-round ${isExpanded ? 'expanded' : 'collapsed'} ${isLatest ? 'latest' : ''}`}>
                          <div className="delivery-header clickable" onClick={() => toggleRound(index)}>
                            <div className="delivery-header-left"><h4>Round {delivery.round}</h4>{isLatest && <span className="latest-badge">Most Recent</span>}</div>
                            <div className="delivery-header-right">
                              <span className="delivery-date">{new Date(delivery.submitted_at).toLocaleString('en-US')}</span>
                              <span className="delivery-count">{delivery.files.length} render{delivery.files.length > 1 ? 's' : ''}</span>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="delivery-content">
                              {delivery.note && <div className="delivery-note"><strong>Artist Note:</strong><p>{delivery.note}</p></div>}
                              <div className="renders-grid">
                                {delivery.files.map((fileUrl, fileIndex) => (
                                  <div key={fileIndex} className="render-image-container"><WatermarkedImage src={fileUrl} alt={`Round ${delivery.round} - ${fileIndex + 1}`} isApproved={application?.delivery_status === 'approved'} /></div>
                                ))}
                              </div>
                              {application.revision_requests?.find(r => r.round === delivery.round) && (
                                <div className="revision-alert"><AlertCircle size={18} /><div><strong>Revision Requested:</strong><p>{application.revision_requests.find(r => r.round === delivery.round)?.message}</p></div></div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {isArchitect && application.delivery_status === 'submitted' && (
                      <div className="delivery-actions">
                        <button className="btn btn-success" onClick={handleApproveDelivery}><CheckCircle size={18} /> Approve and Pay 50%</button>
                        {(application.delivery_files?.length || 0) < 3 && <button className="btn btn-warning" onClick={handleRequestRevision}><AlertCircle size={18} /> Request Revision</button>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state"><Upload size={64} /><h3>No deliveries yet</h3><p>{application ? (isArtist ? 'Use the form below to submit your first delivery.' : 'The artist has not submitted any deliveries yet.') : 'Waiting for accepted artist.'}</p></div>
                )}

                {isArtist && application && application.delivery_status !== 'approved' && nextRound <= 3 && (
                  <div className="artist-delivery-section">
                    <h3>Submit Round {nextRound}</h3>
                    {application.delivery_status === 'revision_requested' && application.revision_requests?.length && (
                      <div className="revision-alert"><AlertCircle size={18} /><div><strong>Revision Requested</strong><p>{application.revision_requests[application.revision_requests.length - 1].message}</p></div></div>
                    )}
                    <div className="delivery-form-card">
                      <div className="round-info-banner"><div className="round-number">Round {nextRound} of 3</div><div className="round-description">{nextRound === 1 && 'First delivery'}{nextRound === 2 && 'First revision'}{nextRound === 3 && 'Final revision'}</div></div>
                      <div className="form-group">
                        <label className="form-label">Files *</label>
                        <div className="file-upload-area">
                          <input type="file" multiple onChange={handleFileSelect} className="file-input" id="delivery-file-upload" accept="image/*,.pdf,.zip" disabled={uploading} />
                          <label htmlFor="delivery-file-upload" className="file-upload-label"><Upload size={32} /><span className="file-upload-text">Click to add</span><span className="file-upload-hint">JPG, PNG, PDF, ZIP</span></label>
                        </div>
                        {deliveryForm.files.length > 0 && <div className="selected-files-list">{deliveryForm.files.map((file, index) => (<div key={index} className="file-item"><span className="file-name">{file.name}</span><button onClick={() => removeFile(index)} className="file-remove-btn" disabled={uploading}>✕</button></div>))}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Note (Optional)</label>
                        <textarea value={deliveryForm.note} onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })} placeholder="Describe what was delivered..." rows={3} className="form-textarea" disabled={uploading} />
                      </div>
                      <button onClick={handleDeliverWork} disabled={uploading || deliveryForm.files.length === 0} className="btn btn-primary btn-full"><Upload size={18} /> {uploading ? 'Submitting...' : `Submit Round ${nextRound}`}</button>
                    </div>
                  </div>
                )}

                {isArtist && application && nextRound > 3 && application.delivery_status !== 'approved' && (
                  <div className="max-rounds-reached"><AlertCircle size={24} /><p>All 3 rounds used. Please wait for approval or use chat.</p></div>
                )}
              </>
            )}

            {activeTab === 'messages' && application && project && (
              <div className="messages-wrapper">
                <Messages conversationId={`project-${project.id}`} otherUserId={isArchitect ? application.artist_id : project.architect_id} projectId={project.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && application && <PaymentModal application={application} onClose={() => setShowPaymentModal(false)} onSuccess={async () => { setShowPaymentModal(false); alert('Payment successful!'); await loadProjectData() }} />}
      {showFinalPaymentModal && application && <FinalPaymentModal application={application} onClose={() => setShowFinalPaymentModal(false)} onSuccess={handlePaymentSuccess} />}
    </div>
  )
}
