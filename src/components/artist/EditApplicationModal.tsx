'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, DollarSign, Calendar, FileText } from 'lucide-react'

interface Application {
  id: string
  quoted_price: number
  currency: string
  delivery_timeline: number
  proposal: string
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
    quoted_price: application.quoted_price?.toString() || '',
    currency: application.currency || 'BRL',
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

    if (!formData.quoted_price || parseFloat(formData.quoted_price) <= 0) {
      setError('Please enter a valid price')
      setLoading(false)
      return
    }

    if (!formData.delivery_timeline || parseInt(formData.delivery_timeline) <= 0) {
      setError('Please enter a valid timeline in days')
      setLoading(false)
      return
    }

    if (!formData.proposal || formData.proposal.trim().length === 0) {
      setError('Please write a proposal')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          quoted_price: parseFloat(formData.quoted_price),
          currency: formData.currency,
          delivery_timeline: parseInt(formData.delivery_timeline),
          proposal: formData.proposal.trim(),
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Your Price *
              </label>
              <input
                type="number"
                name="quoted_price"
                value={formData.quoted_price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency *</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
              </select>
            </div>
          </div>

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
              <FileText size={16} />
              Your Proposal *
            </label>
            <textarea
              name="proposal"
              value={formData.proposal}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your approach to this project, your relevant experience, and why you are the best choice..."
              className="form-textarea"
              required
            />
            <p className="form-hint">
              Be clear and professional.
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
