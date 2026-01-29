'use client'

import { useState, useRef } from 'react'
import { X, Image, Video, FileText, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MediaData {
  mediaUrl: string
  mediaType: string
  caption: string | null
}

interface MediaUploadProps {
  onMediaSelected: (data: MediaData) => void
  onClose: () => void
}

export default function MediaUpload({ onMediaSelected, onClose }: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('Please select an image (JPG, PNG, GIF) or video (MP4, WebM)')
      return
    }
    if (file.size > 50 * 1024 * 1024) { alert('File too large. Maximum size: 50MB'); return }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadMedia = async (): Promise<MediaData | null> => {
    if (!selectedFile) return null
    setUploading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('message-media').upload(fileName, selectedFile, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('message-media').getPublicUrl(fileName)
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video'
      return { mediaUrl: urlData.publicUrl, mediaType, caption: caption.trim() || null }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Error uploading media. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSend = async () => {
    const mediaData = await uploadMedia()
    if (mediaData) { onMediaSelected(mediaData); onClose() }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <FileText size={24} />
    if (selectedFile.type.startsWith('image/')) return <Image size={24} />
    if (selectedFile.type.startsWith('video/')) return <Video size={24} />
    return <FileText size={24} />
  }

  return (
    <div className="media-upload-overlay" onClick={onClose}>
      <div className="media-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="media-upload-header">
          <h3>Send Media</h3>
          <button onClick={onClose} className="media-upload-close"><X size={24} /></button>
        </div>
        <div className="media-upload-body">
          {!selectedFile ? (
            <div className="media-upload-dropzone">
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <div className="media-upload-dropzone-content">
                {getFileIcon()}
                <p>Select an image or video</p>
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>Choose File</button>
                <small>Images: JPG, PNG, GIF - Videos: MP4, WebM</small>
                <small>Maximum size: 50MB</small>
              </div>
            </div>
          ) : (
            <div className="media-upload-preview">
              {selectedFile.type.startsWith('image/') && preview && <img src={preview} alt="Preview" className="media-preview-image" />}
              {selectedFile.type.startsWith('video/') && preview && <video src={preview} controls className="media-preview-video" />}
              <button className="media-upload-change" onClick={() => { setSelectedFile(null); setPreview(null); setCaption('') }}>
                <X size={16} /> Remove
              </button>
            </div>
          )}
        </div>
        {selectedFile && (
          <div className="media-upload-caption">
            <input type="text" placeholder="Add caption (optional)..." value={caption} onChange={(e) => setCaption(e.target.value)} className="media-caption-input" maxLength={500} />
          </div>
        )}
        {selectedFile && (
          <div className="media-upload-footer">
            <button className="btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
            <button className="btn-primary" onClick={handleSend} disabled={uploading}>
              {uploading ? (<><Loader size={18} className="spinning" /> Sending...</>) : (<><Image size={18} /> Send</>)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
