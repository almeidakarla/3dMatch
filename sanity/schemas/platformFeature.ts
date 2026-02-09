import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'platformFeature',
  title: 'Platform Feature',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Feature title (e.g., "Your workspace for architectural visualization")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Feature description',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Feature Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Screenshot or illustration of the feature',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Image Alt Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon Type',
      type: 'string',
      options: {
        list: [
          { title: 'Dashboard', value: 'dashboard' },
          { title: 'Checkmark', value: 'checkmark' },
          { title: 'Lock', value: 'lock' },
          { title: 'Lightning', value: 'lightning' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in the tabs (lower numbers appear first)',
      validation: (Rule) => Rule.required().integer().min(0),
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
      title: 'title',
      media: 'image',
      order: 'order',
    },
    prepare({ title, media, order }) {
      return {
        title: `${order}. ${title}`,
        media,
      }
    },
  },
})
