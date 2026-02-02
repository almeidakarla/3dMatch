'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

interface BlogPostData {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  published_at: string
  reading_time?: number
  views_count: number
  author?: { full_name: string; profile_photo?: string }
  blog_post_categories?: { category: { id: string; name: string; slug: string } }[]
  blog_post_tags?: { tag: { id: string; name: string; slug: string } }[]
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
}

interface BlogPostClientProps {
  post: BlogPostData
  relatedPosts: RelatedPost[]
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // Increment view count on client-side mount
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        const { error: rpcError } = await supabase.rpc('increment', { row_id: post.id, table_name: 'blog_posts', column_name: 'views_count' })
        if (rpcError) {
          await supabase.from('blog_posts').update({ views_count: (post.views_count || 0) + 1 }).eq('id', post.id)
        }
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    }
    incrementViewCount()
  }, [post.id, post.views_count, supabase])

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt || post.title, url })
      } catch { /* User cancelled */ }
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <PublicLayout>
      <div className="blog-post-container">
        <button className="btn-back" onClick={() => router.push('/blog')}><ArrowLeft size={20} /> Back to Blog</button>

        <article className="blog-post">
          <header className="post-header">
            <div className="post-meta-top">
              {post.blog_post_categories?.[0]?.category && (
                <Link href={`/blog/category/${post.blog_post_categories[0].category.slug}`} className="post-category">
                  {post.blog_post_categories[0].category.name}
                </Link>
              )}
              <div className="post-meta-row">
                <span className="post-date"><Calendar size={16} /> {formatDate(post.published_at)}</span>
                {post.reading_time && <span className="post-reading-time"><Clock size={16} /> {post.reading_time} min read</span>}
              </div>
            </div>
            <h1 className="post-title">{post.title}</h1>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            <div className="post-author-row">
              <div className="post-author">
                {post.author?.profile_photo && <img src={post.author.profile_photo} alt={post.author.full_name} className="author-photo" />}
                <div><span className="author-label">Written by</span><span className="author-name">{post.author?.full_name || 'Anonymous'}</span></div>
              </div>
              <button className="btn-share" onClick={handleShare}><Share2 size={18} /> Share</button>
            </div>
          </header>

          {post.featured_image && <div className="post-featured-image"><img src={post.featured_image} alt={post.title} /></div>}

          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {post.blog_post_tags && post.blog_post_tags.length > 0 && (
            <div className="post-tags-section">
              <h3>Tags</h3>
              <div className="post-tags">
                {post.blog_post_tags.map((pt, index) => (
                  <Link key={index} href={`/blog/tag/${pt.tag.slug}`} className="post-tag"><Tag size={14} /> {pt.tag.name}</Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {relatedPosts.length > 0 && (
          <section className="related-posts-section">
            <h2 className="section-title">Related Articles</h2>
            <div className="related-posts-grid">
              {relatedPosts.map(relatedPost => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="related-post-card">
                  {relatedPost.featured_image && <div className="related-post-image"><img src={relatedPost.featured_image} alt={relatedPost.title} /></div>}
                  <div className="related-post-content">
                    <h3>{relatedPost.title}</h3>
                    {relatedPost.excerpt && <p>{relatedPost.excerpt.substring(0, 100)}...</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  )
}
