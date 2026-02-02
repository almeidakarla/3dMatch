import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/client'
import BlogPostClient from './BlogPostClient'

// Revalidate every 5 minutes for ISR
export const revalidate = 300

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

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for pre-rendering popular posts
// Returns empty array if env vars unavailable (falls back to dynamic rendering)
export async function generateStaticParams() {
  // Skip static generation if Supabase env vars aren't available at build time
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  try {
    const supabase = createStaticClient()

    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .limit(10)

    return (posts || []).map((post) => ({
      slug: post.slug,
    }))
  } catch {
    // If anything fails, fall back to dynamic rendering
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, seo_title, seo_description, seo_keywords, featured_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || `Read ${post.title} on 3dMatch Blog`,
    keywords: post.seo_keywords,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch main post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`*, author:profiles(full_name, profile_photo), blog_post_categories(category:blog_categories(id, name, slug)), blog_post_tags(tag:blog_tags(id, name, slug))`)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    notFound()
  }

  // Fetch related posts
  let relatedPosts: RelatedPost[] = []
  if (post.blog_post_categories?.[0]?.category?.id) {
    const { data: related } = await supabase
      .from('blog_posts')
      .select(`id, title, slug, excerpt, featured_image, blog_post_categories!inner(category_id)`)
      .eq('blog_post_categories.category_id', post.blog_post_categories[0].category.id)
      .eq('status', 'published')
      .neq('id', post.id)
      .limit(3)

    if (related) {
      relatedPosts = related as unknown as RelatedPost[]
    }
  }

  return <BlogPostClient post={post as unknown as BlogPostData} relatedPosts={relatedPosts} />
}
