import { client } from './client'
import {
  homepageDataQuery,
  blogPostsQuery,
  blogPostBySlugQuery,
  blogCategoriesQuery,
} from './queries'
import type { HomepageData, BlogPost, BlogCategory } from './types'

const emptyHomepageData: HomepageData = {
  heroImages: [],
  portfolioCategories: [],
  featuredArtists: [],
  platformFeatures: [],
  faqItems: [],
  settings: null,
}

export async function getHomepageData(): Promise<HomepageData> {
  if (!client) return emptyHomepageData

  return client.fetch(
    homepageDataQuery,
    {},
    {
      next: { revalidate: 60 }, // Revalidate every minute
    }
  )
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!client) return []

  return client.fetch(
    blogPostsQuery,
    {},
    {
      next: { revalidate: 60 },
    }
  )
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!client) return null

  return client.fetch(
    blogPostBySlugQuery,
    { slug },
    {
      next: { revalidate: 60 },
    }
  )
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (!client) return []

  return client.fetch(
    blogCategoriesQuery,
    {},
    {
      next: { revalidate: 300 },
    }
  )
}
