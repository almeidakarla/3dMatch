import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'

export const dynamic = 'force-dynamic'

const SANITY_PROJECT_ID = '9lvs5sql'
const SANITY_DATASET = 'production'

interface BlockChild {
  _type: string
  text?: string
  marks?: string[]
}

interface Block {
  _type: string
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: BlockChild[]
  markDefs?: Array<{ _key: string; _type: string; href?: string }>
}

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
  body?: Block[]
}

function getImageUrl(ref: string): string {
  const [, id, dimensions, format] = ref.split('-')
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`
}

function renderChildren(children: BlockChild[] | undefined, markDefs: Block['markDefs']): string {
  if (!children) return ''
  return children.map(child => {
    let text = child.text || ''
    if (child.marks && child.marks.length > 0) {
      child.marks.forEach(mark => {
        if (mark === 'strong') {
          text = `<strong>${text}</strong>`
        } else if (mark === 'em') {
          text = `<em>${text}</em>`
        } else if (mark === 'code') {
          text = `<code>${text}</code>`
        } else if (mark === 'underline') {
          text = `<u>${text}</u>`
        } else if (mark === 'strike-through') {
          text = `<s>${text}</s>`
        } else {
          // Check if it's a link
          const linkDef = markDefs?.find(def => def._key === mark)
          if (linkDef && linkDef._type === 'link' && linkDef.href) {
            text = `<a href="${linkDef.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
          }
        }
      })
    }
    return text
  }).join('')
}

function renderBody(body?: Block[]): string {
  if (!body) return ''

  let html = ''
  let currentListType: string | null = null

  body.forEach((block, index) => {
    if (block._type !== 'block') return

    const content = renderChildren(block.children, block.markDefs)
    const isListItem = block.listItem === 'bullet' || block.listItem === 'number'
    const listTag = block.listItem === 'number' ? 'ol' : 'ul'

    // Handle list opening
    if (isListItem && currentListType !== listTag) {
      if (currentListType) html += `</${currentListType}>`
      html += `<${listTag}>`
      currentListType = listTag
    }

    // Handle list closing
    if (!isListItem && currentListType) {
      html += `</${currentListType}>`
      currentListType = null
    }

    // Render the block
    if (isListItem) {
      html += `<li>${content}</li>`
    } else {
      switch (block.style) {
        case 'h1':
          html += `<h1>${content}</h1>`
          break
        case 'h2':
          html += `<h2>${content}</h2>`
          break
        case 'h3':
          html += `<h3>${content}</h3>`
          break
        case 'h4':
          html += `<h4>${content}</h4>`
          break
        case 'h5':
          html += `<h5>${content}</h5>`
          break
        case 'h6':
          html += `<h6>${content}</h6>`
          break
        case 'blockquote':
          html += `<blockquote>${content}</blockquote>`
          break
        default:
          if (content.trim()) {
            html += `<p>${content}</p>`
          }
      }
    }
  })

  // Close any remaining list
  if (currentListType) {
    html += `</${currentListType}>`
  }

  return html
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
      <div className="blog-page-wrapper">
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
      </div>
    </PublicLayout>
  )
}
