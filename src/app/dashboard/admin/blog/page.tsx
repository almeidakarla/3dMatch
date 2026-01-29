'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  featured_image?: string
  status: string
  published_at?: string
  views_count: number
  created_at: string
  author?: { full_name: string }
  blog_post_categories?: { category: { name: string } }[]
}

export default function BlogManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, author:profiles(full_name), blog_post_categories(category:blog_categories(name))`)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading blog posts:', error)
      setMessage('Error loading blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId)
      if (error) throw error
      setMessage('Post deleted successfully')
      loadPosts()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting post:', error)
      setMessage('Error deleting post')
    }
  }

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const publishedAt = newStatus === 'published' ? new Date().toISOString() : null
    try {
      const { error } = await supabase.from('blog_posts').update({ status: newStatus, published_at: publishedAt }).eq('id', post.id)
      if (error) throw error
      setMessage(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
      loadPosts()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating post status:', error)
      setMessage('Error updating post status')
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'badge-draft' },
      published: { label: 'Published', className: 'badge-published' },
      archived: { label: 'Archived', className: 'badge-archived' }
    }
    return badges[status] || badges.draft
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length
  }

  if (loading) return <div className="loading">Loading blog posts...</div>

  return (
    <div className="blog-management-container">
      <div className="blog-management-header">
        <div>
          <h1 className="page-title">Blog Management</h1>
          <p className="page-subtitle">Create and manage blog posts</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/dashboard/admin/blog/new')}>
          <PlusCircle size={20} /> New Post
        </button>
      </div>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>{message}</div>
      )}

      <div className="blog-stats">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Posts</div></div>
        <div className="stat-card"><div className="stat-value">{stats.published}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value">{stats.draft}</div><div className="stat-label">Drafts</div></div>
      </div>

      <div className="blog-filters">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All ({stats.total})</button>
          <button className={`filter-tab ${filterStatus === 'published' ? 'active' : ''}`} onClick={() => setFilterStatus('published')}>Published ({stats.published})</button>
          <button className={`filter-tab ${filterStatus === 'draft' ? 'active' : ''}`} onClick={() => setFilterStatus('draft')}>Drafts ({stats.draft})</button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>Create your first blog post to get started</p>
          <button className="btn-primary" onClick={() => router.push('/dashboard/admin/blog/new')}><PlusCircle size={20} /> Create Post</button>
        </div>
      ) : (
        <div className="blog-posts-table">
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Author</th><th>Published</th><th>Views</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredPosts.map((post) => {
                const statusBadge = getStatusBadge(post.status)
                return (
                  <tr key={post.id}>
                    <td>
                      <div className="post-title-cell">
                        {post.featured_image && <img src={post.featured_image} alt={post.title} className="post-thumbnail" />}
                        <div>
                          <div className="post-title">{post.title}</div>
                          {post.excerpt && <div className="post-excerpt">{post.excerpt.substring(0, 80)}...</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`status-badge ${statusBadge.className}`}>{statusBadge.label}</span></td>
                    <td>{post.author?.full_name || 'Unknown'}</td>
                    <td>{formatDate(post.published_at || null)}</td>
                    <td>{post.views_count || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => toggleStatus(post)} title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {post.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button className="btn-icon" onClick={() => router.push(`/dashboard/admin/blog/edit/${post.id}`)} title="Edit"><Edit2 size={18} /></button>
                        <button className="btn-icon btn-danger" onClick={() => handleDelete(post.id)} title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
