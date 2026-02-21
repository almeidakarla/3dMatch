'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'
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
}

interface BlogPostClientProps {
  post: BlogPostData
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const router = useRouter()

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
              <div className="post-meta-row">
                <span className="post-date"><Calendar size={16} /> {formatDate(post.published_at)}</span>
                {post.reading_time && <span className="post-reading-time"><Clock size={16} /> {post.reading_time} min read</span>}
              </div>
            </div>
            <h1 className="post-title">{post.title}</h1>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            <div className="post-author-row">
              <button className="btn-share" onClick={handleShare}><Share2 size={18} /> Share</button>
            </div>
          </header>

          {post.featured_image && <div className="post-featured-image"><img src={post.featured_image} alt={post.title} /></div>}

          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </PublicLayout>
  )
}
