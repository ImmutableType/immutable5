'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDirectWallet } from '../../lib/hooks/useDirectWallet'

export default function HomePage() {
  const router = useRouter()
  const { address, isConnected } = useDirectWallet()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAndRoute() {
      if (!isConnected || !address) {
        router.push('/profile/create')
        return
      }

      try {
        setChecking(true)
        const { profileNFTService } = await import('../../lib/services/profile/ProfileNFT')
        await profileNFTService.initializeReadOnly()
        
        const hasProfile = await profileNFTService.hasProfile(address)
        
        if (hasProfile) {
          const profileData = await profileNFTService.getProfileByAddress(address)
          if (profileData?.profileId) {
            router.push(`/profile/${profileData.profileId}`)
            return
          }
        }
        
        router.push('/profile/create')
        
      } catch (error) {
        console.error('Profile check failed:', error)
        router.push('/profile/create')
      } finally {
        setChecking(false)
      }
    }

    checkAndRoute()
  }, [isConnected, address, router])

  return (
    <div className="profile-container profile-centered">
      <div className="profile-card">
        <h1 className="profile-title">ImmutableType</h1>
        <p className="profile-subtitle">
          {checking ? 'Checking your profile...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}