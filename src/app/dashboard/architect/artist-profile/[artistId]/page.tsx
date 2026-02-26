'use client'

/**
 * VIEW ARTIST PROFILE — /dashboard/architect/artist-profile/[artistId]
 *
 * OLD CRA APPROACH:
 *   - useParams() from react-router-dom to get artistId
 *   - useNavigate() for back button and redirects
 *   - Global supabase client
 *
 * NEW NEXT.JS APPROACH:
 *   - useParams() from next/navigation (same hook name, different import!)
 *   - useRouter() for navigation
 *   - Browser supabase client from our createClient()
 *   - [artistId] folder name = dynamic route param (replaces :artistId in react-router)
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { formatPrivateName } from '@/utils/nameFormatter'
import { MessageCircle, Briefcase, MapPin, Calendar, ArrowLeft } from 'lucide-react'

interface ArtistProfile {
  id: string
  full_name: string
  profile_photo?: string
  location?: string
  years_experience?: number
  user_type: string
  approval_status: string
  [key: string]: unknown
}

interface PortfolioItem {
  id: string
  image_url: string
  title?: string
  description?: string
  technologies?: string[]
}

interface Project {
  id: string
  title: string
  status: string
}

export default function ViewArtistProfilePage() {
  const params = useParams()
  const artistId = params.artistId as string
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState<ArtistProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [myProjects, setMyProjects] = useState<Project[]>([])

  useEffect(() => {
    if (artistId) {
      loadArtistProfile()
      loadMyProjects()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId])

  const loadArtistProfile = async () => {
    try {
      setLoading(true)

      const { data: artistData, error: artistError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', artistId)
        .single()

      if (artistError) throw artistError

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (portfolioError) {
        console.error('Error loading portfolio:', portfolioError)
      }

      setArtist(artistData as ArtistProfile)
      setPortfolio((portfolioData || []) as PortfolioItem[])
    } catch (error) {
      console.error('Error loading artist profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .eq('architect_id', user!.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyProjects((data || []) as Project[])
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleSendMessage = async () => {
    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user!.id},participant2_id.eq.${artistId}),and(participant1_id.eq.${artistId},participant2_id.eq.${user!.id})`)
        .single()

      if (existingConv) {
        router.push(`/dashboard/messages?conversationId=${existingConv.id}`)
        return
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user!.id,
          participant2_id: artistId,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/dashboard/messages?conversationId=${newConv.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error starting conversation. Please try again.')
    }
  }

  const handleInviteToProject = async (projectId: string) => {
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user!.id},participant2_id.eq.${artistId}),and(participant1_id.eq.${artistId},participant2_id.eq.${user!.id})`)
        .single()

      let conversationId = conv?.id

      if (!conversationId) {
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user!.id,
            participant2_id: artistId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (newConvError) throw newConvError
        conversationId = newConv.id
      }

      const project = myProjects.find((p) => p.id === projectId)

      // Send message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user!.id,
          receiver_id: artistId,
          content: `Hello! I would like to invite you to apply for my project: "${project?.title}". Please check the details and submit your proposal!`,
          is_read: false,
        })

      // Create notification for the artist
      await supabase
        .from('notifications')
        .insert({
          user_id: artistId,
          type: 'project_invite',
          title: 'New Project Invitation',
          message: `You've been invited to apply for the project "${project?.title}"`,
          link: `/dashboard/artist/browse-projects?invited=${projectId}`,
          is_read: false,
        })

      alert('Invitation sent successfully!')
      setShowProjectModal(false)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Error sending invitation. Please try again.')
    }
  }

  if (loading) {
    return <div className="loading">Loading artist profile...</div>
  }

  if (!artist) {
    return <div className="error">Artist not found</div>
  }

  // Get unique technologies from portfolio
  const allTechnologies = portfolio.reduce((acc: string[], item) => {
    if (item.technologies && Array.isArray(item.technologies)) {
      return [...acc, ...item.technologies]
    }
    return acc
  }, [])
  const uniqueTechnologies = [...new Set(allTechnologies)]

  return (
    <div className="view-artist-profile">
      {/* Header */}
      <div className="profile-header">
        <button onClick={() => router.back()} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* Artist Info Card */}
      <div className="artist-info-card">
        <div className="artist-main-info">
          <div className="artist-photo-large">
            {artist.profile_photo ? (
              <img src={artist.profile_photo} alt={formatPrivateName(artist.full_name)} />
            ) : (
              <div className="photo-placeholder">
                {formatPrivateName(artist.full_name).charAt(0)}
              </div>
            )}
          </div>
          <div className="artist-details">
            <h1 className="artist-name-large">{formatPrivateName(artist.full_name)}</h1>
            {artist.location && (
              <p className="artist-meta">
                <MapPin size={16} />
                {artist.location}
              </p>
            )}
            {artist.years_experience && (
              <p className="artist-meta">
                <Calendar size={16} />
                {artist.years_experience} years of experience
              </p>
            )}
          </div>
        </div>

        {/* Technologies */}
        {uniqueTechnologies.length > 0 && (
          <div className="profile-section">
            <h3>Technologies & Software</h3>
            <div className="tech-tags-large">
              {uniqueTechnologies.map((tech, index) => (
                <span key={index} className="tech-tag-large">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="profile-actions">
          <button onClick={handleSendMessage} className="btn-primary-action">
            <MessageCircle size={20} />
            Send Message
          </button>
          <button onClick={() => setShowProjectModal(true)} className="btn-secondary-action">
            <Briefcase size={20} />
            Invite to Project
          </button>
        </div>
      </div>

      {/* Portfolio */}
      <div className="portfolio-section">
        <h2>Portfolio</h2>
        {portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <p>No portfolio items yet</p>
          </div>
        ) : (
          <div className="portfolio-grid-large">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="portfolio-item-large"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.image_url} alt={item.title || 'Portfolio item'} />
                {item.title && (
                  <div className="portfolio-overlay">
                    <h4>{item.title}</h4>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content-image" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="close-modal">&times;</button>
            <img src={selectedImage.image_url} alt={selectedImage.title || 'Portfolio'} />
            {selectedImage.title && <h3>{selectedImage.title}</h3>}
            {selectedImage.description && <p>{selectedImage.description}</p>}
            {selectedImage.technologies && selectedImage.technologies.length > 0 && (
              <div className="modal-tech-tags">
                {selectedImage.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag-small">{tech}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Selection Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite {formatPrivateName(artist.full_name)} to Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="close-button">&times;</button>
            </div>

            <div className="modal-body">
              {myProjects.length === 0 ? (
                <div className="empty-projects">
                  <p>You don&apos;t have any open projects yet.</p>
                  <button
                    onClick={() => router.push('/dashboard/architect/post-project')}
                    className="btn-primary"
                  >
                    Create a Project
                  </button>
                </div>
              ) : (
                <div className="projects-list">
                  <p className="modal-instruction">Select a project to invite this artist:</p>
                  {myProjects.map((project) => (
                    <div key={project.id} className="project-option">
                      <div className="project-option-info">
                        <h4>{project.title}</h4>
                        <span className="project-status">{project.status}</span>
                      </div>
                      <button
                        onClick={() => handleInviteToProject(project.id)}
                        className="btn-select-project"
                      >
                        Send Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
