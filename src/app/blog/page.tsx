import { urlFor } from '@/sanity/lib/image'
import BlogListingClient from './BlogListingClient'

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'

const SANITY_PROJECT_ID = '9lvs5sql'
const SANITY_DATASET = 'production'

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
  let formattedPosts: BlogPost[] = []

  try {
    const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc)[0...20] {
      _id,
      title,
      slug,
      publishedAt,
      image,
      body
    }`)

    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`

    const response = await fetch(url, {
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`)
    }

    const data = await response.json()
    const posts: SanityPost[] = data.result || []

    if (posts.length > 0) {
      formattedPosts = posts.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug?.current || '',
        excerpt: getExcerpt(post.body),
        featured_image: post.image ? urlFor(post.image).width(800).url() : undefined,
        published_at: post.publishedAt,
        reading_time: getReadingTime(post.body),
      }))
    }
  } catch (e) {
    console.error('Error fetching Sanity posts:', e)
  }

  return <BlogListingClient initialPosts={formattedPosts} />
}
