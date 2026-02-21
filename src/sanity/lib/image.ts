import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

const imageBuilder = createImageUrlBuilder({
  projectId: '9lvs5sql',
  dataset: 'production',
})

export const urlFor = (source: Image) => {
  return imageBuilder.image(source)
}
