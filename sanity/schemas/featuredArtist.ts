import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'featuredArtist',
  title: 'Featured Artist',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Artist display name (e.g., "Lucas M.")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Professional title (e.g., "3D Architectural Visualizer")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City, Country (e.g., "São Paulo, Brazil")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short bio describing their expertise',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Software/skills (e.g., "3ds Max", "V-Ray")',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'portfolioImages',
      title: 'Portfolio Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Sample portfolio images (6 recommended)',
      validation: (Rule) => Rule.required().min(3).max(6),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in the carousel (lower numbers appear first)',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this artist appears in the carousel',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'avatar',
    },
  },
})
