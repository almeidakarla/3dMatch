import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import BlogPostClient from './BlogPostClient'

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

interface PageProps {
  params: Promise<{ slug: string }>
}

// Convert portable text to HTML
function portableTextToHtml(body?: SanityPost['body']): string {
  if (!body) return ''
  return body
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children?.map(child => child.text).join('') || ''
      return `<p>${text}</p>`
    })
    .join('\n')
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

// Generate static params for pre-rendering posts
export async function generateStaticParams() {
  try {
    const posts = await client.fetch<{ slug: { current: string } }[]>(
      `*[_type == "post"][0...20] { slug }`
    )
    return posts.map(post => ({ slug: post.slug.current }))
  } catch {
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const post = await client.fetch<SanityPost | null>(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      image,
      body
    }`,
    { slug }
  )

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const excerpt = getExcerpt(post.body)
  const imageUrl = post.image ? urlFor(post.image).width(1200).url() : undefined

  return {
    title: post.title,
    description: excerpt || `Read ${post.title} on 3dMatch Blog`,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: imageUrl ? [imageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params

  const post = await client.fetch<SanityPost | null>(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      image,
      body
    }`,
    { slug }
  )

  if (!post) {
    notFound()
  }

  const formattedPost: BlogPostData = {
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    content: portableTextToHtml(post.body),
    excerpt: getExcerpt(post.body),
    featured_image: post.image ? urlFor(post.image).width(1200).url() : undefined,
    published_at: post.publishedAt,
    reading_time: getReadingTime(post.body),
  }

  return <BlogPostClient post={formattedPost} />
}
