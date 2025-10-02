'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { profileNFTService } from '../../../lib/services/profile/ProfileNFT'
import ProfileTabSystem from '../../../app/components/ui/tabs/ProfileTabSystem'
import { BookmarkCollectionManager } from '../../../app/components/features/bookmarks/BookmarkCollection'
import { MintedBookmarks } from '../../../app/components/features/bookmarks/MintedBookmarks'
import BuyBuffaflow from '../../../app/components/features/buffaflow/BuyBuffaflow'
import { Modal } from '../../../app/components/ui/Modal'
import { GlobalFeedTrigger } from '../../../app/components/features/bookmarks/GlobalFeedTrigger'
import { GlobalBookmarkFeed } from '../../../app/components/features/bookmarks/GlobalBookmarkFeed'

interface ProfileDisplayData {
  tier: number
  did: string
  displayName: string
  bio: string
  location: string
  avatarUrl: string
  createdAt: number
  isActive: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  
  const [profile, setProfile] = useState<ProfileDisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [checkingOwnership, setCheckingOwnership] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showGlobalFeed, setShowGlobalFeed] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use read-only mode for public profile viewing
      await profileNFTService.initializeReadOnly()
      
      const profileData = await profileNFTService.getProfile(profileId)
      
      setProfile(profileData)
      
    } catch (err: unknown) {
      console.error('Error loading profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  const checkOwnership = useCallback(async () => {
    try {
      setCheckingOwnership(true)
      
      // Check if accounts are already connected, don't request new ones
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' }) || []
      
      if (accounts.length > 0) {
        // Only initialize if already connected
        await profileNFTService.initialize()
        const ownershipResult = await profileNFTService.isProfileOwner(profileId)
        setIsOwner(ownershipResult)
        
        const currentAddress = await profileNFTService.getCurrentAddress()
        setWalletAddress(currentAddress)
      } else {
        // Not connected - don't trigger connection modal
        setIsOwner(false)
        setWalletAddress(null)
      }
      
    } catch (error) {
      console.log('Wallet not connected, viewing in public mode')
      setIsOwner(false)
      setWalletAddress(null)
    } finally {
      setCheckingOwnership(false)
    }
  }, [profileId])

  useEffect(() => {
    loadProfile()
    checkOwnership()
  }, [loadProfile, checkOwnership])

  if (loading) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <div className="loading-container">Loading identity profile...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h2 className="profile-title">Profile Not Found</h2>
          <div className="alert alert-error">
            <div className="alert-title">Error Loading Profile</div>
            <div className="alert-subtitle">{error}</div>
          </div>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', marginTop: '1rem' }}>
            Profile ID: {profileId}
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <div className="loading-container">No profile data available</div>
        </div>
      </div>
    )
  }

  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 0: return { name: 'Basic Identity', color: 'var(--color-slate-600)', icon: '🏷️' }
      case 1: return { name: 'Social Verified', color: 'var(--color-primary-600)', icon: '🌐' }
      case 2: return { name: 'KYC Verified', color: 'var(--color-emerald-600)', icon: '✅' }
      case 3: return { name: 'Anonymous Verified', color: 'var(--color-amber-600)', icon: '🔒' }
      default: return { name: 'Enhanced', color: 'var(--color-primary-700)', icon: '⭐' }
    }
  }

  const tierInfo = getTierInfo(profile.tier)

  // Overview Tab Content (existing profile display)
  const overviewContent = (
    <div>
      {/* Profile Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        
        {/* Personal Information */}
        <div>
          <h3 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: '600', 
            color: 'var(--color-text-primary)',
            marginBottom: '1rem'
          }}>
            Personal Information
          </h3>
          
          {profile.bio && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--text-sm)', 
                fontWeight: '500',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.5rem'
              }}>
                Bio
              </label>
              <p style={{ 
                color: 'var(--color-text-primary)',
                lineHeight: '1.6',
                fontSize: 'var(--text-base)'
              }}>
                {profile.bio}
              </p>
            </div>
          )}

          {profile.location && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: 'var(--text-sm)', 
                fontWeight: '500',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.5rem'
              }}>
                Location
              </label>
              <p style={{ 
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)'
              }}>
                📍 {profile.location}
              </p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'var(--text-sm)', 
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Status
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%',
                background: profile.isActive ? 'var(--color-emerald-500)' : 'var(--color-red-500)'
              }}></span>
              <span style={{ 
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                fontWeight: '500'
              }}>
                {profile.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div>
          <h3 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: '600', 
            color: 'var(--color-text-primary)',
            marginBottom: '1rem'
          }}>
            Identity Details
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'var(--text-sm)', 
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Decentralized Identifier (DID)
            </label>
            <div style={{
              background: 'var(--color-slate-50)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              wordBreak: 'break-all',
              lineHeight: '1.4',
              color: 'var(--color-text-primary)'
            }}>
              {profile.did}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'var(--text-sm)', 
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Profile Created
            </label>
            <p style={{ 
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-base)'
            }}>
              📅 {new Date(profile.createdAt * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div style={{
            background: 'var(--color-primary-50)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--color-primary-200)'
          }}>
            <label style={{ 
              display: 'block',
              fontSize: 'var(--text-sm)', 
              fontWeight: '500',
              color: 'var(--color-primary-700)',
              marginBottom: '0.5rem'
            }}>
              Profile ID
            </label>
            <p style={{ 
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary-800)',
              fontWeight: '600'
            }}>
              #{profileId}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Bookmark URLs Tab Content (only for profile owners)
  const bookmarkContent = (
    <BookmarkCollectionManager isOwner={isOwner} userAddress={walletAddress || undefined} />
  )

  // In the tabs configuration section, add the new tab:
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '👤',
      content: overviewContent
    },
  
      {
        id: 'minted',
        label: 'Minted Bookmarks',
        icon: '📚',
        content: <MintedBookmarks 
  userAddress={walletAddress || undefined} 
  profileId={profileId}
  profileOwnerAddress={profile.did.split(':')[4]} // Extract address from DID
/>
      },
    {
      id: 'buffaflow',
      label: 'Buy BUFFAFLOW', 
      icon: '💰',
      content: <BuyBuffaflow isOwnProfile={isOwner} />
    },
    // Security: Only show bookmark creation tab to profile owner
    ...(isOwner ? [{
      id: 'bookmarks',
      label: 'Bookmark URLs',
      icon: '🔗',
      content: bookmarkContent
    }] : [])
  ]

  return (
    <div className="profile-container">
      <div className="profile-card profile-card-wide" style={{ maxWidth: '720px', margin: '2rem auto' }}>
        
        {/* Profile Header - With Avatar */}
        <div style={{ 
          textAlign: 'center', 
          borderBottom: '1px solid var(--color-border)', 
          paddingBottom: '2rem', 
          marginBottom: '2rem' 
        }}>
          {/* Avatar and Title Container */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            {/* Avatar Image */}
            {profile.avatarUrl && (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--color-border)',
                flexShrink: 0
              }}>
                <img 
                  src={profile.avatarUrl} 
                  alt={`${profile.displayName} avatar`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Profile Name */}
            <h1 className="profile-title" style={{ fontSize: 'var(--text-4xl)', margin: 0 }}>
              {profile.displayName}
            </h1>
          </div>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'var(--color-slate-50)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1rem' }}>{tierInfo.icon}</span>
            <span style={{ 
              fontWeight: '500', 
              color: tierInfo.color,
              fontSize: 'var(--text-sm)'
            }}>
              Tier {profile.tier} • {tierInfo.name}
            </span>
          </div>

          {/* Ownership indicator for debugging */}
          {!checkingOwnership && isOwner && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--color-emerald-50)',
              color: 'var(--color-emerald-700)',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: 'var(--text-xs)',
              fontWeight: '500',
              border: '1px solid var(--color-emerald-200)'
            }}>
              🔑 Profile Owner
            </div>
          )}
        </div>

        {/* Tab System - New */}
        <ProfileTabSystem tabs={tabs} defaultTab="overview" />

       {/* Actions - Global Feed + Main Website Link */}
       <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          paddingTop: '2rem',
          textAlign: 'center'
        }}>
          
          {/* Global Feed Trigger - Only for connected users */}
          <GlobalFeedTrigger 
            onOpenFeed={() => setShowGlobalFeed(true)}
            isConnected={!!walletAddress}
          />
          
          <a href="https://immutabletype.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ minWidth: '140px', textDecoration: 'none' }}
          >
            ← ImmutableType
          </a>
        </div>
      </div>

      {/* Global Bookmark Feed Modal */}
      <Modal
        isOpen={showGlobalFeed}
        onClose={() => setShowGlobalFeed(false)}
        title="Global Bookmark Feed"
      >
        <GlobalBookmarkFeed />
      </Modal>
      </div>
  )
}