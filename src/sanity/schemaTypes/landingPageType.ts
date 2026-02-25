import {defineField, defineType, defineArrayMember} from 'sanity'

// Benefit Card object type
const benefitCard = defineType({
  name: 'benefitCard',
  title: 'Benefit Card',
  type: 'object',
  fields: [
    defineField({
      name: 'iconType',
      title: 'Icon Type',
      type: 'string',
      options: {
        list: [
          {title: 'Location Pin', value: 'location'},
          {title: 'Star', value: 'star'},
          {title: 'Checkmark', value: 'checkmark'},
          {title: 'Lock', value: 'lock'},
          {title: 'Lightning', value: 'lightning'},
          {title: 'Dashboard', value: 'dashboard'},
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'colorTheme',
      title: 'Color Theme',
      type: 'string',
      options: {
        list: [
          {title: 'Purple', value: 'benefit-purple'},
          {title: 'Blue', value: 'benefit-blue'},
          {title: 'Light Blue', value: 'benefit-blue-light'},
        ],
      },
      initialValue: 'benefit-purple',
    }),
  ],
})

// Step object type
const stepItem = defineType({
  name: 'stepItem',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
  ],
})

// Platform Feature object type
const platformFeature = defineType({
  name: 'platformFeature',
  title: 'Platform Feature',
  type: 'object',
  fields: [
    defineField({
      name: 'iconType',
      title: 'Icon Type',
      type: 'string',
      options: {
        list: [
          {title: 'Dashboard', value: 'dashboard'},
          {title: 'Checkmark', value: 'checkmark'},
          {title: 'Lock', value: 'lock'},
          {title: 'Lightning', value: 'lightning'},
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Feature Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'alt',
      title: 'Image Alt Text',
      type: 'string',
    }),
  ],
})

// Portfolio Project object type
const portfolioProject = defineType({
  name: 'portfolioProject',
  title: 'Portfolio Project',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Project Image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
})

// Portfolio Category object type
const portfolioCategory = defineType({
  name: 'portfolioCategory',
  title: 'Portfolio Category',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{type: 'portfolioProject'}],
    }),
  ],
})

// Featured Artist object type
const featuredArtist = defineType({
  name: 'featuredArtist',
  title: 'Featured Artist',
  type: 'object',
  fields: [
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title/Role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'portfolio',
      title: 'Portfolio Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
  ],
})

// FAQ Item object type
const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
  ],
})

