import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Only create client if projectId is available
export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: process.env.NODE_ENV === 'production',
    })
  : null

const builder = projectId && client ? imageUrlBuilder(client) : null

// Chainable placeholder for when Sanity is not configured
const placeholderBuilder = {
  url: () => '/placeholder.jpg',
  width: () => placeholderBuilder,
  height: () => placeholderBuilder,
  quality: () => placeholderBuilder,
  fit: () => placeholderBuilder,
  auto: () => placeholderBuilder,
  format: () => placeholderBuilder,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  if (!builder) {
    return placeholderBuilder
  }
  return builder.image(source)
}
