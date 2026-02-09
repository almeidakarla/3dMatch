import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'portfolioProject',
  title: 'Portfolio Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Project title (e.g., "Modern Villa")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'portfolioCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the category (lower numbers appear first)',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'artistName',
      title: 'Artist Name',
      type: 'string',
      description: 'Name of the artist who created this render',
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
      categoryName: 'category.name',
    },
    prepare({ title, media, categoryName }) {
      return {
        title,
        subtitle: categoryName,
        media,
      }
    },
  },
})
