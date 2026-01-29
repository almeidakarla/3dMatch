'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { X, Upload, Trash2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  deadline: string
  category: string
  number_of_rooms?: number
  renders_per_room?: number
  reference_images?: string[]
}

interface EditProjectModalProps {
  project: Project
  onClose: () => void
  onSuccess: () => void
}

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

export default function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    deadline: project.deadline || '',
    category: project.category || 'residential',
    number_of_rooms: project.number_of_rooms?.toString() || '',
    renders_per_room: project.renders_per_room || 3,
  })
  const [existingImages, setExistingImages] = useState<string[]>(project.reference_images || [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) { setError('Only images are allowed'); return false }
      if (file.size > 10 * 1024 * 1024) { setError('Images must be no larger than 10MB'); return false }
      return true
    })
    if (validFiles.length > 0) {
      setNewFiles([...newFiles, ...validFiles])
      setNewPreviewUrls([...newPreviewUrls, ...validFiles.map(f => URL.createObjectURL(f))])
      setError(null)
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviewUrls[index])
    setNewFiles(newFiles.filter((_, i) => i !== index))
    setNewPreviewUrls(newPreviewUrls.filter((_, i) => i !== index))
  }

  const uploadNewImages = async (): Promise<string[]> => {
    if (newFiles.length === 0 || !user?.id) return []
    setUploadingImages(true)
    const uploadedUrls: string[] = []
    try {
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/projects/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('project-references')
          .upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('project-references').getPublicUrl(fileName)
        uploadedUrls.push(urlData.publicUrl)
      }
      return uploadedUrls
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const newImageUrls = await uploadNewImages()
      const allImageUrls = [...existingImages, ...newImageUrls]
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          category: formData.category,
          number_of_rooms: formData.number_of_rooms ? parseInt(formData.number_of_rooms) : null,
          renders_per_room: formData.renders_per_room,
          reference_images: allImageUrls,
        })
        .eq('id', project.id)
      if (updateError) throw updateError
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url))
      onSuccess()
    } catch (err: any) {
      console.error('Error updating project:', err)
      setError(err.message || 'Error updating project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Project</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required className="form-textarea" />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="form-select">
              {categories.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Number of Rooms</label>
              <input type="number" name="number_of_rooms" value={formData.number_of_rooms} onChange={handleChange} min="1" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Renders per Room</label>
              <select name="renders_per_room" value={formData.renders_per_room} onChange={handleChange} className="form-select">
                <option value={1}>1 render</option>
                <option value={2}>2 renders</option>
                <option value={3}>3 renders</option>
                <option value={4}>4 renders</option>
                <option value={5}>5 renders</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reference Images</label>
            {existingImages.length > 0 && (
              <div className="images-section">
                <p className="images-label">Current Images:</p>
                <div className="images-grid">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="image-preview">
                      <img src={url} alt={`Reference ${index + 1}`} />
                      <button type="button" className="image-remove-btn" onClick={() => removeExistingImage(index)} title="Remove image">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {newPreviewUrls.length > 0 && (
              <div className="images-section">
                <p className="images-label">New Images:</p>
                <div className="images-grid">
                  {newPreviewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="image-preview">
                      <img src={url} alt={`New ${index + 1}`} />
                      <button type="button" className="image-remove-btn" onClick={() => removeNewImage(index)} title="Remove image">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="upload-area">
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
              <Upload size={24} />
              <span>Add more images</span>
              <small>PNG, JPG or GIF (max. 10MB each)</small>
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
          {uploadingImages && <div className="uploading-message">Uploading images...</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || uploadingImages}>
              {uploadingImages ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
