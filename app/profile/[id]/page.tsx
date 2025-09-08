'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { profileNFTService } from '../../../lib/services/profile/ProfileNFT'

interface ProfileData {
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
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await profileNFTService.initialize()
      
      // Try to get profile directly from contract
      const contract = (profileNFTService as any).contract
      const profileData = await contract.getProfile(profileId)
      
      setProfile({
        tier: Number(profileData.tier),
        did: profileData.did,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl,
        createdAt: Number(profileData.createdAt),
        isActive: profileData.isActive
      })
      
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Profile Not Found</h2>
        <p>Error: {error}</p>
        <p>Profile ID: {profileId}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>No profile data</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-parchment)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'var(--color-white)',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          {profile.displayName}
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <strong>Tier:</strong> {profile.tier} 
          <span style={{ marginLeft: '1rem', color: 'var(--color-digital-silver)' }}>
            {profile.tier === 0 && 'Basic'}
            {profile.tier === 1 && 'Social'}
            {profile.tier === 2 && 'Identity'}
            {profile.tier === 3 && 'Anonymous'}
          </span>
        </div>

        {profile.bio && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Bio:</strong><br />
            {profile.bio}
          </div>
        )}

        {profile.location && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Location:</strong> {profile.location}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>DID:</strong><br />
          <code style={{ 
            backgroundColor: 'var(--color-parchment)', 
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            wordBreak: 'break-all'
          }}>
            {profile.did}
          </code>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Created:</strong> {new Date(profile.createdAt * 1000).toLocaleString()}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Status:</strong> {profile.isActive ? 'Active' : 'Suspended'}
        </div>

        <div style={{
          backgroundColor: 'var(--color-parchment)',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>Profile ID:</strong> {profileId}
        </div>
      </div>
    </div>
  )
}