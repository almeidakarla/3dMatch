'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Calendar, MessageSquare } from 'lucide-react'

interface Application {
  id: string
  delivery_timeline: number
  proposal?: string
}

interface EditApplicationModalProps {
  application: Application
  onClose: () => void
  onSuccess: () => void
}

export default function EditApplicationModal({ application, onClose, onSuccess }: EditApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    delivery_timeline: application.delivery_timeline?.toString() || '',
    proposal: application.proposal || '',
  })

  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.delivery_timeline || parseInt(formData.delivery_timeline) <= 0) {
      setError('Please enter a valid timeline in days')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          delivery_timeline: parseInt(formData.delivery_timeline),
          proposal: formData.proposal.trim() || null,
        })
        .eq('id', application.id)

      if (updateError) throw updateError
      onSuccess()
    } catch (err: unknown) {
      console.error('Error updating application:', err)
      setError(err instanceof Error ? err.message : 'Error updating application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Application</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Delivery Timeline (days) *
            </label>
            <input
              type="number"
              name="delivery_timeline"
              value={formData.delivery_timeline}
              onChange={handleChange}
              placeholder="Ex: 15"
              min="1"
              required
              className="form-input"
            />
            <p className="form-hint">
              How many days do you need to complete this project?
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} />
              Any observations?
            </label>
            <textarea
              name="proposal"
              value={formData.proposal}
              onChange={handleChange}
              rows={4}
              placeholder="Optional: share any comments or questions..."
              className="form-textarea"
            />
            <p className="form-hint">
              Ask to adjust price, timeline, share more details about your workflow, etc.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
