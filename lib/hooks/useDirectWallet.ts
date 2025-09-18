'use client'

import { useState, useEffect, useCallback } from 'react'
import { MetaMaskSDK, SDKProvider } from '@metamask/sdk'

// Use environment variables for Flow EVM configuration
const FLOW_EVM_MAINNET = {
  chainId: `0x${parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747').toString(16)}`, // Convert to hex
  chainName: 'Flow EVM Mainnet',
  rpcUrls: [process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm.flowscan.io'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}

// Initialize MetaMask SDK with mobile-first configuration
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "ImmutableType",
    url: typeof window !== 'undefined' ? window.location.href : 'https://app.immutabletype.com'
  },
  useDeeplink: true,
  preferDesktop: false,
  checkInstallationImmediately: false
})

export function useDirectWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isMobile = useCallback(() => {
    if (!isClient) return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [isClient])

  const ensureCorrectNetwork = async (provider: SDKProvider) => {
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' }) as string
      
      if (currentChainId !== FLOW_EVM_MAINNET.chainId) {
        console.log(`Switching from chain ${currentChainId} to Flow EVM Mainnet ${FLOW_EVM_MAINNET.chainId}`)
        
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: FLOW_EVM_MAINNET.chainId }],
          })
        } catch (error: unknown) {
          const err = error as { code?: number; message?: string }
          if (err.code === 4902) {
            console.log('Adding Flow EVM Mainnet to wallet...')
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [FLOW_EVM_MAINNET]
            })
          }
        }
        // Add delay after network switch for mobile stability
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Network switching error:', error)
      throw error
    }
  }

  const connectWallet = useCallback(async () => {
    if (!isClient) return

    setIsConnecting(true)
    
    try {
      console.log('Connecting to MetaMask...')
      
      // Use MetaMask SDK for all connections (mobile and desktop)
      const provider = MMSDK.getProvider()
      
      if (!provider) {
        throw new Error('MetaMask provider not available')
      }
      
      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts.length > 0) {
        console.log('Connected to account:', accounts[0])
        
        // Ensure we're on Flow EVM Mainnet
        await ensureCorrectNetwork(provider)
        setAddress(accounts[0])
        
        // Set up account change listener
        if (provider.on) {
          provider.on('accountsChanged', (...args: unknown[]) => {
            const newAccounts = args[0] as string[]
            if (newAccounts.length > 0) {
              setAddress(newAccounts[0])
            } else {
              setAddress(null)
            }
          })
        }
      }
    } catch (error: unknown) {
      console.error('Wallet connection error:', error)
      const err = error as { code?: number; message?: string }
      if (err.code === 4001) {
        // User rejected connection
        return
      }
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [isClient])

  const disconnect = useCallback(() => {
    setAddress(null)
  }, [])

  // Check for existing connection on mount
  useEffect(() => {
    if (!isClient) return

    const checkExistingConnection = async () => {
      try {
        const provider = MMSDK.getProvider()
        
        if (!provider) return
        
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
        if (accounts.length > 0) {
          // Verify we're on correct network
          const currentChainId = await provider.request({ method: 'eth_chainId' }) as string
          if (currentChainId === FLOW_EVM_MAINNET.chainId) {
            setAddress(accounts[0])
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error)
      }
    }

    checkExistingConnection()
  }, [isClient])

  return {
    address,
    isConnected: !!address,
    connectWallet,
    disconnect,
    isConnecting,
    isMobileDevice: isMobile(),
    hasWalletProvider: true, // SDK handles provider detection
    isMetaMaskMobileApp: false // Not needed with SDK
  }
}