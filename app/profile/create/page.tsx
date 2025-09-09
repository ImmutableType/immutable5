'use client'

import React, { useState, useEffect } from 'react'
import { useDirectWallet } from '../../../lib/hooks/useDirectWallet'
import confetti from 'canvas-confetti'
import Image from 'next/image'

type AuthMethod = 'wallet' | 'flow-wallet' | 'farcaster' | 'crossmint' | null

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

  // Wallet detection state (fixes hydration mismatch)
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)
  const [hasFlowWallet, setHasFlowWallet] = useState(false)
  const [hasCoinbaseWallet, setHasCoinbaseWallet] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const { address, isConnected, connectWallet } = useDirectWallet()

  // Detect wallets after hydration
  useEffect(() => {
    setIsClient(true)
    setHasMetaMask(typeof window !== 'undefined' && window.ethereum?.isMetaMask)
    setHasWallet(typeof window !== 'undefined' && window.ethereum)
    setHasFlowWallet(typeof window !== 'undefined' && window.ethereum?.isFlowWallet)
    setHasCoinbaseWallet(typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet)
  }, [])

  // Trigger confetti on success
  useEffect(() => {
    if (creationState.status === 'success') {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B3211E', '#1D7F6E', '#E8A317']
      })
    }
  }, [creationState.status])

  // Auto-connect wallet when wallet option is selected
  useEffect(() => {
    if ((selectedAuth === 'wallet' || selectedAuth === 'flow-wallet') && !isConnected) {
      if (hasWallet) {
        connectWallet()
      }
    }
  }, [selectedAuth, isConnected, hasWallet, connectWallet])

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setFormErrors({})
  }

  // Validation
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
      
      // Import service dynamically
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

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-parchment)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  // Auth method selection screen with wallet status dashboard
  if (!selectedAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-parchment)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '2rem',
            marginBottom: '1rem',
            color: 'var(--color-black)'
          }}>
            Create Your Profile
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: 'var(--color-black)',
            opacity: 0.8
          }}>
            Choose how you&apos;d like to verify your identity
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Wallet Connection Options */}
            {hasWallet && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {/* MetaMask Option */}
                {hasMetaMask && (
                  <button
                    onClick={() => setSelectedAuth('wallet')}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#F6851B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#E6751A'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#F6851B'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🦊</span>
                    <div style={{ textAlign: 'left' }}>
                      <div>Connect with MetaMask (Tier 0)</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        Most popular Ethereum wallet
                      </div>
                    </div>
                  </button>
                )}

                {/* Flow Wallet Option */}
                {hasFlowWallet && (
                  <button
                    onClick={() => setSelectedAuth('flow-wallet')}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#00C896',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#00B085'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#00C896'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🌊</span>
                    <div style={{ textAlign: 'left' }}>
                      <div>Connect with Flow Wallet (Tier 0)</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        Native Flow blockchain wallet
                      </div>
                    </div>
                  </button>
                )}

                {/* Coinbase Wallet Option */}
                {hasCoinbaseWallet && (
                  <button
                    onClick={() => setSelectedAuth('wallet')}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#0052FF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#0041CC'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#0052FF'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🔵</span>
                    <div style={{ textAlign: 'left' }}>
                      <div>Connect with Coinbase Wallet (Tier 0)</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        Easy-to-use wallet from Coinbase
                      </div>
                    </div>
                  </button>
                )}

                {/* Generic wallet option if only unknown wallet detected */}
                {hasWallet && !hasMetaMask && !hasFlowWallet && !hasCoinbaseWallet && (
                  <button
                    onClick={() => setSelectedAuth('wallet')}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-typewriter-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    Connect Wallet (Tier 0)
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                      Connect with detected wallet
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Show install message if no wallet detected */}
            {!hasWallet && (
              <button
                onClick={() => setSelectedAuth('wallet')}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-digital-silver)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                ⚠️ Install Wallet (Tier 0)
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  Install a wallet to get started
                </div>
              </button>
            )}

            {/* Wallet Status Dashboard */}
            <div style={{
              backgroundColor: 'var(--color-parchment)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--color-black)'
              }}>
                Supported Wallets
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {/* MetaMask */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '6px',
                  border: `2px solid ${hasMetaMask ? 'var(--color-verification-green)' : 'var(--color-digital-silver)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🦊</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>MetaMask</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: hasMetaMask ? 'var(--color-verification-green)' : 'var(--color-digital-silver)',
                    fontWeight: 600
                  }}>
                    {hasMetaMask ? '✓ Ready' : 'Install'}
                  </span>
                </div>

                {/* Flow Wallet */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '6px',
                  border: `2px solid ${hasFlowWallet ? 'var(--color-verification-green)' : 'var(--color-digital-silver)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🌊</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Flow Wallet</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: hasFlowWallet ? 'var(--color-verification-green)' : 'var(--color-digital-silver)',
                    fontWeight: 600
                  }}>
                    {hasFlowWallet ? '✓ Ready' : 'Install'}
                  </span>
                </div>

                {/* Coinbase Wallet */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '6px',
                  border: `2px solid ${hasCoinbaseWallet ? 'var(--color-verification-green)' : 'var(--color-digital-silver)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🔵</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Coinbase</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: hasCoinbaseWallet ? 'var(--color-verification-green)' : 'var(--color-digital-silver)',
                    fontWeight: 600
                  }}>
                    {hasCoinbaseWallet ? '✓ Ready' : 'Install'}
                  </span>
                </div>
              </div>

              {/* Download Links with Official Branding */}
              <div style={{
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem'
              }}>
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#F6851B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#E6751A'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#F6851B'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    🦊 Get MetaMask
                  </button>
                </a>

                <a 
                  href="https://wallet.flow.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#00C896',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#00B085'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#00C896'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    🌊 Get Flow Wallet
                  </button>
                </a>

                <a 
                  href="https://www.coinbase.com/wallet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0052FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#0041CC'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#0052FF'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    🔵 Get Coinbase
                  </button>
                </a>
              </div>
            </div>

            {/* Farcaster - Coming Soon */}
            <button
              disabled
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-digital-silver)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'not-allowed',
                opacity: 0.6
              }}
            >
              Connect Farcaster (Tier 1)
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Coming soon - Social verification
              </div>
            </button>

            {/* Crossmint - Coming Soon */}
            <button
              disabled
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-digital-silver)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'not-allowed',
                opacity: 0.6
              }}
            >
              Verify with Crossmint (Tier 2)
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Coming soon - Identity verification
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Wallet setup required (no wallet detected)
  if ((selectedAuth === 'wallet' || selectedAuth === 'flow-wallet') && !hasWallet) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-parchment)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '3rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            marginBottom: '1rem'
          }}>
            Get a Wallet First
          </h2>
          
          <p style={{
            marginBottom: '2rem',
            color: 'var(--color-black)',
            opacity: 0.8
          }}>
            You need a crypto wallet to create your profile on Flow EVM
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button style={{
                width: '100%',
                padding: '1rem 2rem',
                backgroundColor: '#F6851B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                🦊 Download MetaMask
              </button>
            </a>

            <a 
              href="https://wallet.flow.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button style={{
                width: '100%',
                padding: '1rem 2rem',
                backgroundColor: '#00C896',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                🌊 Download Flow Wallet
              </button>
            </a>

            <a 
              href="https://www.coinbase.com/wallet" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button style={{
                width: '100%',
                padding: '1rem 2rem',
                backgroundColor: '#0052FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                🔵 Download Coinbase Wallet
              </button>
            </a>
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--color-digital-silver)',
            marginBottom: '1rem'
          }}>
            After installing, refresh this page and try again
          </p>

          <button
            onClick={() => setSelectedAuth(null)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: 'var(--color-digital-silver)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Back to auth options
          </button>
        </div>
      </div>
    )
  }

  // Wallet connecting state (while MetaMask processes)
  if ((selectedAuth === 'wallet' || selectedAuth === 'flow-wallet') && hasWallet && !isConnected) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-parchment)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '3rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            marginBottom: '1rem'
          }}>
            Connecting...
          </h2>
          
          <p style={{
            marginBottom: '2rem',
            color: 'var(--color-black)',
            opacity: 0.8
          }}>
            Please approve the connection in your wallet and switch to Flow EVM network if prompted
          </p>

          <button
            onClick={() => setSelectedAuth(null)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'var(--color-digital-silver)',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Back to auth options
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (creationState.status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-parchment)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '3rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          
          <h2 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.8rem',
            marginBottom: '1rem',
            color: 'var(--color-verification-green)'
          }}>
            Profile Created Successfully!
          </h2>

          <div style={{
            backgroundColor: 'var(--color-parchment)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            wordBreak: 'break-all'
          }}>
            <strong>Your DID:</strong><br />
            {creationState.result?.did}
          </div>

          <p style={{
            marginBottom: '2rem',
            color: 'var(--color-black)',
            opacity: 0.8
          }}>
            Redirecting to your profile in a few seconds...
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <button
              onClick={() => window.location.href = `/profile/${creationState.result?.profileId}`}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'var(--color-typewriter-red)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View My Profile
            </button>

            <button
              disabled
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-digital-silver)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'not-allowed',
                opacity: 0.6
              }}
            >
              Upgrade to Farcaster (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Profile creation form (wallet connected)
  if ((selectedAuth === 'wallet' || selectedAuth === 'flow-wallet') && isConnected) {
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
          {/* Header */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.8rem',
              marginBottom: '0.5rem'
            }}>
              Create Your Profile
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: 'var(--color-digital-silver)'
            }}>
              <span>{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
              <span>•</span>
              <span>Flow EVM Testnet</span>
            </div>
          </div>

          {/* Fee Information */}
          <div style={{
            backgroundColor: 'var(--color-alert-amber)',
            color: 'var(--color-white)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <strong>💰 Creation fee: 3 FLOW</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Or hold 100+ $BUFFAFLOW to create for free
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Display Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${formErrors.displayName ? 'var(--color-alert-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {formErrors.displayName && (
                  <span style={{ color: 'var(--color-alert-red)' }}>
                    {formErrors.displayName}
                  </span>
                )}
                <span style={{ 
                  color: 'var(--color-digital-silver)',
                  marginLeft: 'auto'
                }}>
                  {formData.displayName.length}/50
                </span>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${formErrors.bio ? 'var(--color-alert-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {formErrors.bio && (
                  <span style={{ color: 'var(--color-alert-red)' }}>
                    {formErrors.bio}
                  </span>
                )}
                <span style={{ 
                  color: 'var(--color-digital-silver)',
                  marginLeft: 'auto'
                }}>
                  {formData.bio.length}/500
                </span>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${formErrors.location ? 'var(--color-alert-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {formErrors.location && (
                  <span style={{ color: 'var(--color-alert-red)' }}>
                    {formErrors.location}
                  </span>
                )}
                <span style={{ 
                  color: 'var(--color-digital-silver)',
                  marginLeft: 'auto'
                }}>
                  {formData.location.length}/100
                </span>
              </div>
            </div>

            {/* Avatar URL */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${formErrors.avatarUrl ? 'var(--color-alert-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {formData.avatarUrl && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-digital-silver)'
                  }}>
                    <Image 
                      src={formData.avatarUrl} 
                      alt="Avatar preview"
                      width={40}
                      height={40}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-digital-silver)' }}>
                    Avatar preview
                  </span>
                </div>
              )}
              <div style={{
                fontSize: '0.8rem',
                marginTop: '0.25rem',
                color: 'var(--color-digital-silver)'
              }}>
                {formData.avatarUrl.length}/500
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={creationState.status === 'preparing' || creationState.status === 'pending'}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: (creationState.status === 'preparing' || creationState.status === 'pending') 
                  ? 'var(--color-digital-silver)' 
                  : 'var(--color-typewriter-red)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: (creationState.status === 'preparing' || creationState.status === 'pending') 
                  ? 'default' 
                  : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              {creationState.status === 'preparing' && 'Preparing...'}
              {creationState.status === 'pending' && 'Creating Profile...'}
              {(creationState.status === 'idle' || creationState.status === 'error') && 'Create Profile (3 FLOW)'}
            </button>

            {/* Error State */}
            {creationState.status === 'error' && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--color-alert-red)',
                color: 'var(--color-white)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <strong>Error:</strong> {creationState.error}
              </div>
            )}
          </form>

          {/* Local Cache Warning */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'var(--color-parchment)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--color-black)',
            opacity: 0.7,
            textAlign: 'center'
          }}>
            <strong>Note:</strong> Profile data is stored locally until minted. 
            Your draft will be lost if you navigate away without completing the transaction.
          </div>
        </div>
      </div>
    )
  }

  // Fallback return
  return null
}

export default CreateProfilePage