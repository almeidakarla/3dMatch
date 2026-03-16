'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Upload, X } from 'lucide-react'

const categories = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'interior', label: 'Interior Design' },
  { value: 'exterior', label: 'Facade/Exterior' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'urban', label: 'Urban Planning' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Other' },
]

export default function PostAProjectPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [message, setMessage] = useState('')
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'residential',
    number_of_rooms: '',
    renders_per_room: 3,
    budget: '',
    currency: 'USD',
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setMessage('Only images are allowed')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Images must be no larger than 10MB')
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setReferenceFiles([...referenceFiles, ...validFiles])
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setReferenceFiles(referenceFiles.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (referenceFiles.length === 0 || !user?.id) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of referenceFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/projects/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('project-references')
          .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('project-references')
          .getPublicUrl(fileName)

        uploadedUrls.push(urlData.publicUrl)
      }
      return uploadedUrls
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      setMessage('Error: user not identified. Please log in again.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const imageUrls = await uploadImages()

      const { error } = await supabase
        .from('projects')
        .insert({
          architect_id: user.id,
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          category: formData.category,
          number_of_rooms: formData.number_of_rooms ? parseInt(formData.number_of_rooms) : null,
          renders_per_room: formData.renders_per_room,
          reference_images: imageUrls,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          currency: formData.currency,
          status: 'open',
        })
        .select()
        .single()

      if (error) throw error

      setMessage('Project published successfully!')
      setFormData({
        title: '',
        description: '',
        deadline: '',
        category: 'residential',
        number_of_rooms: '',
        renders_per_room: 3,
        budget: '',
        currency: 'USD',
      })
      setReferenceFiles([])
      setPreviewUrls([])
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      console.error('Error posting project:', error)
      setMessage(`Error publishing project: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="post-project-container">
      <h2 className="section-title">Post New Project</h2>
      <p className="subtitle">Create a project and receive proposals from talented 3D artists</p>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="project-form project-form-grid">
        <div className="form-column">
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Modern House Rendering"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project, desired style, number of renders, specific angles, etc..."
              rows={6}
              required
              className="form-textarea"
            />
            <p className="form-hint">The more details, the better proposals you&apos;ll receive!</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Rooms</label>
              <input
                type="number"
                value={formData.number_of_rooms}
                onChange={(e) => setFormData({ ...formData, number_of_rooms: e.target.value })}
                placeholder="Ex: 5"
                min="1"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Renders per Room</label>
              <select
                value={formData.renders_per_room}
                onChange={(e) => setFormData({ ...formData, renders_per_room: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={1}>1 render</option>
                <option value={2}>2 renders</option>
                <option value={3}>3 renders</option>
                <option value={4}>4 renders</option>
                <option value={5}>5 renders</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-column">
          <div className="form-group">
            <label className="form-label">Your Budget (Optional)</label>
            <div className="price-input-group">
              <span className="currency-prefix">$</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Ex: 5000.00"
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>
            <p className="form-hint">Artists can see your budget and submit competitive proposals</p>
          </div>

          <div className="form-group">
            <label className="form-label">Reference Images (Optional)</label>
            <p className="form-hint">Add floor plans, site photos, style references, etc.</p>

            <label className="file-upload-area">
              <Upload size={24} />
              <span>Click to add images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="file-input-hidden"
              />
            </label>

            {previewUrls.length > 0 && (
              <div className="image-previews">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button type="button" onClick={() => removeImage(index)} className="remove-image-btn">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading || uploadingImages} className="btn-primary btn-large">
              {loading ? 'Publishing...' : uploadingImages ? 'Uploading Images...' : 'Publish Project'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
