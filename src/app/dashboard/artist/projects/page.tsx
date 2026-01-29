'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

interface ProjectItem {
  id: string
  applicationId: string
  type: string
  title: string
  description: string
  deadline: string
  status: string
  architect: { id: string; full_name: string }
  quoted_price: number
  delivery_timeline: number
  delivery_status: string
  current_round: number
  revision_requests: Array<{ message: string; requested_at: string }>
  created_at: string
}

export default function ActiveProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [deliveryForm, setDeliveryForm] = useState<{ files: File[]; note: string; round: number }>({
    files: [],
    note: '',
    round: 1,
  })

  const loadProjects = useCallback(async () => {
    try {
      if (!user?.id) {
        setMessage('Error: User not authenticated')
        setLoading(false)
        return
      }

      const { data: allApps, error: appsError } = await supabase
        .from('applications')
        .select(`
          id, artist_id, project_id, quoted_price, delivery_timeline,
          delivery_status, delivery_files, delivery_notes, delivery_submitted_at,
          current_round, revision_requests, status, created_at,
          projects (
            id, title, description, deadline, architect_id,
            profiles!projects_architect_id_fkey ( id, full_name )
          )
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      const acceptedApps = allApps?.filter((app: any) =>
        ['accepted', 'accepted_paid', 'in_progress'].includes(app.status) &&
        app.status !== 'completed'
      ) || []

      const allProjects: ProjectItem[] = acceptedApps.map((app: any) => ({
        id: app.projects.id,
        applicationId: app.id,
        type: 'application',
        title: app.projects.title,
        description: app.projects.description,
        deadline: app.projects.deadline,
        status: app.delivery_status || 'in_progress',
        architect: Array.isArray(app.projects.profiles) ? app.projects.profiles[0] : app.projects.profiles,
        quoted_price: app.quoted_price,
        delivery_timeline: app.delivery_timeline,
        delivery_status: app.delivery_status,
        current_round: app.current_round || 1,
        revision_requests: app.revision_requests || [],
        created_at: app.created_at,
      }))

      setProjects(allProjects)
    } catch (error: any) {
      console.error('Error loading projects:', error)
      setMessage('Error loading projects: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id) {
      loadProjects()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDeliveryForm(prev => ({ ...prev, files: [...prev.files, ...files] }))
  }

  const removeFile = (index: number) => {
    setDeliveryForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const handleDeliverWork = async () => {
    if (!selectedProject || !user?.id) return
    if (deliveryForm.files.length === 0) {
      setMessage('Please select at least one file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const fileUrls: string[] = []

      for (const file of deliveryForm.files) {
        const fileName = `${user.id}/deliveries/${selectedProject.applicationId}/round${deliveryForm.round}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('project-references')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('project-references')
          .getPublicUrl(fileName)

        fileUrls.push(urlData.publicUrl)
      }

      const { data: currentApp } = await supabase
        .from('applications')
        .select('delivery_files, revision_requests')
        .eq('id', selectedProject.applicationId)
        .single()

      const deliveryData = {
        round: deliveryForm.round,
        files: fileUrls,
        note: deliveryForm.note,
        submitted_at: new Date().toISOString(),
      }

      const allDeliveryFiles = currentApp?.delivery_files || []
      ;(allDeliveryFiles as any[]).push(deliveryData)

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          delivery_files: allDeliveryFiles,
          delivery_status: 'submitted',
          delivery_submitted_at: new Date().toISOString(),
          delivery_notes: deliveryForm.note,
          current_round: deliveryForm.round,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedProject.applicationId)

      if (updateError) throw updateError

      await supabase.from('notifications').insert({
        user_id: selectedProject.architect.id,
        type: 'project_delivered',
        title: 'Project Delivered',
        message: `The artist delivered Round ${deliveryForm.round} of project "${selectedProject.title}"`,
        link: `/dashboard/architect/project/${selectedProject.id}`,
        is_read: false,
        created_at: new Date().toISOString(),
      })

      setMessage(`Round ${deliveryForm.round} delivered successfully! Awaiting client approval.`)
      setDeliveryForm({ files: [], note: '', round: 1 })
      setSelectedProject(null)
      await loadProjects()
    } catch (error: any) {
      console.error('Error delivering work:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string): string => {
    const badges: Record<string, string> = {
      pending: 'Awaiting Start',
      in_progress: 'In Progress',
      submitted: 'Awaiting Approval',
      revision_requested: 'Revision Requested',
      approved: 'Approved',
      completed: 'Completed',
    }
    return badges[status] || status
  }

  const getRoundInfo = (project: ProjectItem) => {
    const currentRound = project.current_round || 1
    const hasRevisionRequest = project.revision_requests?.length > 0

    if (hasRevisionRequest) {
      const lastRequest = project.revision_requests[project.revision_requests.length - 1]
      return {
        round: currentRound,
        status: 'revision_requested',
        message: lastRequest.message,
        requestedAt: lastRequest.requested_at,
      }
    }

    return { round: currentRound, status: project.delivery_status, message: null, requestedAt: null }
  }

  if (loading) {
    return <div className="loading">Loading projects...</div>
  }

  if (selectedProject) {
    const roundInfo = getRoundInfo(selectedProject)

    return (
      <div className="artist-projects-container">
        <button onClick={() => setSelectedProject(null)} className="btn-back">
          &larr; Back to Projects
        </button>

        <div className="delivery-form-container">
          <h2 className="section-title">{selectedProject.title}</h2>

          {message && (
            <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>
              {message}
            </div>
          )}

          {roundInfo.status === 'revision_requested' && (
            <div className="revision-request-alert">
              <h3>Revision Requested - Round {roundInfo.round}</h3>
              <p><strong>Client Feedback:</strong></p>
              <p>{roundInfo.message}</p>
              {roundInfo.requestedAt && (
                <p className="text-sm" style={{ color: '#6c757d' }}>
                  Requested on: {new Date(roundInfo.requestedAt).toLocaleString('en-US')}
                </p>
              )}
            </div>
          )}

          <div className="project-info-grid">
            <div className="info-item">
              <span className="info-label">Client:</span>
              <span className="info-value">{selectedProject.architect.full_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Amount:</span>
              <span className="info-value">R$ {selectedProject.quoted_price?.toFixed(2)}</span>
            </div>
            {selectedProject.deadline && (
              <div className="info-item">
                <span className="info-label">Deadline:</span>
                <span className="info-value">
                  {new Date(selectedProject.deadline).toLocaleDateString('en-US')}
                </span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Current Round:</span>
              <span className="info-value">{roundInfo.round} of 3</span>
            </div>
          </div>

          <div className="delivery-form">
            <h3 className="form-title">Deliver Work</h3>

            <div className="form-group">
              <label className="form-label">Delivery Round</label>
              <select
                value={deliveryForm.round}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, round: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={1}>Round 1 - First Delivery</option>
                <option value={2}>Round 2 - First Revision</option>
                <option value={3}>Round 3 - Final Revision</option>
              </select>
              <p className="form-hint">
                The client is entitled to 3 rounds of revision to ensure their complete satisfaction.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Files *</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-upload"
                  accept="image/*,.pdf,.zip"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <span className="file-upload-icon">Click to add files</span>
                  <span className="file-upload-hint">Final renders in high resolution</span>
                </label>
              </div>
              {deliveryForm.files.length > 0 && (
                <div className="selected-files-list">
                  {deliveryForm.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="file-remove-btn">
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Note to Client (Optional)</label>
              <textarea
                value={deliveryForm.note}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })}
                placeholder="Describe what was delivered, changes made, etc..."
                rows={4}
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={handleDeliverWork}
                disabled={uploading || deliveryForm.files.length === 0}
                className="btn-primary"
              >
                {uploading ? 'Uploading...' : `Deliver Round ${deliveryForm.round}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="artist-projects-container">
      <h2 className="section-title">My Projects</h2>
      <p className="subtitle">Ongoing and completed projects</p>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No active projects</p>
          <p className="empty-state-text">
            When you are selected for a project, it will appear here
          </p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => {
            const roundInfo = getRoundInfo(project)

            return (
              <div key={`${project.type}-${project.id}`} className="project-card-artist">
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.title}</h3>
                  <div className="badges-container">
                    <span className={`badge badge-${project.status}`}>
                      {getStatusBadge(project.status)}
                    </span>
                    <span className="badge badge-round">
                      Round {roundInfo.round}/3
                    </span>
                  </div>
                </div>

                <div className="project-card-body">
                  <p className="project-card-description">{project.description}</p>

                  {roundInfo.status === 'revision_requested' && (
                    <div className="revision-alert-small">
                      <strong>Revision requested:</strong>
                      <p>{roundInfo.message}</p>
                    </div>
                  )}

                  <div className="project-card-info">
                    <div className="info-item">
                      <span className="info-label">Client:</span>
                      <span className="info-value">{project.architect.full_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Amount:</span>
                      <span className="info-value">R$ {project.quoted_price?.toFixed(2)}</span>
                    </div>
                    {project.deadline && (
                      <div className="info-item">
                        <span className="info-label">Deadline:</span>
                        <span className="info-value">
                          {new Date(project.deadline).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="project-card-actions">
                  <button
                    onClick={() => router.push(`/dashboard/artist/project/${project.id}`)}
                    className="btn-secondary"
                  >
                    View Details
                  </button>
                  {project.status !== 'completed' && project.status !== 'approved' && (
                    <button onClick={() => setSelectedProject(project)} className="btn-primary">
                      {roundInfo.status === 'revision_requested'
                        ? `Submit Revision (Round ${roundInfo.round})`
                        : 'Deliver Work'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
