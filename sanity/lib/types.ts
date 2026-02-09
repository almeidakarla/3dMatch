import type { PortableTextBlock } from '@portabletext/types'

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface HeroImage {
  _id: string
  title: string
  image: SanityImage
  alt: string
  artistCredit?: string
  order: number
}

export interface PortfolioProject {
  _id: string
  title: string
  image: SanityImage
  artistName?: string
  order: number
}

export interface PortfolioCategory {
  _id: string
  name: string
  slug: string
  order: number
  projects: PortfolioProject[]
}

export interface FeaturedArtist {
  _id: string
  name: string
  title: string
  location: string
  description: string
  avatar: SanityImage
  skills: string[]
  portfolioImages: SanityImage[]
  order: number
}

export interface PlatformFeature {
  _id: string
  title: string
  description: string
  image: SanityImage
  alt: string
  icon: 'dashboard' | 'checkmark' | 'lock' | 'lightning'
  order: number
}

export interface FaqItem {
  _id: string
  question: string
  answer: string
  order: number
}

export interface HomepageSettings {
  heroTitle?: {
    line1?: string
    line2?: string
    line3?: string
  }
  heroSubtitle?: string
  heroCtaPrimary?: string
  heroCtaSecondary?: string
  heroAttribution?: string
  demoVideoUrl?: string
  demoVideoThumbnail?: SanityImage
  demoVideoCaption?: string
  finalCtaTitle?: string
  finalCtaSubtitle?: string
  finalCtaButton?: string
}

export interface HomepageData {
  heroImages: HeroImage[]
  portfolioCategories: PortfolioCategory[]
  featuredArtists: FeaturedArtist[]
  platformFeatures: PlatformFeature[]
  faqItems: FaqItem[]
  settings: HomepageSettings | null
}

// Blog types
export interface BlogCategory {
  _id: string
  name: string
  slug: string
  description?: string
}

export interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: SanityImage
  content?: PortableTextBlock[]
  publishedAt: string
  readingTime?: number
  author?: string
  authorImage?: SanityImage
  tags?: string[]
  categories?: BlogCategory[]
  seoTitle?: string
  seoDescription?: string
  relatedPosts?: BlogPost[]
}