// Main Landing Page document type
export const landingPageType = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'results', title: 'Results Section'},
    {name: 'howItWorks', title: 'How It Works'},
    {name: 'benefits', title: 'Benefits Section'},
    {name: 'platform', title: 'Platform Features'},
    {name: 'portfolio', title: 'Portfolio Showcase'},
    {name: 'artists', title: 'Featured Artists'},
    {name: 'faq', title: 'FAQ'},
    {name: 'cta', title: 'Final CTA'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    // ===== HERO SECTION =====
    defineField({
      name: 'heroImages',
      title: 'Hero Background Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      group: 'hero',
      description: 'Carousel images for the hero section background',
    }),
    defineField({
      name: 'heroTitleLine1',
      title: 'Hero Title Line 1',
      type: 'string',
      group: 'hero',
      initialValue: 'High end',
    }),
    defineField({
      name: 'heroTitleLine2',
      title: 'Hero Title Line 2',
      type: 'string',
      group: 'hero',
      initialValue: 'architectural renders',
    }),
    defineField({
      name: 'heroTitleLine3',
      title: 'Hero Title Line 3',
      type: 'string',
      group: 'hero',
      initialValue: 'that sell your project.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      group: 'hero',
    }),
    defineField({
      name: 'heroAttribution',
      title: 'Hero Attribution',
      type: 'string',
      group: 'hero',
      initialValue: 'Render created by a 3dMatch artist.',
    }),
    defineField({
      name: 'heroPrimaryCta',
      title: 'Primary CTA Button Text',
      type: 'string',
      group: 'hero',
      initialValue: 'Get Started',
    }),
    defineField({
      name: 'heroSecondaryCta',
      title: 'Secondary CTA Button Text',
      type: 'string',
      group: 'hero',
      initialValue: 'Learn More',
    }),

    // ===== RESULTS SECTION =====
    defineField({
      name: 'resultsTitle',
      title: 'Section Title',
      type: 'string',
      group: 'results',
    }),
    defineField({
      name: 'resultsIntro',
      title: 'Introduction Text',
      type: 'text',
      group: 'results',
    }),
    defineField({
      name: 'resultsBenefits',
      title: 'Benefit Cards',
      type: 'array',
      of: [{type: 'benefitCard'}],
      group: 'results',
    }),
    defineField({
      name: 'resultsVideo',
      title: 'Showcase Video',
      type: 'file',
      options: {accept: 'video/*'},
      group: 'results',
    }),
    defineField({
      name: 'resultsVideoPoster',
      title: 'Video Poster/Thumbnail',
      type: 'image',
      group: 'results',
    }),
    defineField({
      name: 'resultsVideoTitle',
      title: 'Video Section Title',
      type: 'string',
      group: 'results',
      initialValue: 'See It In Action',
    }),
    defineField({
      name: 'resultsVideoCaption',
      title: 'Video Caption',
      type: 'text',
      group: 'results',
    }),
    defineField({
      name: 'resultsCta',
      title: 'CTA Button Text',
      type: 'string',
      group: 'results',
    }),

    // ===== HOW IT WORKS SECTION =====
    defineField({
      name: 'howItWorksTitle',
      title: 'Section Title',
      type: 'string',
      group: 'howItWorks',
      initialValue: 'How It Works',
    }),
    defineField({
      name: 'howItWorksSteps',
      title: 'Steps',
      type: 'array',
      of: [{type: 'stepItem'}],
      group: 'howItWorks',
    }),
    defineField({
      name: 'howItWorksImages',
      title: 'Showcase Images (Vertical)',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      group: 'howItWorks',
      description: 'Vertical portfolio images that display alongside the steps. Add one image per step.',
    }),

    // ===== BENEFITS SECTION =====
    defineField({
      name: 'benefitsTitle',
      title: 'Section Title',
      type: 'string',
      group: 'benefits',
      initialValue: 'Why 3dMatch',
    }),
    defineField({
      name: 'benefitsCards',
      title: 'Benefit Cards',
      type: 'array',
      of: [{type: 'benefitCard'}],
      group: 'benefits',
    }),
    defineField({
      name: 'benefitsCta',
      title: 'CTA Button Text',
      type: 'string',
      group: 'benefits',
    }),

    // ===== PLATFORM FEATURES SECTION =====
    defineField({
      name: 'platformFeatures',
      title: 'Platform Features',
      type: 'array',
      of: [{type: 'platformFeature'}],
      group: 'platform',
    }),

    // ===== PORTFOLIO SHOWCASE SECTION =====
    defineField({
      name: 'portfolioTitle',
      title: 'Section Title',
      type: 'string',
      group: 'portfolio',
      initialValue: 'Portfolio Showcase',
    }),
    defineField({
      name: 'portfolioSubtitle',
      title: 'Section Subtitle',
      type: 'text',
      group: 'portfolio',
    }),
    defineField({
      name: 'portfolioCategories',
      title: 'Portfolio Categories',
      type: 'array',
      of: [{type: 'portfolioCategory'}],
      group: 'portfolio',
    }),

    // ===== FEATURED ARTISTS SECTION =====
    defineField({
      name: 'artistsTitle',
      title: 'Section Title',
      type: 'string',
      group: 'artists',
      initialValue: 'Meet Our 3D Artists',
    }),
    defineField({
      name: 'artistsSubtitle',
      title: 'Section Subtitle',
      type: 'text',
      group: 'artists',
    }),
    defineField({
      name: 'featuredArtists',
      title: 'Featured Artists',
      type: 'array',
      of: [{type: 'featuredArtist'}],
      group: 'artists',
    }),

    // ===== FAQ SECTION =====
    defineField({
      name: 'faqTitle',
      title: 'Section Title',
      type: 'string',
      group: 'faq',
      initialValue: 'Frequently Asked Questions',
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      of: [{type: 'faqItem'}],
      group: 'faq',
    }),

    // ===== FINAL CTA SECTION =====
    defineField({
      name: 'finalCtaTitle',
      title: 'CTA Title',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'finalCtaSubtitle',
      title: 'CTA Subtitle',
      type: 'text',
      group: 'cta',
    }),
    defineField({
      name: 'finalCtaButton',
      title: 'CTA Button Text',
      type: 'string',
      group: 'cta',
    }),

    // ===== FOOTER =====
    defineField({
      name: 'footerSubscribeTitle',
      title: 'Subscribe Title',
      type: 'string',
      group: 'footer',
      initialValue: 'Stay Updated',
    }),
    defineField({
      name: 'footerSubscribeText',
      title: 'Subscribe Text',
      type: 'text',
      group: 'footer',
    }),
    defineField({
      name: 'footerCopyright',
      title: 'Copyright Text',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'socialTwitter',
      title: 'Twitter URL',
      type: 'url',
      group: 'footer',
    }),
    defineField({
      name: 'socialInstagram',
      title: 'Instagram URL',
      type: 'url',
      group: 'footer',
    }),
    defineField({
      name: 'socialLinkedIn',
      title: 'LinkedIn URL',
      type: 'url',
      group: 'footer',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Landing Page',
        subtitle: 'Main website landing page content',
      }
    },
  },
})

// Export all types
export const landingPageSchemaTypes = [
  landingPageType,
  benefitCard,
  stepItem,
  platformFeature,
  portfolioProject,
  portfolioCategory,
  featuredArtist,
  faqItem,
]
