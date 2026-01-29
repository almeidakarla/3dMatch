'use client'

import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { createClient } from '@/lib/supabase/client'
import { Mail, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString()
        })

      if (submitError) throw submitError

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError('Failed to send message. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="contact-container">
        <div className="contact-content">
          {/* Left Side - Image & Info */}
          <div className="contact-left">
            <div className="contact-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=1000&fit=crop"
                alt="Architectural Rendering"
                className="contact-render-image"
              />
            </div>
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p className="contact-intro">
                Have a question? Concern? Just want to say hi?
              </p>
              <p className="contact-email-info">
                You may also email{' '}
                <a href="mailto:contact@3dmatch.app">contact@3dmatch.app</a>
              </p>

              <div className="contact-details">
                <div className="contact-detail-item">
                  <Mail size={20} />
                  <div>
                    <strong>Email</strong>
                    <p>contact@3dmatch.app</p>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <MapPin size={20} />
                  <div>
                    <strong>Location</strong>
                    <p>Serving clients worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="contact-right">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>

            {success && (
              <div className="contact-success">
                ✓ Message sent successfully! We&apos;ll get back to you soon.
              </div>
            )}

            {error && (
              <div className="contact-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us more..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="contact-submit-btn"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
