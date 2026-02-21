import createImageUrlBuilder from '@sanity/image-url'

const imageBuilder = createImageUrlBuilder({
  projectId: '9lvs5sql',
  dataset: 'production',
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlFor = (source: any) => {
  return imageBuilder.image(source)
}
