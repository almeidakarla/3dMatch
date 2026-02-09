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
    <div style={{ height: '100vh', margin: 0 }}>{children}</div>
  )
}
