'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, Search, Tag } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  reading_time?: number
  author?: { full_name: string }
  blog_post_tags?: { tag: { name: string; slug: string } }[]
}

export default function BlogListingPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBlogData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select(`id, title, slug, excerpt, featured_image, published_at, reading_time, author:profiles(full_name), blog_post_tags(tag:blog_tags(name, slug))`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20)
      if (error) throw error
      if (postsData) setPosts(postsData as unknown as BlogPost[])
    } catch (error) {
      console.error('Error loading blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const featuredPost = filteredPosts[0]
  const regularPosts = filteredPosts.slice(1)

  if (loading) return <div className="loading">Loading blog posts...</div>

  return (
    <PublicLayout>
      <div className="blog-listing-container">
        <div className="blog-header">
          <h1 className="blog-title">3dMatch Blog</h1>
          <p className="blog-subtitle">Insights, tips, and inspiration for 3D artists and design professionals</p>
        </div>

        <div className="blog-controls">
          <div className="search-box">
            <Search size={20} />
            <input type="text" placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-state"><h3>No posts found</h3><p>Try adjusting your search or filters</p></div>
        ) : (
          <>
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="featured-post">
                {featuredPost.featured_image && (
                  <div className="featured-post-image"><img src={featuredPost.featured_image} alt={featuredPost.title} /></div>
                )}
                <div className="featured-post-content">
                  <div className="post-meta">
                    <span className="post-date"><Calendar size={14} /> {formatDate(featuredPost.published_at)}</span>
                    {featuredPost.reading_time && <span className="post-reading-time"><Clock size={14} /> {featuredPost.reading_time} min read</span>}
                  </div>
                  <h2 className="featured-post-title">{featuredPost.title}</h2>
                  {featuredPost.excerpt && <p className="featured-post-excerpt">{featuredPost.excerpt}</p>}
                  <div className="post-author"><User size={16} /><span>By {featuredPost.author?.full_name || 'Anonymous'}</span></div>
                </div>
              </Link>
            )}

            {regularPosts.length > 0 && (
              <div className="blog-posts-grid">
                {regularPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="blog-post-card">
                    {post.featured_image && <div className="post-card-image"><img src={post.featured_image} alt={post.title} /></div>}
                    <div className="post-card-content">
                      <div className="post-meta"><span className="post-date"><Calendar size={12} /> {formatDate(post.published_at)}</span></div>
                      <h3 className="post-card-title">{post.title}</h3>
                      {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
                      <div className="post-footer">
                        <span className="post-author">{post.author?.full_name || 'Anonymous'}</span>
                        {post.reading_time && <span className="post-reading-time">{post.reading_time} min read</span>}
                      </div>
                      {post.blog_post_tags && post.blog_post_tags.length > 0 && (
                        <div className="post-tags">
                          {post.blog_post_tags.slice(0, 3).map((pt, index) => (
                            <span key={index} className="post-tag"><Tag size={12} /> {pt.tag?.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  )
}
