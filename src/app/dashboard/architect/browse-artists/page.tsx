'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { formatPrivateName } from '@/utils/nameFormatter'
import { Search, User, MapPin } from 'lucide-react'

interface Artist {
  id: string
  full_name: string
  profile_photo?: string
  location?: string
  user_type: string
  approval_status: string
}

export default function BrowseArtistsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadArtists()
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
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

      if (artistsError) throw artistsError

      setArtists(artistsData || [])
    } catch (error) {
      console.error('Error loading artists:', error)
    } finally {
      setLoading(false)
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
    <div className="browse-artists-page">
      <h2 className="section-title">Browse Artists</h2>
      <p className="subtitle">Discover talented 3D artists and view their portfolios</p>

      <div className="search-container">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
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
        <div className="artists-showcase-grid">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="artist-showcase-card"
              onClick={() => router.push(`/dashboard/architect/artist-profile/${artist.id}`)}
            >
              {/* Profile Photo */}
              <div className="artist-photo-wrapper">
                {artist.profile_photo ? (
                  <img src={artist.profile_photo} alt={formatPrivateName(artist.full_name)} />
                ) : (
                  <div className="photo-placeholder">
                    <User size={48} />
                  </div>
                )}
              </div>

              {/* Artist Name */}
              <h3 className="artist-display-name">{formatPrivateName(artist.full_name)}</h3>

              {/* Location */}
              {artist.location && (
                <p className="artist-display-location">
                  <MapPin size={14} />
                  {artist.location}
                </p>
              )}

              {/* View Profile Button */}
              <button className="btn-view-profile">View Profile</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
