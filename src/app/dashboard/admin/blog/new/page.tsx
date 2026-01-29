'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react'

interface Category { id: string; name: string }
interface Tag { id: string; name: string }

export default function BlogEditorNew() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const loadCategoriesAndTags = useCallback(async () => {
    const [categoriesRes, tagsRes] = await Promise.all([
      supabase.from('blog_categories').select('*').order('name'),
      supabase.from('blog_tags').select('*').order('name')
    ])
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (tagsRes.data) setTags(tagsRes.data)
  }, [supabase])

  useEffect(() => { loadCategoriesAndTags() }, [loadCategoriesAndTags])

  useEffect(() => {
    if (title) {
      const generatedSlug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      setSlug(generatedSlug)
    }
  }, [title])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `blog-images/${fileName}`
      const { error: uploadError } = await supabase.storage.from('public-files').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('public-files').getPublicUrl(filePath)
      setFeaturedImage(publicUrl)
      setMessage('Image uploaded successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Error uploading image')
    } finally { setUploadingImage(false) }
  }

  const calculateReadingTime = (text: string) => Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))

  const handleSave = async (publishNow = false) => {
    if (!title.trim()) { setMessage('Title is required'); return }
    if (!content.trim()) { setMessage('Content is required'); return }

    try {
      setSaving(true)
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featured_image: featuredImage || null,
        author_id: user?.id,
        status: publishNow ? 'published' : status,
        published_at: publishNow ? new Date().toISOString() : null,
        reading_time: calculateReadingTime(content),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() || null
      }

      const { data, error } = await supabase.from('blog_posts').insert([postData]).select().single()
      if (error) throw error

      const postId = data.id
      if (selectedCategories.length > 0) {
        await supabase.from('blog_post_categories').insert(selectedCategories.map(catId => ({ post_id: postId, category_id: catId })))
      }
      if (selectedTags.length > 0) {
        await supabase.from('blog_post_tags').insert(selectedTags.map(tagId => ({ post_id: postId, tag_id: tagId })))
      }

      setMessage(publishNow ? 'Post published!' : 'Post saved!')
      setTimeout(() => router.push('/dashboard/admin/blog'), 1500)
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error saving post:', err)
      setMessage('Error saving: ' + err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="blog-editor">
      <div className="editor-header">
        <button className="back-btn" onClick={() => router.push('/dashboard/admin/blog')}><ArrowLeft size={20} /> Back</button>
        <h1>New Blog Post</h1>
        <div className="editor-actions">
          <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save Draft'}</button>
          <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>{saving ? 'Publishing...' : 'Publish'}</button>
        </div>
      </div>

      {message && <div className="editor-message">{message}</div>}

      <div className="editor-content">
        <div className="editor-main">
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="form-input" />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" className="form-input" />
          </div>
          <div className="form-group">
            <label>Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary" className="form-textarea" rows={3} />
          </div>
          <div className="form-group">
            <label>Content * (HTML supported)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post content (HTML supported)..." className="form-textarea" rows={20} style={{ fontFamily: 'monospace' }} />
          </div>
        </div>

        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Featured Image</h3>
            {featuredImage ? (
              <div className="featured-image-preview">
                <img src={featuredImage} alt="Featured" />
                <button onClick={() => setFeaturedImage('')} className="remove-image-btn"><X size={16} /></button>
              </div>
            ) : (
              <div className="image-upload">
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} id="featured-image-upload" style={{ display: 'none' }} />
                <label htmlFor="featured-image-upload" className="upload-btn"><ImageIcon size={24} />{uploadingImage ? 'Uploading...' : 'Upload Image'}</label>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="checkbox-list">
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-item">
                  <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => setSelectedCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])} />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Tags</h3>
            <div className="checkbox-list">
              {tags.map(tag => (
                <label key={tag.id} className="checkbox-item">
                  <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])} />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>SEO Settings</h3>
            <div className="form-group">
              <label>SEO Title</label>
              <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" className="form-input" />
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta description" className="form-textarea" rows={2} />
            </div>
            <div className="form-group">
              <label>Keywords</label>
              <input type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="keyword1, keyword2" className="form-input" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
