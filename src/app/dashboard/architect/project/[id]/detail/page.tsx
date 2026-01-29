'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ArchitectProjectDetailPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to main project page - detail view is now integrated
    router.replace(`/dashboard/architect/project/${params.id}`)
  }, [params.id, router])

  return <div className="loading">Redirecting...</div>
}
