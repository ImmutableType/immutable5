'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUnifiedWallet } from '../../../../lib/hooks/useUnifiedWallet'
import { tokenQualifierService } from '../../../../lib/services/profile/TokenQualifier'
import confetti from 'canvas-confetti'
import Image from 'next/image'
import { Modal } from '../../../components/ui/Modal'
import { HowToModalContent } from '../../../components/features/registration/HowToModal'
import { WalletSelector } from '../../../components/ui/WalletSelector'

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

interface QualificationStatus {
  isQualified: boolean
  tokenBalance: string
  nftCount: number
  canBypassFee: boolean
}

const CreateProfilePage: React.FC = () => {
  const [selectedAuth, setSelectedAuth] = useState<AuthMethod>(null)
  const [showHowToModal, setShowHowToModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    bio: '',
    location: '',
    avatarUrl: ''
  })
  const [creationState, setCreationState] = useState<CreationState>({ status: 'idle' })
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus | null>(null)
  const [isCheckingQualification, setIsCheckingQualification] = useState(false)
  const [showReturnInstructions, setShowReturnInstructions] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [checkingExistingProfile, setCheckingExistingProfile] = useState(true)

  const { 
    address, 
    isConnected, 
    connectWallet,
    isConnecting,
    isMobileDevice,
    availableWallets,
    provider
  } = useUnifiedWallet()
  
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Auto-select wallet auth if already connected (e.g., redirected from Navigation)
  useEffect(() => {
    if (isConnected && address && !selectedAuth) {
      console.log('✅ Profile Create - Wallet already connected, auto-selecting wallet auth')
      setSelectedAuth('wallet')
    }
  }, [isConnected, address, selectedAuth])

  const checkBuffaflowQualification = useCallback(async () => {
    if (!address || !provider) return
    
    setIsCheckingQualification(true)
    
    try {
      console.log('Starting qualification check...')
      // Initialize with unified wallet provider
      await tokenQualifierService.initialize(provider)
      const status = await tokenQualifierService.checkQualification(address)
      setQualificationStatus(status)
      
      console.log('BUFFAFLOW Qualification Status:', {
        isQualified: status.isQualified,
        tokenBalance: status.tokenBalance,
        nftCount: status.nftCount,
        canBypassFee: status.canBypassFee
      })
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error checking BUFFAFLOW qualification:', error)
      setQualificationStatus({
        isQualified: false,
        tokenBalance: 'Check failed',
        nftCount: 0,
        canBypassFee: false
      })
    } finally {
      setIsCheckingQualification(false)
    }
  }, [address])

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

  // Auto-select wallet auth if already connected (e.g., redirected from Navigation)
  useEffect(() => {
    if (isConnected && address && !selectedAuth) {
      console.log('✅ Profile Create - Wallet already connected, auto-selecting wallet auth')
      setSelectedAuth('wallet')
    }
  }, [isConnected, address, selectedAuth])

  useEffect(() => {
    if (selectedAuth === 'wallet' && !isConnected && !isConnecting) {
      // Show wallet selector modal instead of auto-connecting
      setShowWalletSelector(true)
      
      // Show return instructions after 3 seconds on mobile
      if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          setShowReturnInstructions(true)
        }, 3000)
      }
    }
  }, [selectedAuth, isConnected, isConnecting])

  // Hide return instructions and close wallet selector when connected
  useEffect(() => {
    if (isConnected) {
      setShowReturnInstructions(false)
      setShowWalletSelector(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (isConnected && address && provider && selectedAuth === 'wallet') {
      checkBuffaflowQualification()
    }
  }, [isConnected, address, provider, selectedAuth, checkBuffaflowQualification])

  // Check if user already has a profile
  useEffect(() => {
    async function checkExistingProfile() {
      if (!isConnected || !address) {
        setCheckingExistingProfile(false)
        return
      }
      
      try {
        setCheckingExistingProfile(true)
        const { profileNFTService } = await import('../../../../lib/services/profile/ProfileNFT')
        await profileNFTService.initializeReadOnly()
        
        const hasProfile = await profileNFTService.hasProfile(address)
        
        if (hasProfile) {
          setHasExistingProfile(true)
          const profileData = await profileNFTService.getProfileByAddress(address)
          if (profileData?.profileId) {
            window.location.href = `/profile/${profileData.profileId}`
          }
        }
      } catch (error) {
        console.error('Failed to check existing profile:', error)
      } finally {
        setCheckingExistingProfile(false)
      }
    }
    
    checkExistingProfile()
  }, [isConnected, address])

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
    if (!address || !provider) {
      setCreationState({ 
        status: 'error', 
        error: 'Wallet provider not available. Please reconnect your wallet.' 
      })
      return
    }
    
    setCreationState({ status: 'preparing' })
    
    try {
      console.log('Creating profile on Flow EVM...')
      
      const { profileNFTService } = await import('../../../../lib/services/profile/ProfileNFT')
      
      setCreationState({ status: 'pending' })
      
      // Pass the unified wallet provider to support both MetaMask and Flow Wallet
      const result = await profileNFTService.createBasicProfile(formData, address, provider)
      
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

  const getFeeDisplayText = () => {
    if (isCheckingQualification) return 'Checking qualification...'
    if (qualificationStatus?.canBypassFee) return 'FREE'
    return '3 FLOW'
  }

  const getButtonText = () => {
    if (creationState.status === 'preparing') return 'Preparing Transaction...'
    if (creationState.status === 'pending') return 'Creating Identity Profile...'
    
    const feeText = getFeeDisplayText()
    return `Create Identity Profile (${feeText})`
  }

  // Mobile browser detection - show message immediately before anything else
  if (isMobileDevice) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h1 className="profile-title">ImmutableType</h1>
          <div className="alert alert-info">
            <div className="alert-title">📱 Hey, guys. Damon here...</div>
            <div className="alert-subtitle">
              Please visit app.immutabletype.com on your desktop or laptop computer. Today is Sept 19, 2025, and I am unable to get the mobile UI to work without critical bugs crashing the vibe. Please head to a pc or laptop to use the app for now.
            </div>
          </div>
          
          <p className="profile-subtitle" style={{ marginTop: '1.5rem' }}>
            <strong>Why desktop or laptop?</strong><br />
            Because the app works well in those browsers. I realize it is annoying. Apologies for now. Thanks for understanding.
          </p>
        </div>
      </div>
    )
  }

  // Show loading while checking for existing profile
  if (checkingExistingProfile) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h1 className="profile-title">Loading...</h1>
          <p className="profile-subtitle">Please wait while we verify your account...</p>
        </div>
      </div>
    )
  }

  // Block users who already have a profile
  if (hasExistingProfile) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <div className="alert alert-info">
            <div className="alert-title">✅ Profile Already Exists</div>
            <div className="alert-subtitle">
              You already have an ImmutableType profile. Redirecting you now...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Auth selection
  if (!selectedAuth) {
    return (
      <>
        <Modal 
          isOpen={showHowToModal} 
          onClose={() => setShowHowToModal(false)}
          title="New to Flow Blockchain?"
        >
          <HowToModalContent />
        </Modal>

        <div className="profile-container profile-centered">
          <div className="profile-card">
            <h1 className="profile-title">Welcome to ImmutableType</h1>
            <p className="profile-subtitle">
              Get started by creating a profile.
            </p>

            <button
              onClick={() => setShowWalletSelector(true)}
              className="btn btn-primary btn-icon"
            >
              <span style={{ fontSize: '1.25rem' }}>🔗</span>
              Connect Wallet
            </button>
            
            <Modal
              isOpen={showWalletSelector}
              onClose={() => setShowWalletSelector(false)}
              title="Connect Wallet"
            >
              <WalletSelector 
                onClose={() => {
                  setShowWalletSelector(false)
                  if (isConnected) {
                    setSelectedAuth('wallet')
                  }
                }} 
              />
            </Modal>

            <div style={{ 
              textAlign: 'center', 
              margin: '2rem 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem'
            }}>
              Or, Learn How to Connect 👇
            </div>

            <button
              onClick={() => setShowHowToModal(true)}
              className="btn btn-secondary"
              style={{ 
                width: '100%',
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.4'
              }}
            >
              New to Flow Blockchain?<br />
              Learn how to get started
            </button>
          </div>
        </div>
      </>
    )
  }

  // Connecting state with improved mobile instructions
  if (selectedAuth === 'wallet' && !isConnected) {
    return (
      <div className="profile-container profile-centered">
        <div className="profile-card">
          <h2 className="profile-title">Connecting Wallet...</h2>
          
          {!showReturnInstructions ? (
            <p className="profile-subtitle">
              Please approve the wallet connection and ensure you&apos;re connected to the Flow EVM network
            </p>
          ) : (
            <>
              <p className="profile-subtitle">
                Connected to your wallet? Please return to this app to continue creating your profile.
              </p>
              <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                <div className="alert-title">📱 On Mobile?</div>
                <div className="alert-subtitle">
                  After connecting in your wallet app, manually return to this browser tab to continue.
                </div>
              </div>
            </>
          )}

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

          {qualificationStatus?.canBypassFee && (
            <div className="alert alert-success" style={{ marginTop: '1rem' }}>
              <div className="alert-title">🎁 BUFFAFLOW Qualification Applied</div>
              <div className="alert-subtitle">Profile created for free using your BUFFAFLOW tokens</div>
            </div>
          )}

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
              <span>Flow EVM Mainnet</span>
            </div>
          </div>

          {/* Dynamic Fee Alert based on BUFFAFLOW qualification */}
          {isCheckingQualification ? (
            <div className="alert alert-info">
              <div className="alert-title">⏳ Checking BUFFAFLOW Qualification...</div>
              <div className="alert-subtitle">Verifying your token balance for fee bypass</div>
            </div>
          ) : qualificationStatus?.canBypassFee ? (
            <div className="alert alert-success">
              <div className="alert-title">🎁 BUFFAFLOW Qualification Detected!</div>
              <div className="alert-subtitle">
                Profile creation is FREE with your BUFFAFLOW tokens
                {qualificationStatus.nftCount > 0 && ` (${qualificationStatus.nftCount} NFTs)`}
                {qualificationStatus.tokenBalance !== '0' && qualificationStatus.tokenBalance !== 'N/A' && qualificationStatus.tokenBalance !== 'Check failed' &&
                  ` (${parseFloat(qualificationStatus.tokenBalance).toFixed(2)} tokens)`}
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <div className="alert-title">💎 Profile Creation Fee: 3 FLOW</div>
              <div className="alert-subtitle">Or hold 100+ $BUFFAFLOW or 100+ $FROTH tokens to create for free</div>
            </div>
          )}

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
              disabled={creationState.status === 'preparing' || creationState.status === 'pending' || isCheckingQualification}
              className={`btn btn-success ${(creationState.status === 'preparing' || creationState.status === 'pending' || isCheckingQualification) ? 'btn-disabled' : ''}`}
            >
              {getButtonText()}
            </button>

            {creationState.status === 'error' && (
              <div className="alert alert-error">
                <div className="alert-title">Creation Failed</div>
                <div className="alert-subtitle">{creationState.error}</div>
              </div>
            )}

            <div className="terms-footer">
              By creating a profile, you agree to our{' '}
              <a 
                href="https://immutabletype.com/policies/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a 
                href="https://immutabletype.com/policies/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </div>
          </form>

          <div className="form-note">
            <strong>Secure & Transferable:</strong> Your identity profile is stored on-chain as a transferable NFT. 
            Personal data resets upon transfer, ensuring privacy while maintaining profile history and verification status.
          </div>
        </div>

        <style jsx>{`
          .terms-footer {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--color-border);
            text-align: center;
            font-size: 0.875rem;
            color: var(--color-text-tertiary);
            line-height: 1.5;
          }

          .terms-footer a {
            color: var(--color-primary-600);
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .terms-footer a:hover {
            color: var(--color-primary-700);
            text-decoration: underline;
          }
        `}</style>
      </div>
    )
  }

  return null
}

export default CreateProfilePage