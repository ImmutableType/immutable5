'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDirectWallet } from '../../../lib/hooks/useDirectWallet'

export default function Navigation() {
  const { address, isConnected, connectWallet } = useDirectWallet()
  const [profileId, setProfileId] = useState<string | null>(null)

  // Get user's profile ID when wallet connects
  useEffect(() => {
    async function loadProfileId() {
      if (!isConnected || !address) {
        setProfileId(null)
        return
      }

      try {
        const { profileNFTService } = await import('../../../lib/services/profile/ProfileNFT')
        await profileNFTService.initializeReadOnly()
        
        const hasProfile = await profileNFTService.hasProfile(address)
        
        if (hasProfile) {
          const profileData = await profileNFTService.getProfileByAddress(address)
          if (profileData?.profileId) {
            setProfileId(profileData.profileId)
          }
        }
      } catch (error) {
        console.error('Failed to load profile ID:', error)
      }
    }

    loadProfileId()
  }, [isConnected, address])

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  return (
    <nav className="immutable-nav">
      <Link href="/" className="nav-logo">
        <h1>ImmutableType</h1>
      </Link>

      <div style={{ flex: 1 }} />

      <Link href="/about" className="nav-about-link">
        <span className="nav-about-icon">ℹ️</span>
        <span>About</span>
      </Link>

      {isConnected && profileId && (
        <Link href={`/profile/${profileId}`} className="nav-profile-link">
          <span className="nav-profile-icon">👤</span>
          <span>My Profile</span>
        </Link>
      )}

      <div className="nav-wallet">
        {isConnected && address ? (
          <div className="wallet-connected">
            <span className="connection-dot">🟢</span>
            <span className="wallet-address">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn-connect">
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  )
}