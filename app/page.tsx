'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile creation page
    router.push('/profile/create')
  }, [router])

  return (
    <div className="profile-container profile-centered">
      <div className="profile-card">
        <div className="loading-container">
          <div className="profile-title">ImmutableType</div>
          <p>Redirecting...</p>
        </div>
      </div>
    </div>
  )
}