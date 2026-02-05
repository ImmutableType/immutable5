'use client'

import { useState, useEffect, useCallback } from 'react'
import { SDKProvider } from '@metamask/sdk'
import { MMSDK } from '../web3/metamask'
import { 
  isFlowWalletAvailable, 
  getFlowWalletProvider, 
  isMetaMaskAvailable,
} from '../web3/eip6963'
import { ethers } from 'ethers'

// Flow EVM Mainnet configuration
const FLOW_EVM_MAINNET = {
  chainId: `0x${parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747').toString(16)}`, // 0x2eb
  chainName: 'Flow EVM Mainnet',
  rpcUrls: [process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm.flowscan.io'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}

export type WalletType = 'metamask' | 'flow-wallet' | null

export interface UnifiedWalletReturn {
  address: string | null
  isConnected: boolean
  walletType: WalletType
  connectWallet: (walletType: 'metamask' | 'flow-wallet') => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  isClient: boolean
  isMobileDevice: boolean
  availableWallets: {
    metamask: boolean
    flowWallet: boolean
  }
  provider: ethers.BrowserProvider | null
}

export function useUnifiedWallet(): UnifiedWalletReturn {
  const [address, setAddress] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [availableWallets, setAvailableWallets] = useState({
    metamask: false,
    flowWallet: false
  })
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check available wallets and mobile device
    if (typeof window !== 'undefined') {
      // Initialize EIP-6963 discovery immediately
      import('../web3/eip6963').then(({ initEIP6963Discovery }) => {
        initEIP6963Discovery()
        
        // Check availability immediately, then again after delay for wallets that announce late
        const checkWallets = () => {
          // On mobile, also check for direct window.ethereum injection
          let flowWalletAvailable = isFlowWalletAvailable()
          
          // On mobile, Flow Wallet might not use EIP-6963, check directly
          if (typeof window !== 'undefined' && !flowWalletAvailable) {
            const win = window as any
            if (win.ethereum?.isFlowWallet || win.flowWallet) {
              flowWalletAvailable = true
              console.log('[Mobile] Flow Wallet detected via direct window check')
            }
          }
          
          setAvailableWallets({
            metamask: isMetaMaskAvailable(),
            flowWallet: flowWalletAvailable
          })
        }
        
        // Initial check
        checkWallets()
        
        // Check again after delay for wallets that announce late
        setTimeout(checkWallets, 500)
        setTimeout(checkWallets, 1000)
        setTimeout(checkWallets, 2000)
        setTimeout(checkWallets, 3000) // Extra check for mobile apps
      })
      
      // Check if mobile device (for UI optimizations, not blocking)
      // This allows components to adjust their UI for mobile devices
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobileDevice(mobile)
    }
  }, [])

  const ensureCorrectNetwork = async (provider: SDKProvider | any) => {
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' }) as string
      const targetChainId = FLOW_EVM_MAINNET.chainId
      
      // Normalize chain IDs for comparison (handle both hex and decimal)
      const normalizeChainId = (id: string | number): string => {
        if (typeof id === 'number') return `0x${id.toString(16)}`
        if (id.startsWith('0x')) return id.toLowerCase()
        return `0x${parseInt(id).toString(16)}`
      }
      
      const currentNormalized = normalizeChainId(currentChainId)
      const targetNormalized = normalizeChainId(targetChainId)
      
      console.log('=== NETWORK CHECK ===')
      console.log('Current chain ID:', currentChainId, `(normalized: ${currentNormalized})`)
      console.log('Target chain ID:', targetChainId, `(normalized: ${targetNormalized})`)
      
      if (currentNormalized !== targetNormalized) {
        console.log(`🔄 Switching to Flow EVM Mainnet ${targetChainId}`)
        
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          })
          console.log('✅ Network switch successful')
        } catch (error: unknown) {
          const err = error as { code?: number; message?: string }
          if (err.code === 4902) {
            console.log('➕ Adding Flow EVM Mainnet to wallet...')
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [FLOW_EVM_MAINNET]
            })
            console.log('✅ Network added successfully')
          } else {
            console.error('❌ Network switch failed:', err.message)
            throw new Error(`Failed to switch to Flow EVM Mainnet: ${err.message}`)
          }
        }
        
        // Wait for network stabilization
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log('✅ Already on Flow EVM Mainnet')
      }
    } catch (error) {
      console.error('❌ Network switching error:', error)
      throw error
    }
  }

  const connectMetaMask = async () => {
    console.log('🔌 Connecting with MetaMask...')
    
    const accounts = await MMSDK.connect()
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from MetaMask')
    }
    
    const mmProvider = MMSDK.getProvider()
    if (!mmProvider) {
      throw new Error('MetaMask provider not available')
    }
    
    await ensureCorrectNetwork(mmProvider)
    
    const finalAccounts = await mmProvider.request({ method: 'eth_accounts' }) as string[]
    if (finalAccounts.length === 0) {
      throw new Error('No accounts available after connection')
    }
    
    const browserProvider = new ethers.BrowserProvider(mmProvider)
    
    // Update all state synchronously to ensure React re-renders
    const connectedAddress = finalAccounts[0]
    setProvider(browserProvider)
    setAddress(connectedAddress)
    setWalletType('metamask')
    
    // Force a state update by using a callback to ensure React detects the change
    // This ensures the UI updates immediately after connection
    setTimeout(() => {
      // Verify the connection is still active
      mmProvider.request({ method: 'eth_accounts' }).then((accounts: unknown) => {
        const accountsArray = accounts as string[]
        if (accountsArray && accountsArray.length > 0 && accountsArray[0] === connectedAddress) {
          // Connection is still valid, ensure state is set
          setAddress(accountsArray[0])
          setWalletType('metamask')
          setProvider(browserProvider)
        }
      }).catch((error: unknown) => {
        console.error('❌ Error verifying MetaMask connection:', error)
      })
    }, 100)
    
    // Set up event listeners
    if (mmProvider.on) {
      mmProvider.on('accountsChanged', (accounts: unknown) => {
        const accountsArray = accounts as string[]
        if (accountsArray && accountsArray.length > 0) {
          setAddress(accountsArray[0])
          setWalletType('metamask')
        } else {
          setAddress(null)
          setWalletType(null)
          setProvider(null)
        }
      })
      
      mmProvider.on('chainChanged', () => {
        // Optionally handle chain changes
      })
    }
    
    console.log('✅ MetaMask connected:', connectedAddress)
  }

  const connectFlowWallet = async () => {
    console.log('🔌 Connecting with Flow Wallet...')
    
    // Check if we're on mobile iOS
    const isMobileIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    try {
      // Initialize EIP-6963 discovery if not already done
      const { initEIP6963Discovery, getAllProviders } = await import('../web3/eip6963')
      initEIP6963Discovery()
      
      let flowProvider: any = null
      const win = window as any
      
      // On mobile iOS, Flow Wallet might need to be opened first
      if (isMobileIOS) {
        console.log('📱 iOS mobile detected - checking for Flow Wallet app...')
        
        // Try to detect Flow Wallet first
        flowProvider = getFlowWalletProvider()
        
        if (!flowProvider) {
          // Check window object for mobile injection
          if (win.ethereum?.isFlowWallet) {
            flowProvider = win.ethereum
          } else if (win.flowWallet && typeof win.flowWallet.request === 'function') {
            flowProvider = win.flowWallet
          }
        }
        
        // If still not found, try to open Flow Wallet app via deep link
        if (!flowProvider) {
          console.log('📱 Flow Wallet not detected - attempting to open Flow Wallet app...')
          
          // Flow Wallet deep link schemes (common patterns)
          const deepLinkSchemes = [
            'flowwallet://',
            'flow-wallet://',
            'com.flowfoundation.wallet://',
            'flow://'
          ]
          
          let appOpened = false
          for (const scheme of deepLinkSchemes) {
            try {
              // Try to open the app using hidden iframe (doesn't navigate away)
              const iframe = document.createElement('iframe')
              iframe.style.display = 'none'
              iframe.src = scheme
              document.body.appendChild(iframe)
              
              // Remove iframe after a short delay
              setTimeout(() => {
                document.body.removeChild(iframe)
              }, 1000)
              
              appOpened = true
              console.log(`📱 Attempted to open Flow Wallet via ${scheme}`)
              break
            } catch (e) {
              // Continue to next scheme
              console.log(`📱 Failed to open via ${scheme}:`, e)
            }
          }
          
          if (appOpened) {
            // Wait a bit for the app to inject provider or user to return
            console.log('📱 Waiting for Flow Wallet to inject provider or user to return from app...')
            
            // Wait longer and check multiple times
            for (let i = 0; i < 10; i++) {
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Check again after delay
              flowProvider = getFlowWalletProvider()
              if (!flowProvider && win.ethereum?.isFlowWallet) {
                flowProvider = win.ethereum
              } else if (!flowProvider && win.flowWallet && typeof win.flowWallet.request === 'function') {
                flowProvider = win.flowWallet
              }
              
              if (flowProvider) {
                console.log(`✅ Flow Wallet detected after ${i + 1} checks`)
                break
              }
            }
          }
        }
        
        // If still not found after trying to open app, provide helpful error
        if (!flowProvider) {
          throw new Error('Flow Wallet app not detected. Please ensure the Flow Wallet app is installed. If installed, try opening the app manually, then return to this page and try connecting again.')
        }
      } else {
        // Desktop flow - use existing logic
        // Give wallets time to announce - try multiple times
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 300))
          flowProvider = getFlowWalletProvider()
          if (flowProvider) {
            console.log(`✅ Flow Wallet found after ${i + 1} attempts`)
            break
          }
          
          // Log all discovered providers for debugging
          const allProviders = getAllProviders()
          console.log(`🔍 Attempt ${i + 1}: Discovered providers:`, allProviders.map(p => p.info.name))
        }
        
        console.log('🔍 Flow Wallet provider result:', flowProvider ? 'Found' : 'Not found')
        
        if (!flowProvider) {
          // Check if Flow Wallet might be installed but not announcing
          const allProviders = getAllProviders()
          const flowProviders = allProviders.filter(p => 
            p.info.name.toLowerCase().includes('flow') || 
            p.info.rdns.includes('flow')
          )
          
          if (flowProviders.length > 0) {
            console.log('⚠️ Found Flow-related providers:', flowProviders.map(p => p.info.name))
            // Try using the first Flow-related provider
            flowProvider = flowProviders[0].provider
          } else {
            // Check if they have Cadence/native Flow wallet (not compatible with Flow EVM)
            if (win.fcl || win.fcl_extensions) {
              console.log('⚠️ Detected Flow FCL (Cadence wallet) - not compatible with Flow EVM')
              throw new Error('You appear to have a Cadence/native Flow wallet installed. This app requires Flow EVM wallet (Ethereum-compatible). Please install the Flow Wallet extension for Flow EVM support, or use MetaMask with Flow EVM network configured.')
            }
            
            // Check for Flow Wallet injection
            if (win.ethereum?.isFlowWallet) {
              console.log('📱 Flow Wallet detected via window.ethereum')
              flowProvider = win.ethereum
            } else if (win.flowWallet && typeof win.flowWallet.request === 'function') {
              console.log('📱 Flow Wallet detected via window.flowWallet')
              flowProvider = win.flowWallet
            } else if (win.ethereum?.providers) {
              // Check providers array for Flow Wallet
              const flowProviderInArray = win.ethereum.providers.find((p: any) => 
                p.isFlowWallet || 
                (p.constructor?.name?.toLowerCase().includes('flow'))
              )
              if (flowProviderInArray) {
                console.log('📱 Flow Wallet found in providers array')
                flowProvider = flowProviderInArray
              }
            }
            
            if (!flowProvider) {
              throw new Error('Flow EVM Wallet not detected. Please install the Flow Wallet extension (for Flow EVM, not Cadence) or use MetaMask with Flow EVM network configured. Note: Cadence/native Flow wallets are not compatible with this app.')
            }
          }
        }
      }
      
      if (!flowProvider) {
        throw new Error('Flow Wallet provider not available. Please ensure Flow Wallet is installed and try again.')
      }
      
      console.log('✅ Flow Wallet provider found, requesting accounts...')
      
      // Request account access
      const accounts = await flowProvider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      console.log('📋 Accounts from request:', accounts)
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Flow Wallet')
      }
      
      console.log('✅ Accounts received, ensuring correct network...')
      await ensureCorrectNetwork(flowProvider)
      
      const finalAccounts = await flowProvider.request({ method: 'eth_accounts' }) as string[]
      console.log('📋 Final accounts:', finalAccounts)
      
      if (finalAccounts.length === 0) {
        throw new Error('No accounts available after connection')
      }
      
      console.log('✅ Creating ethers provider...')
      const browserProvider = new ethers.BrowserProvider(flowProvider as any, 'any')
      
      // Update all state synchronously to ensure React re-renders
      const connectedAddress = finalAccounts[0]
      setProvider(browserProvider)
      setAddress(connectedAddress)
      setWalletType('flow-wallet')
      
      // Force a state update by using a callback to ensure React detects the change
      // This ensures the UI updates immediately after connection
      setTimeout(() => {
        // Verify the connection is still active
        flowProvider.request({ method: 'eth_accounts' }).then((accounts: unknown) => {
          const accountsArray = accounts as string[]
          if (accountsArray && accountsArray.length > 0 && accountsArray[0] === connectedAddress) {
            // Connection is still valid, ensure state is set
            setAddress(accountsArray[0])
            setWalletType('flow-wallet')
            setProvider(browserProvider)
          }
        }).catch((error: unknown) => {
          console.error('❌ Error verifying Flow Wallet connection:', error)
        })
      }, 100)
      
      // Set up event listeners if available
      if (flowProvider.on) {
        flowProvider.on('accountsChanged', (accounts: unknown) => {
          const accountsArray = accounts as string[]
          if (accountsArray && accountsArray.length > 0) {
            setAddress(accountsArray[0])
            setWalletType('flow-wallet')
          } else {
            setAddress(null)
            setWalletType(null)
            setProvider(null)
          }
        })
        
        flowProvider.on('chainChanged', () => {
          // Optionally handle chain changes
        })
      }
      
      console.log('✅ Flow Wallet connected successfully:', connectedAddress)
    } catch (error: unknown) {
      console.error('❌ Flow Wallet connection error:', error)
      const err = error as { code?: number; message?: string; stack?: string }
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      })
      throw error
    }
  }

  const connectWallet = useCallback(async (type: 'metamask' | 'flow-wallet') => {
    if (!isClient) return

    setIsConnecting(true)
    
    try {
      if (type === 'metamask') {
        await connectMetaMask()
      } else if (type === 'flow-wallet') {
        await connectFlowWallet()
      } else {
        throw new Error('Invalid wallet type')
      }
    } catch (error: unknown) {
      console.error('=== WALLET CONNECTION FAILED ===')
      console.error('❌ Error details:', error)
      
      const err = error as { code?: number; message?: string }
      if (err.code === 4001) {
        console.log('👤 User rejected connection')
        return
      }
      
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [isClient])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting wallet...')
    setAddress(null)
    setWalletType(null)
    setProvider(null)
  }, [])

  // Check for existing connection on mount
  useEffect(() => {
    if (!isClient) return

    const checkExistingConnection = async () => {
      try {
        // Initialize EIP-6963 discovery first
        const { initEIP6963Discovery } = await import('../web3/eip6963')
        initEIP6963Discovery()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Normalize chain IDs for comparison
        const normalizeChainId = (id: string | number): string => {
          if (typeof id === 'number') return `0x${id.toString(16)}`
          if (id.startsWith('0x')) return id.toLowerCase()
          return `0x${parseInt(id).toString(16)}`
        }
        const targetChainIdNormalized = normalizeChainId(FLOW_EVM_MAINNET.chainId)

        // Check MetaMask first (gracefully handle if not installed)
        try {
          const mmProvider = MMSDK.getProvider()
          if (mmProvider) {
            try {
              const accounts = await mmProvider.request({ method: 'eth_accounts' }) as string[]
              if (accounts.length > 0) {
                const chainId = await mmProvider.request({ method: 'eth_chainId' }) as string
                const currentChainIdNormalized = normalizeChainId(chainId)
                console.log('🔍 Checking MetaMask connection:', {
                  chainId,
                  normalized: currentChainIdNormalized,
                  target: targetChainIdNormalized,
                  match: currentChainIdNormalized === targetChainIdNormalized
                })
                if (currentChainIdNormalized === targetChainIdNormalized) {
                  const browserProvider = new ethers.BrowserProvider(mmProvider)
                  setProvider(browserProvider)
                  setAddress(accounts[0])
                  setWalletType('metamask')
                  console.log('✅ Restored MetaMask connection')
                  return
                }
              }
            } catch (mmError: unknown) {
              // MetaMask not installed or not connected - this is fine, continue to Flow Wallet
              const err = mmError as { message?: string }
              if (err.message?.includes('MetaMask') || err.message?.includes('eth_requestAccounts')) {
                // Silently continue - MetaMask not available is expected for Flow Wallet users
                console.log('ℹ️ MetaMask not available, checking Flow Wallet...')
              } else {
                // Unexpected error, log it but continue
                console.warn('⚠️ MetaMask check failed:', err.message)
              }
            }
          }
        } catch (mmInitError: unknown) {
          // MetaMask SDK initialization error - continue to Flow Wallet
          console.log('ℹ️ MetaMask SDK not available, checking Flow Wallet...')
        }
        
        // Check Flow Wallet via EIP-6963
        const flowProvider = getFlowWalletProvider()
        if (flowProvider) {
          const accounts = await flowProvider.request({ method: 'eth_accounts' }) as string[]
          if (accounts.length > 0) {
            const chainId = await flowProvider.request({ method: 'eth_chainId' }) as string
            const currentChainIdNormalized = normalizeChainId(chainId)
            console.log('🔍 Checking Flow Wallet connection:', {
              chainId,
              normalized: currentChainIdNormalized,
              target: targetChainIdNormalized,
              match: currentChainIdNormalized === targetChainIdNormalized
            })
            if (currentChainIdNormalized === targetChainIdNormalized) {
              const browserProvider = new ethers.BrowserProvider(flowProvider as any, 'any')
              setProvider(browserProvider)
              setAddress(accounts[0])
              setWalletType('flow-wallet')
              console.log('✅ Restored Flow Wallet connection')
              return
            }
          }
        }
      } catch (error: unknown) {
        // Only log unexpected errors - MetaMask not being installed is expected for Flow Wallet users
        const err = error as { message?: string }
        if (err.message?.includes('MetaMask') || err.message?.includes('eth_requestAccounts')) {
          // This is expected when MetaMask isn't installed - don't log as error
          console.log('ℹ️ MetaMask not available during connection check (this is normal for Flow Wallet users)')
        } else {
          // Unexpected error - log it
          console.error('❌ Error checking existing connection:', error)
        }
      }
    }

    setTimeout(checkExistingConnection, 500)
  }, [isClient])

  // Compute isConnected based on both address and walletType to ensure accurate state
  const isConnected = !!(address && walletType)

  return {
    address,
    isConnected,
    walletType,
    connectWallet,
    disconnect,
    isConnecting,
    isClient,
    isMobileDevice,
    availableWallets,
    provider
  }
}
