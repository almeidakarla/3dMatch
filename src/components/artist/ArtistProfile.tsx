'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { validateArtistProfile } from '@/utils/contentFilter'
import { Trash2 } from 'lucide-react'

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

interface PortfolioItem {
  id: string
  artist_id: string
  title: string
  description: string
  technologies: string[]
  image_url: string
  created_at: string
}

interface ProfileData {
  full_name: string
  profile_photo: string
  software: string[]
  other_software: string
  years_experience: number
}

export default function ArtistProfile() {
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    profile_photo: '',
    software: [],
    other_software: '',
    years_experience: 0
  })

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    technologies: '',
    file: null as File | null,
    preview: null as string | null
  })
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          profile_photo: data.profile_photo || '',
          software: data.software || [],
          other_software: data.other_software || '',
          years_experience: data.years_experience || 0
        })
      }

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio')
        .select('*')
        .eq('artist_id', user!.id)
        .order('created_at', { ascending: false })

      if (portfolioError) throw portfolioError
      setPortfolio(portfolioData || [])
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be at most 5MB')
      return
    }

    setUploadingPhoto(true)
    setMessage('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}/profile-photo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo: urlData.publicUrl })
        .eq('id', user!.id)

      if (updateError) throw updateError

      setProfile(prev => ({ ...prev, profile_photo: urlData.publicUrl }))
      setMessage('Photo updated successfully!')
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error uploading photo:', error)
      setMessage(`Error uploading: ${err.message}`)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('Image must be at most 10MB')
      return
    }

    const preview = URL.createObjectURL(file)
    setPortfolioForm(prev => ({ ...prev, file, preview }))
  }

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!portfolioForm.file) {
      setMessage('Please select an image')
      return
    }

    setUploadingPortfolio(true)
    setMessage('')

    try {
      const fileExt = portfolioForm.file.name.split('.').pop()
      const fileName = `${user!.id}/portfolio/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, portfolioForm.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName)

      const technologiesArray = portfolioForm.technologies
        ? portfolioForm.technologies.split(',').map(t => t.trim()).filter(t => t)
        : []

      const { error } = await supabase
        .from('portfolio')
        .insert({
          artist_id: user!.id,
          title: portfolioForm.title,
          description: portfolioForm.description,
          technologies: technologiesArray,
          image_url: urlData.publicUrl
        })

      if (error) throw error

      setMessage('Image added to portfolio!')
      setPortfolioForm({ title: '', description: '', technologies: '', file: null, preview: null })
      setShowAddForm(false)
      await loadProfile()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error saving portfolio item:', error)
      setMessage(`Error: ${err.message}`)
    } finally {
      setUploadingPortfolio(false)
    }
  }

  const handlePortfolioDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      const { data: portfolioItem, error: fetchError } = await supabase
        .from('portfolio')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error

      if (portfolioItem?.image_url) {
        try {
          const url = new URL(portfolioItem.image_url)
          const pathParts = url.pathname.split('/portfolio-images/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await supabase.storage
              .from('portfolio-images')
              .remove([filePath])
          }
        } catch (storageErr) {
          console.error('Error processing storage deletion:', storageErr)
        }
      }

      setMessage('Image removed from portfolio')
      await loadProfile()
      setTimeout(() => setMessage(''), 3000)
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error deleting portfolio item:', error)
      setMessage(`Error: ${err.message}`)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setValidationErrors({})

    const validation = validateArtistProfile(profile)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setMessage('Please fix the errors before saving')
      setSaving(false)
      return
    }

    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('approval_status, software')
        .eq('id', user!.id)
        .single()

      const isFirstTimeCompletion = !currentProfile?.software || currentProfile.software.length === 0

      const updateData: Record<string, unknown> = {
        full_name: profile.full_name,
        software: profile.software,
        other_software: profile.other_software,
        years_experience: profile.years_experience
      }

      if (isFirstTimeCompletion) {
        updateData.approval_status = 'pending'
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user!.id)

      if (error) throw error

      if (isFirstTimeCompletion) {
        setMessage('Profile submitted for review! Our team will review within 2 business days.')
      } else {
        setMessage('Profile saved successfully!')
      }

      setTimeout(() => setMessage(''), 5000)
      await loadProfile()
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error saving profile:', error)
      setMessage(`Error saving: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="artist-profile-editor">
      <h2 className="section-title">My Professional Profile</h2>
      <p className="subtitle">Configure your information and specialties</p>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('fix') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-editor-grid">
        {/* Left Column - Photo */}
        <div className="profile-photo-section">
          <div className="profile-photo-container" style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid #667eea' }}>
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt="Profile"
                className="profile-photo-preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="profile-photo-placeholder" style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '80px', height: '80px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <label className="btn-secondary upload-photo-btn" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', cursor: 'pointer' }}>
            {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              style={{ display: 'none' }}
            />
          </label>
          <p className="photo-hint" style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>JPG, PNG or GIF (max 5MB)</p>
        </div>

        {/* Right Column - Form */}
        <div className="profile-form-section">
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                  required
                  className={`form-input ${validationErrors.full_name ? 'error' : ''}`}
                />
                {validationErrors.full_name && (
                  <p className="form-error">{validationErrors.full_name}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Years of 3D Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={profile.years_experience}
                  onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 5"
                  required
                  className="form-input"
                />
                <p className="form-hint">How many years have you worked with 3D rendering?</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Software I Use *</label>
              <div className="checkbox-grid">
                {SOFTWARE_OPTIONS.map((software) => (
                  <label key={software} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.software.includes(software)}
                      onChange={() => setProfile({
                        ...profile,
                        software: toggleArrayItem(profile.software, software)
                      })}
                      className="checkbox-input"
                    />
                    <span>{software}</span>
                  </label>
                ))}
              </div>
              <p className="form-hint">Select all that apply</p>
            </div>

            {profile.software.includes('Other') && (
              <div className="form-group">
                <label className="form-label">What other software?</label>
                <input
                  type="text"
                  value={profile.other_software}
                  onChange={(e) => setProfile({ ...profile, other_software: e.target.value })}
                  placeholder="Ex: Maya, Cinema 4D, etc."
                  className={`form-input ${validationErrors.other_software ? 'error' : ''}`}
                />
                {validationErrors.other_software && (
                  <p className="form-error">{validationErrors.other_software}</p>
                )}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="portfolio-section">
        <div className="portfolio-header">
          <h2 className="section-title">My Portfolio</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              + Add New Image
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="portfolio-add-form">
            <h3>Add New Image</h3>
            <form onSubmit={handlePortfolioSubmit}>
              <div className="form-group">
                <label className="form-label">Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePortfolioFileSelect}
                  required
                  className="form-input"
                />
                {portfolioForm.preview && (
                  <img src={portfolioForm.preview} alt="Preview" className="portfolio-preview" />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="Project name or title"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  rows={3}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies Used</label>
                <input
                  type="text"
                  value={portfolioForm.technologies}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, technologies: e.target.value })}
                  placeholder="e.g., Blender, 3ds Max, V-Ray (comma separated)"
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={uploadingPortfolio}
                  className="btn-primary"
                >
                  {uploadingPortfolio ? 'Uploading...' : 'Add to Portfolio'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setPortfolioForm({ title: '', description: '', technologies: '', file: null, preview: null })
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {portfolio.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No portfolio images yet</p>
            <p className="empty-state-text">Add images to showcase your work to potential clients</p>
          </div>
        ) : (
          <div className="portfolio-grid">
            {portfolio.map((item) => (
              <div key={item.id} className="portfolio-item">
                <div
                  className="portfolio-image-wrapper"
                  onClick={() => {
                    setSelectedPortfolioItem(item)
                    setShowPortfolioModal(true)
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="portfolio-image"
                  />
                  <div className="portfolio-overlay">
                    <div className="portfolio-overlay-content">
                      <h4 className="portfolio-overlay-title">{item.title}</h4>
                      <button
                        className="btn-delete-overlay"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePortfolioDelete(item.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Detail Modal */}
        {showPortfolioModal && selectedPortfolioItem && (
          <div className="portfolio-modal-overlay" onClick={() => setShowPortfolioModal(false)}>
            <div className="portfolio-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="portfolio-modal-close"
                onClick={() => setShowPortfolioModal(false)}
              >
                &times;
              </button>
              <div className="portfolio-modal-image">
                <img
                  src={selectedPortfolioItem.image_url}
                  alt={selectedPortfolioItem.title}
                />
              </div>
              <div className="portfolio-modal-details">
                <div className="portfolio-modal-header">
                  <h2 className="portfolio-modal-title">{selectedPortfolioItem.title}</h2>
                  <button
                    onClick={() => {
                      setShowPortfolioModal(false)
                      handlePortfolioDelete(selectedPortfolioItem.id)
                    }}
                    className="portfolio-modal-delete"
                    title="Delete image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {selectedPortfolioItem.technologies && selectedPortfolioItem.technologies.length > 0 && (
                  <div className="portfolio-modal-section">
                    <h3>Technologies Used</h3>
                    <div className="portfolio-modal-technologies">
                      {selectedPortfolioItem.technologies.map((tech, index) => (
                        <span key={index} className="technology-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPortfolioItem.description && (
                  <div className="portfolio-modal-section">
                    <h3>Description</h3>
                    <p>{selectedPortfolioItem.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
