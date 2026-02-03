'use client'

import { useState } from 'react'
import { useUnifiedWallet } from '../../../lib/hooks/useUnifiedWallet'

interface WalletSelectorProps {
  onClose?: () => void
}

export function WalletSelector({ onClose }: WalletSelectorProps) {
  const { connectWallet, availableWallets, isConnecting } = useUnifiedWallet()
  const [error, setError] = useState<string | null>(null)
  
  // Debug logging - show actual values
  console.log('🔍 WalletSelector - Available wallets:', JSON.stringify(availableWallets, null, 2))

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

  // Flow Wallet is now properly detected via EIP-6963
  if (!availableWallets.metamask && !availableWallets.flowWallet) {
    return (
      <div className="wallet-selector" style={{ padding: '1.5rem' }}>
        <h3>No Wallets Detected</h3>
        <p>Please install MetaMask or Flow Wallet extension to continue.</p>
      </div>
    )
  }
  
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
        {availableWallets.metamask && (
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

        {availableWallets.flowWallet && (
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

        {!availableWallets.metamask && !availableWallets.flowWallet && (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
            <p>No wallets detected.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Please install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">MetaMask</a> or Flow Wallet extension.
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
