'use client'

import React, { useState, useEffect } from 'react'
import { useDirectWallet } from '../../../lib/hooks/useDirectWallet'
import confetti from 'canvas-confetti'
import Image from 'next/image'

type AuthMethod = 'wallet' | null

interface FormData {
  displayName: string
  bio: string
  location: string
  avatarUrl: string
}

interface CreationState {
  status: 'idle' | 'preparing' | 'pending' | 'success' | 'error'
  error?: string
  result?: {
    profileId: string
    did: string
    transactionHash?: string
  }
}

const CreateProfilePage: React.FC = () => {
  const [selectedAuth, setSelectedAuth] = useState<AuthMethod>(null)
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    bio: '',
    location: '',
    avatarUrl: ''
  })
  const [creationState, setCreationState] = useState<CreationState>({ status: 'idle' })
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})

  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const { address, isConnected, connectWallet } = useDirectWallet()

  useEffect(() => {
    setIsClient(true)
    setHasMetaMask(typeof window !== 'undefined' && !!window.ethereum?.isMetaMask)
  }, [])

  useEffect(() => {
    if (creationState.status === 'success') {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#059669', '#f59e0b']
      })
    }
  }, [creationState.status])

  useEffect(() => {
    if (selectedAuth === 'wallet' && !isConnected && hasMetaMask) {
      connectWallet()
    }
  }, [selectedAuth, isConnected, hasMetaMask, connectWallet])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setFormErrors({})
  }

  const validateForm = (data: FormData): boolean => {
    const errors: Partial<FormData> = {}
    
    if (!data.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (data.displayName.length > 50) {
      errors.displayName = 'Display name must be 50 characters or less'
    }
    
    if (data.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less'
    }
    
    if (data.location.length > 100) {
      errors.location = 'Location must be 100 characters or less'
    }
    
    if (data.avatarUrl.length > 500) {
      errors.avatarUrl = 'Avatar URL must be 500 characters or less'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData)) return
    if (!address) return
    
    setCreationState({ status: 'preparing' })
    
    try {
      console.log('Creating profile on Flow EVM...')
      
      const { profileNFTService } = await import('../../../lib/services/profile/ProfileNFT')
      
      setCreationState({ status: 'pending' })
      
      const result = await profileNFTService.createBasicProfile(formData, address)
      
      if (result.success) {
        setCreationState({
          status: 'success',
          result: {
            profileId: result.profileId!,
            did: result.did!,
            transactionHash: result.transactionHash
          }
        })
      } else {
        setCreationState({
          status: 'error',
          error: result.error || 'Failed to create profile'
        })
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setCreationState({
        status: 'error',
        error: errorMessage
      })
    }
  }

  if (!isClient) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <div className="loading-container">Loading...</div>
        </div>
      </div>
    )
  }

  // Auth selection - MetaMask only
  if (!selectedAuth) {
    return (
      <div className="profile-container profile-centered">
  <div className="profile-card">
    <h1 className="profile-title">Welcome to ImmutableType</h1>
    <p className="profile-subtitle">
      Once moveable, now provable. 
    </p>
    <p className="profile-subtitle">
      Get started by creating a profile.
    </p>
          

          {hasMetaMask ? (
            <button
            onClick={() => setSelectedAuth('wallet')}
            className="btn btn-primary btn-icon"
          >
            <span style={{ fontSize: '1.25rem' }}>🦊</span>
            Connect with MetaMask
          </button>
          ) : (
            <div>
              <p className="install-message">
                MetaMask wallet integration is required to create your verified identity profile
              </p>
              
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary btn-icon"
              >
                <span style={{ fontSize: '1.25rem' }}>🦊</span>
                Install MetaMask Wallet
              </a>
              
              <p className="install-note">
                After installation, refresh this page to continue with profile creation
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // MetaMask not detected
  if (selectedAuth === 'wallet' && !hasMetaMask) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h2 className="profile-title">Wallet Required</h2>
          <p className="profile-subtitle">
            MetaMask wallet is required to create and manage your identity profile
          </p>

          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary btn-icon"
            style={{ marginBottom: '1rem' }}
          >
            🦊 Install MetaMask Wallet
          </a>

          <p className="install-note">After installing, refresh and try again</p>

          <button
            onClick={() => setSelectedAuth(null)}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            ← Back to Options
          </button>
        </div>
      </div>
    )
  }

  // Connecting state
  if (selectedAuth === 'wallet' && hasMetaMask && !isConnected) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h2 className="profile-title">Connecting Wallet...</h2>
          <p className="profile-subtitle">
            Please approve the wallet connection in MetaMask and ensure you&apos;re connected to the Flow EVM network
          </p>

          <button
            onClick={() => setSelectedAuth(null)}
            className="btn btn-secondary"
          >
            ← Back to Options
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (creationState.status === 'success') {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Identity Profile Created Successfully</h2>

          <div className="success-did">
            <strong>Your Decentralized Identifier (DID):</strong><br />
            {creationState.result?.did}
          </div>

          <button
            onClick={() => window.location.href = `/profile/${creationState.result?.profileId}`}
            className="btn btn-success"
          >
            View Identity Profile
          </button>
        </div>
      </div>
    )
  }

  // Profile creation form
  if (selectedAuth === 'wallet' && isConnected) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-card-wide profile-card-form">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="profile-title">Create Your On-chain Profile</h1>
            <div className="profile-wallet-info">
              <span>{address?.substring(0, 8)}...{address?.substring(address.length - 6)}</span>
              <span>•</span>
              <span>Flow EVM Testnet</span>
            </div>
          </div>

          <div className="alert alert-warning">
            <div className="alert-title">💎 Profile Creation Fee: 3 FLOW</div>
            <div className="alert-subtitle">Or hold 100+ $BUFFAFLOW tokens to create for free</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your professional display name"
                className={`form-input ${formErrors.displayName ? 'form-input-error' : ''}`}
              />
              <div className="form-meta">
                {formErrors.displayName && (
                  <span className="form-error">{formErrors.displayName}</span>
                )}
                <span className="form-counter">{formData.displayName.length}/50</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Brief description of your professional background and interests..."
                rows={3}
                className={`form-input form-textarea ${formErrors.bio ? 'form-input-error' : ''}`}
              />
              <div className="form-meta">
                {formErrors.bio && (
                  <span className="form-error">{formErrors.bio}</span>
                )}
                <span className="form-counter">{formData.bio.length}/500</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State/Country"
                className={`form-input ${formErrors.location ? 'form-input-error' : ''}`}
              />
              <div className="form-meta">
                {formErrors.location && (
                  <span className="form-error">{formErrors.location}</span>
                )}
                <span className="form-counter">{formData.location.length}/100</span>
              </div>
            </div>

            <div className="form-group-last">
              <label className="form-label">Avatar Image URL</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
                className={`form-input ${formErrors.avatarUrl ? 'form-input-error' : ''}`}
              />
              {formData.avatarUrl && (
                <div className="avatar-preview">
                  <div className="avatar-image">
                    <Image 
                      src={formData.avatarUrl} 
                      alt="Avatar preview"
                      width={32}
                      height={32}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <span className="avatar-text">Profile avatar preview</span>
                </div>
              )}
              <div className="form-meta">
                <span className="form-counter">{formData.avatarUrl.length}/500</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={creationState.status === 'preparing' || creationState.status === 'pending'}
              className={`btn btn-success ${(creationState.status === 'preparing' || creationState.status === 'pending') ? 'btn-disabled' : ''}`}
            >
              {creationState.status === 'preparing' && 'Preparing Transaction...'}
              {creationState.status === 'pending' && 'Creating Identity Profile...'}
              {(creationState.status === 'idle' || creationState.status === 'error') && 'Create Identity Profile (3 FLOW)'}
            </button>

            {creationState.status === 'error' && (
              <div className="alert alert-error">
                <div className="alert-title">Creation Failed</div>
                <div className="alert-subtitle">{creationState.error}</div>
              </div>
            )}
          </form>

          <div className="form-note">
            <strong>Secure & Transferable:</strong> Your identity profile is stored on-chain as a transferable NFT. 
            Personal data resets upon transfer, ensuring privacy while maintaining profile history and verification status.
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default CreateProfilePage