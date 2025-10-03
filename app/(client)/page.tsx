'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile creation for now
    router.push('/profile/create')
  }, [router])

  return (
    <div className="profile-container profile-centered">
      <div className="profile-card">
        <h1 className="profile-title">ImmutableType</h1>
        <p className="profile-subtitle">Redirecting...</p>
      </div>
    </div>
  )
}