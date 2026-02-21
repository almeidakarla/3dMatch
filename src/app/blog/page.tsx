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
}

function getImageUrl(ref: string): string {
  // Convert Sanity image reference to URL
  // Format: image-{id}-{dimensions}-{format}
  const [, id, dimensions, format] = ref.split('-')
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`
}

async function getPosts(): Promise<Post[]> {
  const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) { _id, title, slug, publishedAt, image }`)
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    console.error('Failed to fetch posts:', res.status)
    return []
  }

  const data = await res.json()
  return data.result || []
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <PublicLayout>
      <div className="blog-listing-container">
        <div className="blog-header">
          <h1 className="blog-title">3dMatch Blog</h1>
          <p className="blog-subtitle">Insights, tips, and inspiration for 3D artists and design professionals</p>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts found</h3>
            <p>Check back soon for new content</p>
          </div>
        ) : (
          <div className="blog-posts-grid">
            {posts.map(post => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="blog-post-card">
                {post.image?.asset?._ref && (
                  <div className="post-card-image">
                    <img src={getImageUrl(post.image.asset._ref)} alt={post.title} />
                  </div>
                )}
                <div className="post-card-content">
                  <h3 className="post-card-title">{post.title}</h3>
                  <p className="post-date">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
