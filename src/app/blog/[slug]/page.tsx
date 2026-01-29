'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
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

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadPost = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, author:profiles(full_name, profile_photo), blog_post_categories(category:blog_categories(id, name, slug)), blog_post_tags(tag:blog_tags(id, name, slug))`)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setPost(data as unknown as BlogPostData)

      // Increment view count
      const { error: rpcError } = await supabase.rpc('increment', { row_id: data.id, table_name: 'blog_posts', column_name: 'views_count' })
      if (rpcError) {
        await supabase.from('blog_posts').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id)
      }

      // Load related posts
      if (data.blog_post_categories?.[0]?.category?.id) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select(`*, blog_post_categories!inner(category_id)`)
          .eq('blog_post_categories.category_id', data.blog_post_categories[0].category.id)
          .eq('status', 'published')
          .neq('id', data.id)
          .limit(3)
        if (related) setRelatedPosts(related as unknown as RelatedPost[])
      }
    } catch (error) {
      console.error('Error loading post:', error)
    } finally {
      setLoading(false)
    }
  }, [slug, supabase])

  useEffect(() => {
    loadPost()
    window.scrollTo(0, 0)
  }, [loadPost])

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, text: post?.excerpt || post?.title, url })
      } catch { /* User cancelled */ }
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) return <div className="loading">Loading post...</div>

  if (!post) {
    return (
      <PublicLayout>
        <div className="error-state"><h2>Post not found</h2><Link href="/blog" className="btn-primary">Back to Blog</Link></div>
      </PublicLayout>
    )
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
