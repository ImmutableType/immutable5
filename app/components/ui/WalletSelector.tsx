'use client'

import { useState, useEffect } from 'react'
import { useUnifiedWallet } from '../../../lib/hooks/useUnifiedWallet'
import { isFlowWalletAvailable, isMetaMaskAvailable } from '../../../lib/web3/eip6963'

interface WalletSelectorProps {
  onClose?: () => void
}

export function WalletSelector({ onClose }: WalletSelectorProps) {
  const { connectWallet, availableWallets, isConnecting, isMobileDevice } = useUnifiedWallet()
  const [error, setError] = useState<string | null>(null)
  const [connectionTimeout, setConnectionTimeout] = useState(false)
  const [localWallets, setLocalWallets] = useState({
    metamask: false,
    flowWallet: false
  })
  
  // Re-check wallet availability when modal opens (in case EIP-6963 discovery was delayed)
  useEffect(() => {
    const checkWallets = () => {
      setLocalWallets({
        metamask: isMetaMaskAvailable() || availableWallets.metamask,
        flowWallet: isFlowWalletAvailable() || availableWallets.flowWallet
      })
    }
    
    // Check immediately
    checkWallets()
    
    // Check periodically in case wallets announce late
    const interval = setInterval(checkWallets, 500)
    const timeout = setTimeout(() => clearInterval(interval), 5000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [availableWallets])
  
  // Use local wallets state (which includes real-time checks) or fall back to hook state
  const wallets = {
    metamask: localWallets.metamask || availableWallets.metamask,
    flowWallet: localWallets.flowWallet || availableWallets.flowWallet
  }
  
  // Debug logging - show actual values
  console.log('🔍 WalletSelector - Available wallets:', JSON.stringify(wallets, null, 2))

  // Connection timeout handling for mobile
  useEffect(() => {
    if (isConnecting) {
      setConnectionTimeout(false)
      const timeout = setTimeout(() => {
        setConnectionTimeout(true)
      }, 30000) // 30 seconds
      return () => clearTimeout(timeout)
    } else {
      setConnectionTimeout(false)
    }
  }, [isConnecting])

  const handleConnect = async (walletType: 'metamask' | 'flow-wallet') => {
    setError(null)
    setConnectionTimeout(false)
    console.log('🔍 WalletSelector - handleConnect called with:', walletType)
    try {
      await connectWallet(walletType)
      console.log('✅ WalletSelector - Connection successful, closing modal')
      onClose?.()
    } catch (err: unknown) {
      const error = err as { message?: string; code?: number }
      console.error('❌ WalletSelector - Connection failed:', error)
      
      // Better error messages for mobile
      let errorMessage = error.message || 'Failed to connect wallet'
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please try again and approve the connection.'
      } else if (error.message?.includes('not found') || error.message?.includes('not available')) {
        if (isMobileDevice) {
          errorMessage = 'Wallet not found. Make sure you have Flow Wallet or MetaMask mobile app installed and try again.'
        } else {
          errorMessage = 'Wallet not found. Please install Flow Wallet or MetaMask browser extension.'
        }
      } else if (error.message?.includes('Cadence') || error.message?.includes('native Flow')) {
        errorMessage = 'This app requires Flow EVM wallet (Ethereum-compatible). Cadence/native Flow wallets are not supported.'
      }
      
      setError(errorMessage)
    }
  }

  // Always show wallet options - even if not detected, users can try to connect
  // Some wallets may not announce via EIP-6963 immediately
  
  return (
    <div className="wallet-selector">
      <h3>Connect Wallet</h3>
      <p>Choose a wallet to connect to Flow EVM Mainnet</p>
      
      {/* Mobile connection instructions */}
      {isMobileDevice && isConnecting && (
        <div className="mobile-connection-status" style={{
          padding: '1rem',
          background: 'var(--color-primary-50, #eff6ff)',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid var(--color-primary-200, #bfdbfe)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-primary-700, #1d4ed8)' }}>
            📱 Connecting on Mobile
          </div>
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
            <li>Approve the connection in your wallet app</li>
            <li>Return to this browser tab</li>
            <li>Wait for confirmation</li>
          </ol>
          {connectionTimeout && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-amber-50, #fffbeb)', borderRadius: '6px', fontSize: '0.875rem' }}>
              <strong>Taking too long?</strong> Make sure you returned to this tab after approving in your wallet app.
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="wallet-error" style={{
          padding: '1rem',
          background: 'var(--color-red-50, #fef2f2)',
          border: '1px solid var(--color-red-200, #fecaca)',
          borderRadius: '8px',
          color: 'var(--color-red-700, #b91c1c)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}>
          <strong>⚠️ Connection Failed:</strong><br />
          {error}
        </div>
      )}

      <div className="wallet-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {wallets.metamask && (
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="wallet-option"
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span>🦊</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>MetaMask</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Connect with MetaMask</div>
            </div>
            {isConnecting && <span>Connecting...</span>}
          </button>
        )}

        {wallets.flowWallet && (
          <button
            onClick={() => handleConnect('flow-wallet')}
            disabled={isConnecting}
            className="wallet-option"
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span>💧</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>Flow Wallet</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Connect with Flow Wallet
              </div>
            </div>
            {isConnecting && <span>Connecting...</span>}
          </button>
        )}

        {/* Always show wallet options even if not detected - users can try to connect */}
        {!wallets.metamask && (
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="wallet-option"
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              opacity: 0.7
            }}
          >
            <span>🦊</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>MetaMask</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Try connecting with MetaMask</div>
            </div>
            {isConnecting && <span>Connecting...</span>}
          </button>
        )}

        {!wallets.flowWallet && (
          <button
            onClick={() => handleConnect('flow-wallet')}
            disabled={isConnecting}
            className="wallet-option"
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              opacity: 0.7
            }}
          >
            <span>💧</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>Flow Wallet</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Try connecting with Flow Wallet</div>
            </div>
            {isConnecting && <span>Connecting...</span>}
          </button>
        )}

        {!wallets.metamask && !wallets.flowWallet && (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
            <p>If you have a wallet installed, try clicking the buttons above.</p>
            <p style={{ marginTop: '0.5rem' }}>
              Install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> or <strong>Flow EVM Wallet</strong> extension to get started.
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
              ⚠️ Note: This app requires <strong>Flow EVM</strong> wallets (Ethereum-compatible). Cadence/native Flow wallets are not supported.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .wallet-selector {
          padding: 1.5rem;
        }
        .wallet-selector h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
        }
        .wallet-selector p {
          margin: 0 0 1.5rem 0;
          color: #666;
          font-size: 0.875rem;
        }
        .wallet-option:hover:not(:disabled) {
          background: #f5f5f5;
        }
        .wallet-option:disabled {
          opacity: 0.6;
        }
        
        @media (max-width: 768px) {
          .wallet-selector {
            padding: 1.25rem;
          }
          .wallet-selector h3 {
            font-size: 1.125rem;
          }
          .wallet-option {
            min-height: 60px !important;
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  )
}
