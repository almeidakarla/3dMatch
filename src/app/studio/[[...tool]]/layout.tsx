export const metadata = {
  title: '3dMatch CMS Studio',
  description: 'Content management for 3dMatch',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
