'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Send, Upload, CheckCircle, AlertCircle, X, Clock } from 'lucide-react'

const SOFTWARE_OPTIONS = ['SketchUp', 'V-Ray', '3ds Max', 'Corona Renderer', 'Unreal Engine', 'Blender', 'Lumion', 'Twinmotion', 'Enscape', 'Other']
const ARCHITECTURE_STYLES = ['Contemporary', 'Classic', 'Modern', 'Minimalist', 'Industrial', 'Rustic', 'Eclectic', 'Art Deco']
const PROJECT_TYPES = ['Facade', 'Interiors', 'Landscaping', 'Urban', 'Commercial', 'Residential', 'Industrial']

interface FormData {
  portfolio_urls: string[]
  portfolio_files: string[]
  software: string[]
  other_software: string
  years_experience: number
  architecture_style: string[]
  favorite_project_types: string[]
}

interface ExistingApplication {
  id: string
  status: string
  portfolio_urls?: string[]
  portfolio_files?: string[]
  software?: string[]
  other_software?: string
  years_experience?: number
  architecture_style?: string[]
  favorite_project_types?: string[]
  rejection_reason?: string
}

export default function ArtistApplicationForm() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    portfolio_urls: ['', '', ''],
    portfolio_files: [],
    software: [],
    other_software: '',
    years_experience: 0,
    architecture_style: [],
    favorite_project_types: []
  })

  useEffect(() => {
    if (!user) return
    const checkExistingApplication = async () => {
      try {
        const { data, error: fetchError } = await supabase.from('artist_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        if (fetchError) throw fetchError

        if (data && data.length > 0) {
          setExistingApplication(data[0])
          if (data[0].status === 'pending') {
            setSubmitted(true)
          } else if (data[0].status === 'approved') {
            router.push('/dashboard')
          } else if (data[0].status === 'rejected') {
            setFormData({
              portfolio_urls: data[0].portfolio_urls || ['', '', ''],
              portfolio_files: data[0].portfolio_files || [],
              software: data[0].software || [],
              other_software: data[0].other_software || '',
              years_experience: data[0].years_experience || 0,
              architecture_style: data[0].architecture_style || [],
              favorite_project_types: data[0].favorite_project_types || []
            })
          }
        }
      } catch (err) { console.error('Error checking existing application:', err) }
      finally { setLoading(false) }
    }
    checkExistingApplication()
  }, [user, router, supabase])

  const toggleArrayItem = (array: string[], item: string) => array.includes(item) ? array.filter(i => i !== item) : [...array, item]

  const handlePortfolioUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.portfolio_urls]
    newUrls[index] = value
    setFormData({ ...formData, portfolio_urls: newUrls })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.portfolio_files.length > 10) { setError('Maximum of 10 portfolio files'); return }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) { setError(`${file.name} is not a valid image`); return false }
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} exceeds 10MB`); return false }
      return true
    })

    setUploadingFiles(true); setError('')
    try {
      const uploadedUrls: string[] = []
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `applications/${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('portfolio-submissions').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('portfolio-submissions').getPublicUrl(fileName)
        uploadedUrls.push(urlData.publicUrl)
      }
      setFormData({ ...formData, portfolio_files: [...formData.portfolio_files, ...uploadedUrls] })
    } catch (err) { console.error('Error uploading files:', err); setError('Error uploading files. Please try again.') }
    finally { setUploadingFiles(false) }
  }

  const removePortfolioFile = (index: number) => {
    const newFiles = formData.portfolio_files.filter((_, i) => i !== index)
    setFormData({ ...formData, portfolio_files: newFiles })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')

    if (formData.software.length === 0) { setError('Please select at least one software'); setSubmitting(false); return }
    if (formData.architecture_style.length === 0) { setError('Please select at least one architecture style'); setSubmitting(false); return }
    if (formData.favorite_project_types.length === 0) { setError('Please select at least one favorite project type'); setSubmitting(false); return }

    const hasPortfolioUrls = formData.portfolio_urls.some(url => url.trim() !== '')
    const hasPortfolioFiles = formData.portfolio_files.length > 0
    if (!hasPortfolioUrls && !hasPortfolioFiles) { setError('Please provide at least one portfolio link or upload images'); setSubmitting(false); return }

    try {
      const cleanedUrls = formData.portfolio_urls.filter(url => url.trim() !== '')
      const { error: submitError } = await supabase.from('artist_submissions').insert({
        user_id: user?.id,
        email: profile?.email || user?.email,
        full_name: profile?.full_name,
        portfolio_urls: cleanedUrls,
        portfolio_files: formData.portfolio_files,
        software: formData.software,
        other_software: formData.other_software,
        years_experience: formData.years_experience,
        architecture_style: formData.architecture_style,
        favorite_project_types: formData.favorite_project_types,
        status: 'pending'
      })

      if (submitError) throw submitError
      setSubmitted(true)
    } catch (err) { console.error('Error submitting application:', err); setError('Error submitting application. Please try again.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="loading">Loading...</div>

  if (submitted) {
    return (
      <div className="artist-application-container">
        <div className="application-success">
          <CheckCircle size={64} className="success-icon" />
          <h2>Application Submitted!</h2>
          <p>Thank you for submitting your artist application.</p>
          <p>Our team will review your portfolio and update your account within 5 business days.</p>
          <div className="success-details">
            <h3>Next Steps:</h3>
            <ol>
              <li>We review your portfolio and qualifications</li>
              <li>We evaluate the quality of work presented</li>
              <li>Your profile will be updated with approval status</li>
              <li>You&apos;ll gain access to browse and apply for projects</li>
            </ol>
          </div>
          <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="artist-application-container">
      <div className="application-header">
        <h1>Artist Profile Application</h1>
        <p className="application-subtitle">Complete your artist profile to start applying for projects.</p>
      </div>

      {existingApplication?.status === 'rejected' && (
        <div className="application-warning">
          <AlertCircle size={24} />
          <div>
            <strong>Previous Application Rejected</strong>
            <p>{existingApplication.rejection_reason || 'Your previous application was not approved. Please update your portfolio and try again.'}</p>
          </div>
        </div>
      )}

      {error && <div className="application-error"><AlertCircle size={20} /><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-section">
          <h3 className="form-section-title">Your Portfolio</h3>
          <p className="form-hint" style={{ marginBottom: '1rem' }}>Provide links to your online portfolio (Behance, ArtStation, etc.) or upload images</p>

          <div className="form-group">
            <label className="form-label">Portfolio Links</label>
            {formData.portfolio_urls.map((url, index) => (
              <input key={index} type="url" value={url} onChange={(e) => handlePortfolioUrlChange(index, e.target.value)} placeholder={`Link ${index + 1} (optional)`} className="form-input" style={{ marginBottom: '0.5rem' }} />
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Portfolio Image Upload</label>
            <div className="file-upload-area">
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploadingFiles} style={{ display: 'none' }} id="portfolio-upload" />
              <label htmlFor="portfolio-upload" className="file-upload-btn"><Upload size={20} />{uploadingFiles ? 'Uploading...' : 'Select Images'}</label>
              <p className="form-hint">Maximum of 10 images, 10MB each</p>
            </div>
            {formData.portfolio_files.length > 0 && (
              <div className="uploaded-files-grid">
                {formData.portfolio_files.map((file, index) => (
                  <div key={index} className="uploaded-file-item">
                    <img src={file} alt={`Portfolio ${index + 1}`} />
                    <button type="button" onClick={() => removePortfolioFile(index)} className="remove-file-btn"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Professional Details</h3>

          <div className="form-group">
            <label className="form-label">Years of 3D Experience *</label>
            <input type="number" min="0" max="50" value={formData.years_experience} onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })} required className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Software I Use *</label>
            <div className="checkbox-grid">
              {SOFTWARE_OPTIONS.map((software) => (
                <label key={software} className="checkbox-label">
                  <input type="checkbox" checked={formData.software.includes(software)} onChange={() => setFormData({ ...formData, software: toggleArrayItem(formData.software, software) })} className="checkbox-input" />
                  <span>{software}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.software.includes('Other') && (
            <div className="form-group">
              <label className="form-label">What other software?</label>
              <input type="text" value={formData.other_software} onChange={(e) => setFormData({ ...formData, other_software: e.target.value })} placeholder="Ex: Maya, Cinema 4D, etc." className="form-input" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Architecture Styles *</label>
            <div className="checkbox-grid">
              {ARCHITECTURE_STYLES.map((style) => (
                <label key={style} className="checkbox-label">
                  <input type="checkbox" checked={formData.architecture_style.includes(style)} onChange={() => setFormData({ ...formData, architecture_style: toggleArrayItem(formData.architecture_style, style) })} className="checkbox-input" />
                  <span>{style}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Favorite Project Types *</label>
            <div className="checkbox-grid">
              {PROJECT_TYPES.map((type) => (
                <label key={type} className="checkbox-label">
                  <input type="checkbox" checked={formData.favorite_project_types.includes(type)} onChange={() => setFormData({ ...formData, favorite_project_types: toggleArrayItem(formData.favorite_project_types, type) })} className="checkbox-input" />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting || uploadingFiles} className="btn-primary btn-large">
            {submitting ? <><Clock size={20} /> Submitting...</> : <><Send size={20} /> Submit Application</>}
          </button>
        </div>
      </form>
    </div>
  )
}
