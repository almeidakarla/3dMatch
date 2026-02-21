import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const imageBuilder = createImageUrlBuilder({
  projectId: '9lvs5sql',
  dataset: 'production',
})

export const urlFor = (source: SanityImageSource) => {
  return imageBuilder.image(source)
}
