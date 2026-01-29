'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Upload, CheckCircle, AlertCircle, Award } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

const SOFTWARE_OPTIONS = [
  'SketchUp',
  'V-Ray',
  '3ds Max',
  'Corona Renderer',
  'Unreal Engine',
  'Blender',
  'Lumion',
  'Twinmotion',
  'Enscape',
  'Other'
]

const ARCHITECTURE_STYLES = [
  'Contemporary',
  'Classic',
  'Modern',
  'Minimalist',
  'Industrial',
  'Rustic',
  'Eclectic',
  'Art Deco'
]

const PROJECT_TYPES = [
  'Facade',
  'Interiors',
  'Landscaping',
  'Urban',
  'Commercial',
  'Residential',
  'Industrial'
]

interface FormData {
  email: string
  full_name: string
  phone: string
  portfolio_urls: string[]
  portfolio_files: string[]
  software: string[]
  other_software: string
  years_experience: number
  architecture_style: string[]
  favorite_project_types: string[]
  additional_notes: string
}

export default function ArtistApplication() {
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    phone: '',
    portfolio_urls: ['', '', ''],
    portfolio_files: [],
    software: [],
    other_software: '',
    years_experience: 0,
    architecture_style: [],
    favorite_project_types: [],
    additional_notes: ''
  })

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  const handlePortfolioUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.portfolio_urls]
    newUrls[index] = value
    setFormData({ ...formData, portfolio_urls: newUrls })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length + formData.portfolio_files.length > 10) {
      setError('Maximum of 10 portfolio files')
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds 10MB`)
        return false
      }
      return true
    })

    setUploadingFiles(true)
    setError('')

    try {
      const uploadedUrls: string[] = []

      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `applications/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('portfolio-submissions')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('portfolio-submissions')
          .getPublicUrl(fileName)

        uploadedUrls.push(urlData.publicUrl)
      }

      setFormData({
        ...formData,
        portfolio_files: [...formData.portfolio_files, ...uploadedUrls]
      })
    } catch (err) {
      console.error('Error uploading files:', err)
      setError('Error uploading files. Please try again.')
    } finally {
      setUploadingFiles(false)
    }
  }

  const removePortfolioFile = (index: number) => {
    const newFiles = formData.portfolio_files.filter((_, i) => i !== index)
    setFormData({ ...formData, portfolio_files: newFiles })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!formData.email || !formData.full_name || !formData.phone) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    if (formData.software.length === 0) {
      setError('Please select at least one software')
      setSubmitting(false)
      return
    }

    if (formData.architecture_style.length === 0) {
      setError('Please select at least one architecture style')
      setSubmitting(false)
      return
    }

    if (formData.favorite_project_types.length === 0) {
      setError('Please select at least one favorite project type')
      setSubmitting(false)
      return
    }

    const hasPortfolioUrls = formData.portfolio_urls.some(url => url.trim() !== '')
    const hasPortfolioFiles = formData.portfolio_files.length > 0

    if (!hasPortfolioUrls && !hasPortfolioFiles) {
      setError('Please provide at least one portfolio link or upload images')
      setSubmitting(false)
      return
    }

    try {
      const cleanedUrls = formData.portfolio_urls.filter(url => url.trim() !== '')

      const { error: submitError } = await supabase
        .from('artist_submissions')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          portfolio_urls: cleanedUrls,
          portfolio_files: formData.portfolio_files,
          software: formData.software,
          other_software: formData.other_software,
          years_experience: formData.years_experience,
          architecture_style: formData.architecture_style,
          favorite_project_types: formData.favorite_project_types,
          additional_notes: formData.additional_notes
        })

      if (submitError) throw submitError

      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting application:', err)
      setError('Error submitting application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="artist-application-container">
          <div className="application-success">
            <CheckCircle size={64} className="success-icon" />
            <h2>Application Submitted Successfully!</h2>
            <p>
              Thank you for applying to be a 3D artist on the 3dMatch platform.
            </p>
            <p>
              Our team will review your portfolio and contact you within 5 business days
              via the email provided.
            </p>
            <div className="success-details">
              <h3>Next Steps:</h3>
              <ol>
                <li>Review your portfolio and qualifications</li>
                <li>Evaluate the quality of work presented</li>
                <li>Send email response with the result</li>
                <li>If approved, you will receive a link to create your account</li>
              </ol>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="artist-application-container">
        <div className="application-header">
          <Award size={48} className="header-icon" />
          <h1>3D Artist Application</h1>
          <p className="application-subtitle">
            Join our platform of high-quality 3D artists. Showcase your portfolio
            and start working with architects and construction professionals.
          </p>
        </div>

        {error && (
          <div className="application-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="application-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3 className="form-section-title">Personal Information</h3>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="form-input"
              />
              <p className="form-hint">We will use this email to contact you</p>
            </div>

            <div className="form-group">
              <label className="form-label">Phone/WhatsApp *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
                className="form-input"
              />
              <p className="form-hint">We prefer WhatsApp for quick contact</p>
            </div>
          </div>

          {/* Portfolio */}
          <div className="form-section">
            <h3 className="form-section-title">Your Portfolio</h3>
            <p className="form-hint" style={{ marginBottom: '1rem' }}>
              Provide links to your online portfolio (Behance, ArtStation, etc.) or upload images
            </p>

            <div className="form-group">
              <label className="form-label">Portfolio Links</label>
              {formData.portfolio_urls.map((url, index) => (
                <input
                  key={index}
                  type="url"
                  value={url}
                  onChange={(e) => handlePortfolioUrlChange(index, e.target.value)}
                  placeholder={`Link ${index + 1} (optional)`}
                  className="form-input"
                  style={{ marginBottom: '0.5rem' }}
                />
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio Image Upload</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadingFiles}
                  style={{ display: 'none' }}
                  id="portfolio-upload"
                />
                <label htmlFor="portfolio-upload" className="file-upload-btn">
                  <Upload size={20} />
                  {uploadingFiles ? 'Uploading...' : 'Select Images'}
                </label>
                <p className="form-hint">Maximum of 10 images, 10MB each</p>
              </div>

              {formData.portfolio_files.length > 0 && (
                <div className="uploaded-files-grid">
                  {formData.portfolio_files.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <img src={file} alt={`Portfolio ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removePortfolioFile(index)}
                        className="remove-file-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professional Details */}
          <div className="form-section">
            <h3 className="form-section-title">Professional Details</h3>

            <div className="form-group">
              <label className="form-label">Years of 3D Experience *</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Software I Use *</label>
              <div className="checkbox-grid">
                {SOFTWARE_OPTIONS.map((software) => (
                  <label key={software} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.software.includes(software)}
                      onChange={() => setFormData({
                        ...formData,
                        software: toggleArrayItem(formData.software, software)
                      })}
                      className="checkbox-input"
                    />
                    <span>{software}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.software.includes('Other') && (
              <div className="form-group">
                <label className="form-label">What other software?</label>
                <input
                  type="text"
                  value={formData.other_software}
                  onChange={(e) => setFormData({ ...formData, other_software: e.target.value })}
                  placeholder="Ex: Maya, Cinema 4D, etc."
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Architecture Styles *</label>
              <div className="checkbox-grid">
                {ARCHITECTURE_STYLES.map((style) => (
                  <label key={style} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.architecture_style.includes(style)}
                      onChange={() => setFormData({
                        ...formData,
                        architecture_style: toggleArrayItem(formData.architecture_style, style)
                      })}
                      className="checkbox-input"
                    />
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
                    <input
                      type="checkbox"
                      checked={formData.favorite_project_types.includes(type)}
                      onChange={() => setFormData({
                        ...formData,
                        favorite_project_types: toggleArrayItem(formData.favorite_project_types, type)
                      })}
                      className="checkbox-input"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Information (Optional)</label>
              <textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Tell us more about your experience, special projects, certifications, etc."
                className="form-textarea"
                rows={5}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting || uploadingFiles}
              className="btn-primary btn-large"
            >
              <Send size={20} />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  )
}
