'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

const specialtyOptions = [
  'Residential',
  'Commercial',
  'Interior Design',
  'Exterior',
  'Landscaping',
  'Industrial',
  'Urban Planning',
  'Product Visualization',
]

export default function PricingSettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricing, setPricing] = useState({
    base_rate: '',
    rate_type: 'per_render',
    average_delivery_time: '',
    specialties: [] as string[],
    price_per_room_min: '',
    price_per_room_max: '',
    renders_included_per_room: 3,
  })
  const [message, setMessage] = useState('')

  const loadPricing = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('base_rate, rate_type, average_delivery_time, specialties, price_per_room_min, price_per_room_max, renders_included_per_room')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setPricing({
          base_rate: data.base_rate?.toString() || '',
          rate_type: data.rate_type || 'per_render',
          average_delivery_time: data.average_delivery_time?.toString() || '',
          specialties: data.specialties || [],
          price_per_room_min: data.price_per_room_min?.toString() || '',
          price_per_room_max: data.price_per_room_max?.toString() || '',
          renders_included_per_room: data.renders_included_per_room || 3,
        })
      }
    } catch (error) {
      console.error('Error loading pricing:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    loadPricing()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          base_rate: pricing.base_rate || null,
          rate_type: pricing.rate_type,
          average_delivery_time: pricing.average_delivery_time || null,
          specialties: pricing.specialties,
          price_per_room_min: pricing.price_per_room_min || null,
          price_per_room_max: pricing.price_per_room_max || null,
          renders_included_per_room: pricing.renders_included_per_room,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage('Pricing settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving pricing:', error)
      setMessage('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setPricing(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="pricing-settings">
      <h2 className="section-title">Pricing Settings</h2>
      <p className="subtitle">Configure your base rate and specialties</p>

      {message && (
        <div className={`message ${message.includes('Error') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Base Rate *</label>
          <div className="input-with-prefix">
            <span className="prefix">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricing.base_rate}
              onChange={(e) => setPricing({ ...pricing, base_rate: e.target.value })}
              placeholder="Ex: 800.00"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Billing Type *</label>
          <select
            value={pricing.rate_type}
            onChange={(e) => setPricing({ ...pricing, rate_type: e.target.value })}
            className="form-select"
            required
          >
            <option value="per_render">Per Render</option>
            <option value="per_hour">Per Hour</option>
            <option value="per_project">Per Project</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Average Delivery Time (days)</label>
          <input
            type="number"
            min="1"
            value={pricing.average_delivery_time}
            onChange={(e) => setPricing({ ...pricing, average_delivery_time: e.target.value })}
            placeholder="Ex: 7"
            className="form-input"
          />
          <p className="form-hint">How long does it typically take to complete a project?</p>
        </div>

        <div className="form-group" style={{
          background: 'var(--bg-secondary, #f8f9fa)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color, #e9ecef)',
        }}>
          <label className="form-label" style={{ fontSize: '16px', marginBottom: '15px', display: 'block' }}>
            Price Per Room (Optional)
          </label>
          <p className="form-hint" style={{ marginBottom: '15px' }}>
            Set a price range per room including {pricing.renders_included_per_room} renders
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '14px', marginBottom: '5px' }}>
                Minimum Price
              </label>
              <div className="input-with-prefix">
                <span className="prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.price_per_room_min}
                  onChange={(e) => setPricing({ ...pricing, price_per_room_min: e.target.value })}
                  placeholder="Ex: 500"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '14px', marginBottom: '5px' }}>
                Maximum Price
              </label>
              <div className="input-with-prefix">
                <span className="prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.price_per_room_max}
                  onChange={(e) => setPricing({ ...pricing, price_per_room_max: e.target.value })}
                  placeholder="Ex: 1000"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '14px', marginBottom: '5px' }}>
                Renders Included
              </label>
              <select
                value={pricing.renders_included_per_room}
                onChange={(e) => setPricing({ ...pricing, renders_included_per_room: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={1}>1 render</option>
                <option value={2}>2 renders</option>
                <option value={3}>3 renders (recommended)</option>
                <option value={4}>4 renders</option>
                <option value={5}>5 renders</option>
              </select>
            </div>
          </div>

          {pricing.price_per_room_min && pricing.price_per_room_max && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: '#e7f3ff',
              borderRadius: '6px',
              border: '1px solid #b3d9ff',
            }}>
              <strong>Example:</strong> A project with 5 rooms would cost between{' '}
              <strong>R$ {(parseFloat(pricing.price_per_room_min) * 5).toFixed(2)}</strong> and{' '}
              <strong>R$ {(parseFloat(pricing.price_per_room_max) * 5).toFixed(2)}</strong>
              <br />
              <small style={{ color: '#0066cc' }}>
                ({pricing.renders_included_per_room} renders x 5 rooms = {pricing.renders_included_per_room * 5} total renders)
              </small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Specialties</label>
          <div className="specialty-grid">
            {specialtyOptions.map(specialty => (
              <button
                key={specialty}
                type="button"
                className={`specialty-tag ${pricing.specialties.includes(specialty) ? 'active' : ''}`}
                onClick={() => toggleSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
