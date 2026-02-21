import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import BlogListingClient from './BlogListingClient'

// Revalidate every 5 minutes for ISR
export const revalidate = 300

interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  image?: { asset: { _ref: string } }
  body?: Array<{ _type: string; children?: Array<{ text: string }> }>
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  reading_time?: number
}

// Extract text excerpt from portable text body
function getExcerpt(body?: SanityPost['body'], maxLength = 160): string {
  if (!body) return ''
  const text = body
    .filter(block => block._type === 'block')
    .flatMap(block => block.children?.map(child => child.text) || [])
    .join(' ')
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Estimate reading time based on word count
function getReadingTime(body?: SanityPost['body']): number {
  if (!body) return 1
  const text = body
    .filter(block => block._type === 'block')
    .flatMap(block => block.children?.map(child => child.text) || [])
    .join(' ')
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

export default async function BlogListingPage() {
  const posts = await client.fetch<SanityPost[]>(
    `*[_type == "post"] | order(publishedAt desc)[0...20] {
      _id,
      title,
      slug,
      publishedAt,
      image,
      body
    }`
  )

  const formattedPosts: BlogPost[] = posts.map(post => ({
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    excerpt: getExcerpt(post.body),
    featured_image: post.image ? urlFor(post.image).width(800).url() : undefined,
    published_at: post.publishedAt,
    reading_time: getReadingTime(post.body),
  }))

  return <BlogListingClient initialPosts={formattedPosts} />
}
