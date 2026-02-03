'use client'

import { useState, useEffect } from 'react'
import { useUnifiedWallet } from '../../../lib/hooks/useUnifiedWallet'
import { isFlowWalletAvailable, isMetaMaskAvailable } from '../../../lib/web3/eip6963'

interface WalletSelectorProps {
  onClose?: () => void
}

export function WalletSelector({ onClose }: WalletSelectorProps) {
  const { connectWallet, availableWallets, isConnecting } = useUnifiedWallet()
  const [error, setError] = useState<string | null>(null)
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

  const handleConnect = async (walletType: 'metamask' | 'flow-wallet') => {
    setError(null)
    console.log('🔍 WalletSelector - handleConnect called with:', walletType)
    try {
      await connectWallet(walletType)
      console.log('✅ WalletSelector - Connection successful, closing modal')
      onClose?.()
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('❌ WalletSelector - Connection failed:', error)
      setError(error.message || 'Failed to connect wallet')
    }
  }

  // Always show wallet options - even if not detected, users can try to connect
  // Some wallets may not announce via EIP-6963 immediately
  
  return (
    <div className="wallet-selector">
      <h3>Connect Wallet</h3>
      <p>Choose a wallet to connect to Flow EVM Mainnet</p>
      
      {error && (
        <div className="wallet-error" style={{ color: 'red', marginBottom: '1rem' }}>
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
              Install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> or Flow Wallet extension to get started.
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
      `}</style>
    </div>
  )
}
