'use client'

/**
 * BROWSE ARTISTS PAGE — /dashboard/architect/browse-artists
 *
 * OLD CRA APPROACH:
 *   - Component imported supabase from a global singleton
 *   - Used useNavigate() for navigation
 *   - Used Link from react-router-dom
 *
 * NEW NEXT.JS APPROACH:
 *   - Uses createClient() from our browser client (cookie-based auth)
 *   - Uses useRouter() from next/navigation
 *   - Still a client component ('use client') because of search, state, click handlers
 *   - Could later become a Server Component with data fetched on the server (Phase 5 optimization)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { formatPrivateName } from '@/utils/nameFormatter'
import { Search, User } from 'lucide-react'

interface Artist {
  id: string
  full_name: string
  profile_photo?: string
  location?: string
  user_type: string
  approval_status: string
  portfolio_images: string[]
  technologies: string[]
  [key: string]: unknown
}

interface Project {
  id: string
  title: string
  status: string
}

export default function BrowseArtistsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [myProjects, setMyProjects] = useState<Project[]>([])

  useEffect(() => {
    if (user?.id) {
      loadArtists()
      loadMyProjects()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadArtists = async () => {
    try {
      setLoading(true)

      const { data: artistsData, error: artistsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'artista')
        .order('created_at', { ascending: false })

      if (artistsError) throw artistsError

      // For each artist, get their portfolio images and technologies
      const artistsWithPortfolios = await Promise.all(
        (artistsData || []).map(async (artist) => {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio')
            .select('image_url, technologies')
            .eq('artist_id', artist.id)
            .order('created_at', { ascending: false })
            .limit(6)

          if (portfolioError) {
            console.error('Error loading portfolio for artist:', artist.id, portfolioError)
          }

          const allTechnologies = portfolioData?.reduce((acc: string[], item) => {
            if (item.technologies && Array.isArray(item.technologies)) {
              return [...acc, ...item.technologies]
            }
            return acc
          }, []) || []

          const uniqueTechnologies = [...new Set(allTechnologies)]

          return {
            ...artist,
            portfolio_images: portfolioData?.map((p) => p.image_url) || [],
            technologies: uniqueTechnologies,
          } as Artist
        })
      )

      setArtists(artistsWithPortfolios)
    } catch (error) {
      console.error('Error loading artists:', error)
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
      setMyProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleInviteToProject = async (projectId: string) => {
    if (!selectedArtist) return

    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user!.id},participant2_id.eq.${selectedArtist.id}),and(participant1_id.eq.${selectedArtist.id},participant2_id.eq.${user!.id})`)
        .single()

      let conversationId = conv?.id

      if (!conversationId) {
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user!.id,
            participant2_id: selectedArtist.id,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (newConvError) throw newConvError
        conversationId = newConv.id
      }

      const project = myProjects.find((p) => p.id === projectId)

      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user!.id,
          receiver_id: selectedArtist.id,
          content: `Hello! I would like to invite you to apply for my project: "${project?.title}". Please check the details and submit your proposal!`,
          is_read: false,
        })

      // Create notification for the artist
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedArtist.id,
          type: 'project_invite',
          title: 'New Project Invitation',
          message: `You've been invited to apply for the project "${project?.title}"`,
          link: `/dashboard/artist/browse-projects?invited=${projectId}`,
          is_read: false,
        })

      alert('Invitation sent successfully!')
      setShowProjectModal(false)
      setSelectedArtist(null)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Error sending invitation. Please try again.')
    }
  }

  const filteredArtists = artists.filter((artist) => {
    if (!searchTerm) return true
    const displayName = formatPrivateName(artist.full_name)
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return <div className="loading">Loading artists...</div>
  }

  return (
    <div className="browse-artists-container">
      <div className="browse-header">
        <div>
          <h2 className="section-title">Browse Artists</h2>
          <p className="subtitle">Discover talented 3D artists and their portfolios</p>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredArtists.length === 0 ? (
        <div className="empty-state">
          <User size={64} className="empty-icon" />
          <p className="empty-state-title">No artists found</p>
          <p className="empty-state-text">
            {searchTerm ? 'Try a different search term' : 'No artists available at the moment'}
          </p>
        </div>
      ) : (
        <div className="artists-grid">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="artist-card"
              onClick={() => router.push(`/dashboard/architect/artist-profile/${artist.id}`)}
            >
              {/* Artist Header */}
              <div className="artist-card-header">
                <div className="artist-avatar">
                  {artist.profile_photo ? (
                    <img src={artist.profile_photo} alt={formatPrivateName(artist.full_name)} />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{formatPrivateName(artist.full_name)}</h3>
                  {artist.location && (
                    <p className="artist-location">{artist.location}</p>
                  )}
                  {artist.technologies && artist.technologies.length > 0 && (
                    <div className="artist-technologies">
                      {artist.technologies.slice(0, 5).map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                      {artist.technologies.length > 5 && (
                        <span className="tech-tag more">+{artist.technologies.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Grid */}
              <div className="portfolio-grid">
                {artist.portfolio_images.length === 0 ? (
                  <div className="no-portfolio">
                    <p>No portfolio images yet</p>
                  </div>
                ) : (
                  artist.portfolio_images.map((imageUrl, index) => (
                    <div key={index} className="portfolio-image">
                      <img src={imageUrl} alt={`Portfolio ${index + 1}`} />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Selection Modal */}
      {showProjectModal && selectedArtist && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite {formatPrivateName(selectedArtist.full_name)} to Project</h3>
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
