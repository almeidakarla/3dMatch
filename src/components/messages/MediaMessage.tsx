'use client'

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn } from 'lucide-react'

interface Message {
  media_url: string
  media_type: string
  content: string
}

interface MediaMessageProps {
  message: Message
  isOwn: boolean
}

export default function MediaMessage({ message, isOwn }: MediaMessageProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { media_url, media_type, content } = message

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) setShowFullscreen(false)
    }
    if (showFullscreen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showFullscreen])

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(media_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `3dmatch-media-${Date.now()}.${media_type === 'image' ? 'jpg' : 'mp4'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading media:', error)
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!imageError && imageLoaded) setShowFullscreen(true)
  }

  return (
    <>
      <div className={`media-message ${isOwn ? 'own' : 'other'}`}>
        {media_type === 'image' && (
          <div className="media-message-image-wrapper" onClick={handleImageClick}>
            {!imageLoaded && !imageError && (
              <div className="media-message-loading"><div className="spinner"></div></div>
            )}
            {imageError ? (
              <div className="media-message-error"><X size={32} /><p>Error loading image</p></div>
            ) : (
              <>
                <img src={media_url} alt="Sent media" className="media-message-image"
                  onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)}
                  style={{ display: imageLoaded ? 'block' : 'none' }} />
                {imageLoaded && (
                  <div className="media-message-overlay">
                    <button className="media-action-btn" onClick={handleDownload} title="Download"><Download size={18} /></button>
                    <button className="media-action-btn" title="View fullscreen"><ZoomIn size={18} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {media_type === 'video' && (
          <div className="media-message-video-wrapper">
            <video src={media_url} controls className="media-message-video" preload="metadata" />
            <button className="media-download-btn" onClick={handleDownload} title="Download video"><Download size={16} /></button>
          </div>
        )}
        {content && <div className="media-message-caption">{content}</div>}
      </div>

      {showFullscreen && media_type === 'image' && !imageError && (
        <div className="media-fullscreen-overlay" onClick={() => setShowFullscreen(false)}>
          <div className="media-fullscreen-header">
            <button className="media-fullscreen-close" onClick={() => setShowFullscreen(false)} title="Close (ESC)"><X size={28} /></button>
            <button className="media-fullscreen-download" onClick={handleDownload} title="Download image"><Download size={24} /></button>
          </div>
          <div className="media-fullscreen-content">
            <img src={media_url} alt="Fullscreen view" onClick={(e) => e.stopPropagation()} />
          </div>
          {content && <div className="media-fullscreen-caption">{content}</div>}
          <div className="media-fullscreen-hint">Press ESC or click outside to close</div>
        </div>
      )}
    </>
  )
}
