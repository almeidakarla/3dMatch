'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, DollarSign, Calendar, FileText } from 'lucide-react'

interface Project {
  id: string
  title: string
  budget: number
  currency: string
}

interface ApplicationModalProps {
  project: Project
  artistId: string
  onClose: () => void
  onSuccess: (application: Record<string, unknown>) => void
}

export default function ApplicationModal({ project, artistId, onClose, onSuccess }: ApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    quoted_price: '',
    currency: 'BRL',
    delivery_timeline: '',
    proposal: '',
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
      const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('project_id', project.id)
        .eq('artist_id', artistId)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingApp) {
        setError('You have already submitted an application for this project')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('applications')
        .insert({
          project_id: project.id,
          artist_id: artistId,
          quoted_price: parseFloat(formData.quoted_price),
          currency: formData.currency,
          delivery_timeline: parseInt(formData.delivery_timeline),
          proposal: formData.proposal.trim(),
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError
      onSuccess(data)
    } catch (err: unknown) {
      console.error('Error submitting application:', err)
      setError(err instanceof Error ? err.message : 'Error submitting application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Apply to Project</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="project-summary">
            <h3>{project.title}</h3>
            <p className="project-budget">
              Client Budget: {project.currency} {project.budget?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="quoted_price" className="form-label">
                <DollarSign size={18} />
                Your Price (R$) *
              </label>
              <div className="price-input-group">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="currency-select"
                  disabled={loading}
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  id="quoted_price"
                  name="quoted_price"
                  value={formData.quoted_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Ex: 5000.00"
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>
              <p className="form-hint">
                Platform fees will be deducted from the total amount
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="delivery_timeline" className="form-label">
                <Calendar size={18} />
                Delivery Timeline (days) *
              </label>
              <input
                type="number"
                id="delivery_timeline"
                name="delivery_timeline"
                value={formData.delivery_timeline}
                onChange={handleChange}
                min="1"
                placeholder="Ex: 7"
                className="form-input"
                disabled={loading}
                required
              />
              <p className="form-hint">
                How many days do you need to complete this project?
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="proposal" className="form-label">
                <FileText size={18} />
                Your Proposal *
              </label>
              <textarea
                id="proposal"
                name="proposal"
                value={formData.proposal}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your approach to this project, your relevant experience, and why you are the best choice..."
                className="form-textarea"
                disabled={loading}
                required
              />
              <p className="form-hint">
                Be clear and professional.
              </p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
