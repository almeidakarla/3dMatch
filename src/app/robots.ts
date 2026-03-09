import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/studio/'],
      },
    ],
    sitemap: 'https://3dmatch.app/sitemap.xml',
  }
}
