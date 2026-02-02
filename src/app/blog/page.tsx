import { createClient } from '@/lib/supabase/server'
import BlogListingClient from './BlogListingClient'

// Revalidate every 5 minutes for ISR
export const revalidate = 300

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

export default async function BlogListingPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`id, title, slug, excerpt, featured_image, published_at, reading_time, author:profiles(full_name), blog_post_tags(tag:blog_tags(name, slug))`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error loading blog posts:', error)
  }

  return <BlogListingClient initialPosts={(posts as unknown as BlogPost[]) || []} />
}
