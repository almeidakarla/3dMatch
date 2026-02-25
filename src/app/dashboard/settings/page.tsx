'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Phone, Lock, Upload, Save, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'

interface ProfileForm {
  full_name: string
  phone: string
}

interface EmailForm {
  newEmail: string
  confirmEmail: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface MessageState {
  type: string
  text: string
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('profile')

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    phone: ''
  })

  const [emailForm, setEmailForm] = useState<EmailForm>({
    newEmail: '',
    confirmEmail: ''
  })

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [stripeLoading, setStripeLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: (profile.phone as string) || ''
      })
      setPhotoPreview(profile.profile_photo || (profile.profile_image_url as string) || null)
    }
  }, [profile])

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      showMessage('success', 'Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showMessage('error', error.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      showMessage('error', 'Emails do not match')
      setLoading(false)
      return
    }

    if (!emailForm.newEmail.includes('@')) {
      showMessage('error', 'Invalid email')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      })

      if (error) throw error

      showMessage('success', 'Confirmation email sent! Check your inbox.')
      setEmailForm({ newEmail: '', confirmEmail: '' })
    } catch (error: any) {
      console.error('Error updating email:', error)
      showMessage('error', error.message || 'Error updating email')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      showMessage('success', 'Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error updating password:', error)
      showMessage('error', error.message || 'Error updating password')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'Photo must be at most 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Only images are allowed')
        return
      }

      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handlePhotoUpload = async () => {
    if (!profilePhoto) {
      showMessage('error', 'Select a photo first')
      return
    }

    setLoading(true)

    try {
      const fileExt = profilePhoto.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, profilePhoto, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo: publicUrl })
        .eq('id', user?.id)

      if (updateError) throw updateError

      await refreshProfile()
      setProfilePhoto(null)
      showMessage('success', 'Profile photo updated!')
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      showMessage('error', error.message || 'Error uploading photo')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeConnect = async () => {
    setStripeLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-stripe-connect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            email: user?.email,
            country: 'BR',
            returnUrl: `${window.location.origin}/dashboard/settings?tab=payment&success=true`,
            refreshUrl: `${window.location.origin}/dashboard/settings?tab=payment&refresh=true`,
          })
        }
      )

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      window.location.href = data.onboardingUrl
    } catch (error: any) {
      console.error('Error connecting bank account:', error)
      showMessage('error', error.message || 'Error connecting bank account')
      setStripeLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Personal Information', icon: User },
    { id: 'account', label: 'Account and Security', icon: Lock },
    { id: 'payment', label: 'Payments', icon: CreditCard }
  ]

  return (
    <div className="settings-container">
      <h2 className="section-title">Settings</h2>

      {message.text && (
        <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3 className="settings-section-title">Personal Information</h3>

            <div className="profile-info-grid">
              <div className="profile-photo-column">
                <div className="photo-preview-container">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="photo-preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="photo-upload-controls">
                  <label htmlFor="photo-upload" className="btn-secondary">
                    <Upload size={18} />
                    Choose Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  {profilePhoto && (
                    <button
                      onClick={handlePhotoUpload}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Uploading...' : 'Save Photo'}
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="settings-form profile-form-column">
                <div className="form-group">
                  <label htmlFor="full_name" className="form-label">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <Phone size={18} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="form-input"
                    placeholder="+55 (11) 98765-4321"
                    disabled={loading}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="settings-section">
            <h3 className="settings-section-title">Email</h3>
            <p className="settings-hint">Current email: {user?.email}</p>

            <form onSubmit={handleEmailUpdate} className="settings-form">
              <div className="form-group">
                <label htmlFor="newEmail" className="form-label">
                  <Mail size={18} />
                  New Email
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmEmail" className="form-label">
                  Confirm New Email
                </label>
                <input
                  type="email"
                  id="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                <Save size={18} />
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>

            <hr className="settings-divider" />

            <h3 className="settings-section-title">Change Password</h3>

            <form onSubmit={handlePasswordUpdate} className="settings-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  <Lock size={18} />
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="form-input"
                  minLength={6}
                  disabled={loading}
                  required
                />
                <p className="form-hint">Minimum 6 characters</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="form-input"
                  minLength={6}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                <Save size={18} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="settings-section">
            <h3 className="settings-section-title">Payment Settings</h3>

            {profile?.stripe_connect_account_id ? (
              <div className="payment-status-card">
                <div className="payment-status-header">
                  <CheckCircle size={24} className="status-icon-success" />
                  <div>
                    <h4>Bank Account Connected</h4>
                    <p>
                      {profile.user_type === 'artista'
                        ? 'Your bank account is connected and ready to receive payments.'
                        : 'Your payment account is connected and ready to send payments.'}
                    </p>
                  </div>
                </div>
                <div className="payment-info">
                  <p><strong>Status:</strong> {profile.stripe_connect_status === 'active' ? 'Active' : 'Pending'}</p>
                </div>
                {profile.stripe_connect_status !== 'active' && (
                  <div className="alert-warning">
                    <AlertCircle size={18} />
                    Complete your bank account setup to
                    {profile.user_type === 'artista' ? ' receive' : ' send'} payments.
                  </div>
                )}
              </div>
            ) : (
              <div className="payment-setup-card">
                <div className="payment-setup-icon">
                  <CreditCard size={48} />
                </div>
                <h4>Set Up Your Payment Account</h4>
                <p>
                  {profile?.user_type === 'artista'
                    ? 'Connect your bank account to receive payments for projects.'
                    : 'Connect your payment account to pay for projects.'}
                </p>
                <button
                  className="btn-primary"
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                >
                  <CreditCard size={18} />
                  {stripeLoading ? 'Connecting...' : 'Connect Bank Account'}
                </button>
                <p className="form-hint">
                  {profile?.user_type === 'artista'
                    ? 'You will be redirected to securely connect your bank account. Platform fees will be deducted automatically.'
                    : 'You will be redirected to securely connect your payment method.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
