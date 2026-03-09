'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { notifyUser } from '@/lib/notifications'
import { CheckCircle, XCircle, Clock, User, Award, Calendar } from 'lucide-react'

interface ArtistProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  profile_photo?: string
  years_experience: number
  software?: string[]
  other_software?: string
  architecture_style?: string[]
  favorite_project_types?: string[]
  approval_status: string
  portfolio_review_notes?: string
  approved_at?: string
  created_at: string
}

export default function ArtistProfileReviewPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<ArtistProfile[]>([])
  const [filter, setFilter] = useState('pending')
  const [selectedProfile, setSelectedProfile] = useState<ArtistProfile | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadProfiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      let query = supabase.from('profiles').select('*').eq('user_type', 'artista').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('approval_status', filter)
      const { data, error } = await query
      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (profileId: string, status: string) => {
    setReviewing(true)
    try {
      const profile = profiles.find(p => p.id === profileId)
      const updateData = {
        approval_status: status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        portfolio_review_notes: reviewNotes
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', profileId)
      if (error) throw error

      await notifyUser({
        supabase,
        userId: profileId,
        userEmail: profile?.email,
        userName: profile?.full_name,
        type: status === 'approved' ? 'application_accepted' : 'application_rejected',
        title: status === 'approved' ? 'Profile Approved!' : 'Profile Not Approved',
        message: status === 'approved' ? 'Your profile has been approved! You can now start working on the platform.' : `Your profile was not approved. ${reviewNotes || 'Contact support for more information.'}`,
        link: '/dashboard/artist/profile',
      })

      await loadProfiles()
      setSelectedProfile(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Error reviewing profile:', error)
      alert('Error processing review. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="status-badge status-pending"><Clock size={14} /> Pending</span>
      case 'approved': return <span className="status-badge status-approved"><CheckCircle size={14} /> Approved</span>
      case 'rejected': return <span className="status-badge status-rejected"><XCircle size={14} /> Rejected</span>
      default: return null
    }
  }

  const isProfileComplete = (profile: ArtistProfile): boolean => {
    return (profile.software?.length || 0) > 0 && profile.years_experience > 0 && (profile.architecture_style?.length || 0) > 0 && (profile.favorite_project_types?.length || 0) > 0
  }

  const stats = {
    total: profiles.length,
    pending: profiles.filter(p => p.approval_status === 'pending').length,
    approved: profiles.filter(p => p.approval_status === 'approved').length,
    rejected: profiles.filter(p => p.approval_status === 'rejected').length
  }

  if (loading) return <div className="loading">Loading profiles...</div>

  return (
    <div className="admin-review-container">
      <div className="admin-header">
        <h2 className="section-title"><Award size={28} /> Artist Profile Review</h2>
        <p className="subtitle">Review and approve 3D artist profiles to ensure platform quality</p>
      </div>

      <div className="review-stats">
        <div className="stat-card" onClick={() => setFilter('all')}><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
        <div className="stat-card stat-pending" onClick={() => setFilter('pending')}><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card stat-approved" onClick={() => setFilter('approved')}><div className="stat-value">{stats.approved}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card stat-rejected" onClick={() => setFilter('rejected')}><div className="stat-value">{stats.rejected}</div><div className="stat-label">Rejected</div></div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'pending' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('pending')}><Clock size={18} /> Pending ({stats.pending})</button>
        <button className={filter === 'approved' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('approved')}><CheckCircle size={18} /> Approved ({stats.approved})</button>
        <button className={filter === 'rejected' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('rejected')}><XCircle size={18} /> Rejected ({stats.rejected})</button>
        <button className={filter === 'all' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('all')}><User size={18} /> All ({stats.total})</button>
      </div>

      <div className="applications-grid">
        {profiles.length === 0 ? (
          <div className="empty-state"><User size={64} /><h3>No profiles found</h3><p>There are no profiles with status &quot;{filter}&quot;</p></div>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="application-card">
              <div className="application-card-header">
                <div className="application-info">
                  <div className="profile-avatar">{profile.profile_photo ? <img src={profile.profile_photo} alt={profile.full_name} /> : <User size={32} />}</div>
                  <div><h3>{profile.full_name || 'Name not provided'}</h3><p className="application-email">{profile.email}</p></div>
                </div>
                {getStatusBadge(profile.approval_status)}
              </div>
              {!isProfileComplete(profile) && profile.approval_status === 'pending' && (
                <div className="incomplete-warning"><Clock size={16} /><span>Incomplete profile - awaiting completion</span></div>
              )}
              <div className="application-card-details">
                <div className="detail-item"><User size={16} /><span>{profile.years_experience || 0} years of experience</span></div>
                <div className="detail-item"><Calendar size={16} /><span>Registration: {formatDate(profile.created_at)}</span></div>
              </div>
              {(profile.software?.length || 0) > 0 && (
                <div className="application-card-tags">
                  <div className="tag-group">
                    <strong>Software:</strong>
                    {profile.software?.slice(0, 3).map((sw, idx) => <span key={idx} className="tag">{sw}</span>)}
                    {(profile.software?.length || 0) > 3 && <span className="tag">+{(profile.software?.length || 0) - 3}</span>}
                  </div>
                </div>
              )}
              <div className="application-card-actions">
                <button className="btn-secondary" onClick={() => setSelectedProfile(profile)}><User size={18} /> View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal-content application-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profile of {selectedProfile.full_name || 'Artist'}</h2>
              <button className="modal-close" onClick={() => setSelectedProfile(null)}>x</button>
            </div>
            <div className="modal-body">
              {selectedProfile.profile_photo && (
                <div className="detail-section"><h3>Profile Photo</h3><div className="profile-photo-large"><img src={selectedProfile.profile_photo} alt={selectedProfile.full_name} /></div></div>
              )}
              <div className="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {selectedProfile.full_name || 'Not provided'}</p>
                <p><strong>Email:</strong> {selectedProfile.email || 'Not provided'}</p>
                <p><strong>Phone:</strong> {selectedProfile.phone || 'Not provided'}</p>
                <p><strong>Years of Experience:</strong> {selectedProfile.years_experience || 0}</p>
                <p><strong>Registration Date:</strong> {formatDate(selectedProfile.created_at)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedProfile.approval_status)}</p>
              </div>

              {isProfileComplete(selectedProfile) ? (
                <>
                  <div className="detail-section">
                    <h3>Professional Skills</h3>
                    <div><strong>Software:</strong><div className="tags-list">{selectedProfile.software?.map((sw, idx) => <span key={idx} className="tag">{sw}</span>)}</div></div>
                    {selectedProfile.other_software && <p><strong>Other Software:</strong> {selectedProfile.other_software}</p>}
                  </div>
                  <div className="detail-section">
                    <h3>Specialties</h3>
                    <div><strong>Architecture Styles:</strong><div className="tags-list">{selectedProfile.architecture_style?.map((style, idx) => <span key={idx} className="tag">{style}</span>)}</div></div>
                    <div><strong>Favorite Project Types:</strong><div className="tags-list">{selectedProfile.favorite_project_types?.map((type, idx) => <span key={idx} className="tag">{type}</span>)}</div></div>
                  </div>
                </>
              ) : (
                <div className="detail-section incomplete-notice"><Clock size={24} /><p><strong>Incomplete Profile</strong></p><p>This artist has not yet completed their professional profile.</p></div>
              )}

              {selectedProfile.approval_status === 'pending' && isProfileComplete(selectedProfile) && (
                <div className="detail-section">
                  <h3>Review Notes</h3>
                  <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add notes about this review (optional)" className="form-textarea" rows={4} />
                  <p className="form-hint">These notes will be visible to the artist if the profile is rejected</p>
                </div>
              )}

              {selectedProfile.approval_status !== 'pending' && selectedProfile.portfolio_review_notes && (
                <div className="detail-section"><h3>Review Notes</h3><p>{selectedProfile.portfolio_review_notes}</p><p className="review-meta">Reviewed on {formatDate(selectedProfile.approved_at || null)}</p></div>
              )}
            </div>

            {selectedProfile.approval_status === 'pending' && isProfileComplete(selectedProfile) && (
              <div className="modal-footer">
                <button className="btn-danger" onClick={() => handleReview(selectedProfile.id, 'rejected')} disabled={reviewing}><XCircle size={20} /> {reviewing ? 'Processing...' : 'Reject'}</button>
                <button className="btn-success" onClick={() => handleReview(selectedProfile.id, 'approved')} disabled={reviewing}><CheckCircle size={20} /> {reviewing ? 'Processing...' : 'Approve'}</button>
              </div>
            )}

            {selectedProfile.approval_status === 'pending' && !isProfileComplete(selectedProfile) && (
              <div className="modal-footer"><p className="info-message"><Clock size={18} /> Wait for the artist to complete their profile before approving</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
