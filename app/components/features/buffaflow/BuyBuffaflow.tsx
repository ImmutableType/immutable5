'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const BUFFAFLOW_CONTRACT_ADDRESS = '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798'
const BUFFAFLOW_ABI = [
  // ERC20 standard balanceOf function
  'function balanceOf(address owner) view returns (uint256)',
  // ERC404 totalSupply
  'function totalSupply() view returns (uint256)',
  // Decimals
  'function decimals() view returns (uint8)'
]

interface BuyBuffaflowProps {
  isOwnProfile?: boolean
}

export default function BuyBuffaflow({ isOwnProfile = false }: BuyBuffaflowProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [buffaflowBalance, setBuffaflowBalance] = useState<string | null>(null)
  const [isQualified, setIsQualified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Check wallet connection and balance ONLY on own profile
  useEffect(() => {
    if (isOwnProfile) {
      checkWalletAndBalance()
    }
  }, [isOwnProfile])

  const checkWalletAndBalance = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask not detected')
        return
      }

      // Get connected accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      })

      if (accounts.length === 0) {
        // No wallet connected
        setWalletAddress(null)
        setBuffaflowBalance(null)
        return
      }

      const address = accounts[0]
      setWalletAddress(address)

      // Create provider and contract instance
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        BUFFAFLOW_CONTRACT_ADDRESS,
        BUFFAFLOW_ABI,
        provider
      )

      // Get balance
      const balance = await contract.balanceOf(address)
      const decimals = await contract.decimals()
      
      // Format balance (divide by 10^decimals)
      const formattedBalance = ethers.formatUnits(balance, decimals)
      setBuffaflowBalance(formattedBalance)

      // Check if qualified (100+ tokens)
      const balanceNumber = parseFloat(formattedBalance)
      setIsQualified(balanceNumber >= 100)

    } catch (err) {
      console.error('Error checking balance:', err)
      setError('Failed to load balance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask not installed')
        return
      }

      // Request account access
      await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      // Recheck balance after connection
      await checkWalletAndBalance()
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlowFunClick = () => {
    window.open('https://flowfun.xyz/collection/6893c3f9fc44a8bb9e159eb4/token', '_blank', 'noopener,noreferrer')
  }

  const handleOpenSeaClick = () => {
    window.open('https://opensea.io/collection/moonbuffaflow', '_blank', 'noopener,noreferrer')
  }

  const handleExplorerClick = () => {
    window.open('https://evm.flowscan.io/address/0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798', '_blank', 'noopener,noreferrer')
  }

  const handleViewNFTsClick = () => {
    window.open('https://opensea.io/collection/moonbuffaflow', '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{
      padding: '2rem 1rem',
      color: 'var(--color-text-secondary)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Wallet Balance Card - ONLY SHOWN ON OWN PROFILE */}
      {isOwnProfile && walletAddress && (
        <div style={{
          background: isQualified 
            ? 'linear-gradient(135deg, var(--color-success-50) 0%, var(--color-success-100) 100%)'
            : 'var(--color-neutral-50)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: `2px solid ${isQualified ? 'var(--color-success-400)' : 'var(--color-neutral-200)'}`,
          marginBottom: '2rem',
          boxShadow: isQualified ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              Your $BUFFAFLOW Balance
            </h3>
            {isQualified && (
              <span style={{
                background: 'var(--color-success-500)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: 'var(--text-xs)',
                fontWeight: '600'
              }}>
                ✓ Qualified
              </span>
            )}
          </div>

          {isLoading ? (
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-secondary)' 
            }}>
              Loading balance...
            </p>
          ) : error ? (
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-error-600)' 
            }}>
              {error}
            </p>
          ) : (
            <>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: isQualified ? 'var(--color-success-700)' : 'var(--color-text-primary)',
                marginBottom: '0.5rem'
              }}>
                {parseFloat(buffaflowBalance || '0').toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })} $BUFFAFLOW
              </div>

              <p style={{
                fontSize: 'var(--text-sm)',
                color: isQualified ? 'var(--color-success-700)' : 'var(--color-text-secondary)',
                marginBottom: '0.5rem'
              }}>
                {isQualified 
                  ? '🎉 You qualify for free profile creation and bookmark minting!'
                  : `You need ${(100 - parseFloat(buffaflowBalance || '0')).toFixed(0)} more tokens to qualify`
                }
              </p>

              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'monospace'
              }}>
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </>
          )}

          <button
            onClick={checkWalletAndBalance}
            disabled={isLoading}
            style={{
              marginTop: '1rem',
              background: 'transparent',
              color: 'var(--color-primary-600)',
              border: '1px solid var(--color-primary-300)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: 'var(--text-xs)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh Balance'}
          </button>
        </div>
      )}

      {/* Connect Wallet Button - ONLY SHOWN ON OWN PROFILE */}
      {isOwnProfile && !walletAddress && (
        <div style={{
          background: 'var(--color-primary-50)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--color-primary-200)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem'
          }}>
            Connect your wallet to check your $BUFFAFLOW balance
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            style={{
              background: 'var(--color-primary-600)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'
            }}
          >
            {isLoading ? 'Connecting...' : '🦊 Connect MetaMask'}
          </button>
        </div>
      )}

      {/* Main Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🦬
        </div>
        
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '2rem'
        }}>
          Unlock Premium Features with $BUFFAFLOW
        </h2>

        {/* Contract Address */}
        <div style={{
          background: 'var(--color-primary-50)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--color-primary-200)',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-600)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            CONTRACT ADDRESS
          </p>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'monospace',
            color: 'var(--color-primary-800)',
            wordBreak: 'break-all'
          }}>
            0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
          </p>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-600)',
            marginTop: '0.5rem'
          }}>
            Flow EVM Blockchain
          </p>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Value Propositions */}
      <div style={{
        background: 'var(--color-primary-50)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--color-primary-200)',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-primary-700)',
          marginBottom: '1rem'
        }}>
          Premium Benefits
        </h3>
        <ul style={{
          color: 'var(--color-primary-800)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          paddingLeft: '1rem'
        }}>
          <li><strong>Free profile creation</strong> - Hold 100+ $BUFFAFLOW to bypass all creation fees</li>
          <li><strong>Access bookmark collections</strong> - Create and manage your bookmark NFTs</li>
          <li><strong>Exclusive utility token</strong> - Only 15,600,000 $BUFFAFLOW exist on Flow EVM</li>
          <li><strong>Bonded to sold-out NFTs</strong> - Connected to the MoonBuffaFLOW collection</li>
        </ul>
      </div>

      {/* About Section */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--color-neutral-50)',
        borderRadius: '8px',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '1rem'
        }}>
          About $BUFFAFLOW
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem'
        }}>
          $BUFFAFLOW are the bonded tokens of the MoonBuffaFLOW NFT collection, which sold out in under 5 hours. These ERC404 tokens on Flow EVM Mainnet combine fungible utility with NFT rarity.
        </p>
        <p style={{
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)'
        }}>
          <strong>How It Works:</strong> Acquire 100+ $BUFFAFLOW tokens or MoonBuffaFLOW NFTs, keep them in your wallet for platform access, and create profiles and bookmark collections without fees.
        </p>
      </div>

      {/* Setup Instructions */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--color-neutral-50)',
        borderRadius: '8px',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '1rem'
        }}>
          MetaMask Setup
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem'
          }}>
            Add Flow EVM to MetaMask:
          </h4>
          <ul style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            lineHeight: '1.5',
            paddingLeft: '1rem'
          }}>
            <li>Network Name: Flow EVM Mainnet</li>
            <li>RPC URL: https://mainnet.evm.nodes.onflow.org</li>
            <li>Chain ID: 747</li>
            <li>Currency Symbol: FLOW</li>
            <li>Block Explorer: https://evm.flowscan.io</li>
          </ul>
        </div>

        <div>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem'
          }}>
            Add $BUFFAFLOW Token to MetaMask:
          </h4>
          <ul style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            lineHeight: '1.5',
            paddingLeft: '1rem'
          }}>
            <li>Token Contract: 0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798</li>
            <li>Token Symbol: $BUFFAFLOW</li>
            <li>Decimals: 18</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={handleFlowFunClick}
          style={{
            background: 'var(--color-primary-600)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'
          }}
        >
          Buy Tokens on FlowFun →
        </button>

        <button
          onClick={handleOpenSeaClick}
          style={{
            background: 'var(--color-secondary-600)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-600)'
          }}
        >
          Buy NFTs on OpenSea →
        </button>

        <button
          onClick={handleViewNFTsClick}
          style={{
            background: 'transparent',
            color: 'var(--color-secondary-600)',
            border: '1px solid var(--color-secondary-300)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-50)'
            e.currentTarget.style.borderColor = 'var(--color-secondary-400)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-secondary-300)'
          }}
        >
          View NFTs on OpenSea →
        </button>

        <button
          onClick={handleExplorerClick}
          style={{
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-neutral-300)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'
            e.currentTarget.style.borderColor = 'var(--color-neutral-400)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-neutral-300)'
          }}
        >
          View Contract on Flow Explorer
        </button>
      </div>

      {/* Technical Details */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        textAlign: 'center',
        lineHeight: '1.5',
        marginBottom: '2rem'
      }}>
        <p>
          Limited supply of 15,600,000 tokens bonded to a sold-out NFT collection.<br />
          Hold 100+ tokens OR any MoonBuffaFLOW NFT to unlock all premium platform features.
        </p>
      </div>
     
      {/* Legal Disclaimers */}
      <div style={{
        borderTop: '1px solid var(--color-neutral-200)',
        paddingTop: '1.5rem',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        lineHeight: '1.4'
      }}>
        <h4 style={{
          fontSize: 'var(--text-xs)',
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem'
        }}>
          Legal Disclaimers
        </h4>
        
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>Collectible Nature:</strong> $BUFFAFLOW are collectible tokens which unlock utility on ImmutableType. These tokens and MoonBuffaFLOW NFTs are experimental digital collectibles that may fluctuate in value. Only acquire what you can afford to lose.
        </p>
        
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>Entertainment Purposes:</strong> ImmutableType tokens foster experiments in collaboration that should be used for entertainment purposes only. This information is educational and does not constitute financial, investment, or legal advice.
        </p>
        
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>No Financial Advice:</strong> Consult with qualified professionals before making any decisions regarding digital collectibles or blockchain interactions.
        </p>
        
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>Platform Features:</strong> Utility features and token benefits are subject to change. ImmutableType reserves the right to modify platform functionality, qualification requirements, and terms of service.
        </p>
        
        <p style={{ marginBottom: '0.75rem' }}>
          <strong>Regulatory Compliance:</strong> Users are responsible for compliance with applicable laws and regulations in their jurisdiction. Some features may not be available in all regions.
        </p>
        
        <p>
          <strong>Smart Contract Risk:</strong> Blockchain transactions are irreversible. Ensure you understand the risks associated with smart contract interactions before proceeding.
        </p>
      </div>
    </div>
  )
}