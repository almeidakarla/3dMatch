/**
 * HOME PAGE (/) — Server Component that fetches landing page content from Sanity
 */

import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import LandingPage from '@/components/landing/LandingPage'

// Query for the singleton landing page document
const LANDING_PAGE_QUERY = `*[_type == "landingPage"][0]{
  // Hero Section
  heroImages,
  heroTitleLine1,
  heroTitleLine2,
  heroTitleLine3,
  heroSubtitle,
  heroAttribution,
  heroPrimaryCta,
  heroSecondaryCta,

  // Results Section
  resultsTitle,
  resultsIntro,
  resultsBenefits,
  "resultsVideoUrl": resultsVideo.asset->url,
  resultsVideoPoster,
  resultsVideoTitle,
  resultsVideoCaption,
  resultsCta,

  // How It Works
  howItWorksTitle,
  howItWorksSteps,
  howItWorksImages,

  // Benefits Section
  benefitsTitle,
  benefitsCards,
  benefitsCta,

  // Platform Features
  platformFeatures,

  // Featured Artists
  artistsTitle,
  artistsSubtitle,
  featuredArtists,

  // FAQ
  faqTitle,
  faqItems,

  // Final CTA
  finalCtaTitle,
  finalCtaSubtitle,
  finalCtaButton,

  // Footer
  footerSubscribeTitle,
  footerSubscribeText,
  footerCopyright,
  socialTwitter,
  socialInstagram,
  socialLinkedIn,
}`

const options = { next: { revalidate: 60 } }

// Helper to transform Sanity image to optimized WebP URL
function transformImages(data: any) {
  if (!data) return null

  return {
    ...data,
    // Transform hero images - large, high quality for background
    heroImages: data.heroImages?.map((img: any) =>
      urlFor(img)?.format('webp').quality(80).width(1920).url()
    ) || [],

    // Transform results video poster
    resultsVideoPosterUrl: data.resultsVideoPoster
      ? urlFor(data.resultsVideoPoster)?.format('webp').quality(80).width(1280).url()
      : null,

    // Transform How It Works showcase images (vertical, portrait orientation)
    howItWorksImages: data.howItWorksImages?.map((img: any) =>
      urlFor(img)?.format('webp').quality(85).width(600).height(750).url()
    ) || [],

    // Transform platform features images
    platformFeatures: data.platformFeatures?.map((feature: any) => ({
      ...feature,
      imageUrl: feature.image
        ? urlFor(feature.image)?.format('webp').quality(80).width(800).url()
        : null,
    })) || [],

    // Transform featured artists
    featuredArtists: data.featuredArtists?.map((artist: any) => ({
      ...artist,
      avatarUrl: artist.avatar
        ? urlFor(artist.avatar)?.format('webp').quality(80).width(200).url()
        : null,
      portfolioUrls: artist.portfolio?.map((img: any) =>
        urlFor(img)?.format('webp').quality(80).width(400).url()
      ) || [],
    })) || [],
  }
}

export default async function HomePage() {
  const rawData = await client.fetch(LANDING_PAGE_QUERY, {}, options)
  const landingData = transformImages(rawData)

  return <LandingPage data={landingData} />
}
