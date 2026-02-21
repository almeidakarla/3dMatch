import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: '9lvs5sql',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
})
