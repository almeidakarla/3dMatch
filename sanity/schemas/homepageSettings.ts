import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepageSettings',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'object',
      fields: [
        { name: 'line1', title: 'Line 1', type: 'string' },
        { name: 'line2', title: 'Line 2', type: 'string' },
        { name: 'line3', title: 'Line 3', type: 'string' },
      ],
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
    }),
    defineField({
      name: 'heroCtaPrimary',
      title: 'Hero Primary CTA Text',
      type: 'string',
    }),
    defineField({
      name: 'heroCtaSecondary',
      title: 'Hero Secondary CTA Text',
      type: 'string',
    }),
    defineField({
      name: 'heroAttribution',
      title: 'Hero Attribution Text',
      type: 'string',
    }),
    defineField({
      name: 'demoVideo',
      title: 'Demo Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'demoVideoThumbnail',
      title: 'Demo Video Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'demoVideoCaption',
      title: 'Demo Video Caption',
      type: 'text',
    }),
    defineField({
      name: 'finalCtaTitle',
      title: 'Final CTA Title',
      type: 'string',
    }),
    defineField({
      name: 'finalCtaSubtitle',
      title: 'Final CTA Subtitle',
      type: 'text',
    }),
    defineField({
      name: 'finalCtaButton',
      title: 'Final CTA Button Text',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Settings',
      }
    },
  },
})
