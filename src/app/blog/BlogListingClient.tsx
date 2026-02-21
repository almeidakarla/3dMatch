'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Search } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  reading_time?: number
}

interface BlogListingClientProps {
  initialPosts: BlogPost[]
}

export default function BlogListingClient({ initialPosts }: BlogListingClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const filteredPosts = initialPosts.filter(post => {
    if (!searchTerm) return true
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const featuredPost = filteredPosts[0]
  const regularPosts = filteredPosts.slice(1)

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
                      {post.reading_time && (
                        <div className="post-footer">
                          <span className="post-reading-time">{post.reading_time} min read</span>
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
