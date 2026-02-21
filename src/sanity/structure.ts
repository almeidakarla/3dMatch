import type {StructureResolver} from 'sanity/structure'

// Custom structure for the Sanity Studio
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Landing Page as a singleton (direct edit, no list)
      S.listItem()
        .title('Landing Page')
        .id('landingPageSingleton')
        .child(
          S.document()
            .schemaType('landingPage')
            .documentId('4f81ae7c-ce5f-4381-a5f4-03b86ce148e4')
            .title('Edit Landing Page')
        ),

      S.divider(),

      // Blog Posts - show as a list
      S.documentTypeListItem('post').title('Blog Posts'),
    ])
