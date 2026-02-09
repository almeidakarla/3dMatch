import { client } from './client'
import {
  homepageDataQuery,
  blogPostsQuery,
  blogPostBySlugQuery,
  blogCategoriesQuery,
} from './queries'
import type { HomepageData, BlogPost, BlogCategory } from './types'

export async function getHomepageData(): Promise<HomepageData> {
  return client.fetch(
    homepageDataQuery,
    {},
    {
      next: { revalidate: 60 }, // Revalidate every minute
    }
  )
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    blogPostsQuery,
    {},
    {
      next: { revalidate: 60 },
    }
  )
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return client.fetch(
    blogPostBySlugQuery,
    { slug },
    {
      next: { revalidate: 60 },
    }
  )
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return client.fetch(
    blogCategoriesQuery,
    {},
    {
      next: { revalidate: 300 },
    }
  )
}
