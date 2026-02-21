import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'

export const dynamic = 'force-dynamic'

const SANITY_PROJECT_ID = '9lvs5sql'
const SANITY_DATASET = 'production'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  image?: {
    asset: {
      _ref: string
    }
  }
  body?: Array<{
    _type: string
    children?: Array<{ text: string }>
  }>
}

function getImageUrl(ref: string): string {
  const [, id, dimensions, format] = ref.split('-')
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`
}

function renderBody(body?: Post['body']): string {
  if (!body) return ''
  return body
    .filter(block => block._type === 'block')
    .map(block => {
      const text = block.children?.map(child => child.text).join('') || ''
      return `<p>${text}</p>`
    })
    .join('')
}

async function getPost(slug: string): Promise<Post | null> {
  const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0] { _id, title, slug, publishedAt, image, body }`)
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data.result || null
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <PublicLayout>
      <div className="blog-post-container">
        <Link href="/blog" className="btn-back">
          ← Back to Blog
        </Link>

        <article className="blog-post">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <p className="post-date">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </header>

          {post.image?.asset?._ref && (
            <div className="post-featured-image">
              <img src={getImageUrl(post.image.asset._ref)} alt={post.title} />
            </div>
          )}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: renderBody(post.body) }}
          />
        </article>
      </div>
    </PublicLayout>
  )
}
