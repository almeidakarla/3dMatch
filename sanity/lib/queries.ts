import { groq } from 'next-sanity'

// Homepage queries
export const heroImagesQuery = groq`
  *[_type == "heroImage" && active == true] | order(order asc) {
    _id,
    title,
    image,
    alt,
    artistCredit,
    order
  }
`

export const portfolioCategoriesQuery = groq`
  *[_type == "portfolioCategory"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    order,
    "projects": *[_type == "portfolioProject" && references(^._id)] | order(order asc) {
      _id,
      title,
      image,
      artistName,
      order
    }
  }
`

export const featuredArtistsQuery = groq`
  *[_type == "featuredArtist" && active == true] | order(order asc) {
    _id,
    name,
    title,
    location,
    description,
    avatar,
    skills,
    portfolioImages,
    order
  }
`

export const platformFeaturesQuery = groq`
  *[_type == "platformFeature"] | order(order asc) {
    _id,
    title,
    description,
    image,
    alt,
    icon,
    order
  }
`

export const faqItemsQuery = groq`
  *[_type == "faqItem" && active == true] | order(order asc) {
    _id,
    question,
    answer,
    order
  }
`

export const homepageSettingsQuery = groq`
  *[_type == "homepageSettings"][0] {
    heroTitle,
    heroSubtitle,
    heroCtaPrimary,
    heroCtaSecondary,
    heroAttribution,
    "demoVideoUrl": demoVideo.asset->url,
    demoVideoThumbnail,
    demoVideoCaption,
    finalCtaTitle,
    finalCtaSubtitle,
    finalCtaButton
  }
`

// Combined query for all homepage data
export const homepageDataQuery = groq`{
  "heroImages": ${heroImagesQuery},
  "portfolioCategories": ${portfolioCategoriesQuery},
  "featuredArtists": ${featuredArtistsQuery},
  "platformFeatures": ${platformFeaturesQuery},
  "faqItems": ${faqItemsQuery},
  "settings": ${homepageSettingsQuery}
}`

// Blog queries
export const blogPostsQuery = groq`
  *[_type == "blogPost" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage,
    publishedAt,
    readingTime,
    author,
    authorImage,
    tags,
    categories[]-> {
      _id,
      name,
      "slug": slug.current
    }
  }
`

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage,
    content,
    publishedAt,
    readingTime,
    author,
    authorImage,
    tags,
    categories[]-> {
      _id,
      name,
      "slug": slug.current
    },
    seoTitle,
    seoDescription,
    "relatedPosts": *[_type == "blogPost" && status == "published" && slug.current != $slug && count(categories[@._ref in ^.^.categories[]._ref]) > 0] | order(publishedAt desc) [0...3] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      featuredImage,
      publishedAt
    }
  }
`

export const blogCategoriesQuery = groq`
  *[_type == "blogCategory"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description
  }
`
