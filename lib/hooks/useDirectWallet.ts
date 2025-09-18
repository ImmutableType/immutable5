'use client'

import { useState, useEffect, useCallback } from 'react'
import { SDKProvider } from '@metamask/sdk'
import { MMSDK } from '../web3/metamask'

// Use environment variables for Flow EVM configuration
const FLOW_EVM_MAINNET = {
  chainId: `0x${parseInt(process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID || '747').toString(16)}`,
  chainName: 'Flow EVM Mainnet',
  rpcUrls: [process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm.flowscan.io'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}

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
      console.log('Current chain ID:', currentChainId, 'Target:', FLOW_EVM_MAINNET.chainId)
      
      if (currentChainId !== FLOW_EVM_MAINNET.chainId) {
        console.log(`Switching from chain ${currentChainId} to Flow EVM Mainnet ${FLOW_EVM_MAINNET.chainId}`)
        
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: FLOW_EVM_MAINNET.chainId }],
          })
          console.log('Network switch successful')
        } catch (error: unknown) {
          const err = error as { code?: number; message?: string }
          if (err.code === 4902) {
            console.log('Adding Flow EVM Mainnet to wallet...')
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [FLOW_EVM_MAINNET]
            })
            console.log('Network added successfully')
          } else {
            console.error('Network switch failed:', err.message)
            throw error
          }
        }
        // Longer delay for network stabilization
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log('Already on correct network')
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
      console.log('=== WALLET CONNECTION START ===')
      console.log('1. Initiating MetaMask SDK connection...')
      
      // First attempt: Use SDK connect method
      const accounts = await MMSDK.connect()
      console.log('2. SDK connect result:', accounts)
      
      if (accounts && accounts.length > 0) {
        console.log('3. Got accounts:', accounts[0])
        
        // Get provider after successful connection
        const provider = MMSDK.getProvider()
        console.log('4. Provider available:', !!provider)
        
        if (provider) {
          // Check and switch network BEFORE setting address
          try {
            await ensureCorrectNetwork(provider)
            console.log('5. Network check completed')
            
            // Verify connection is still active after network switch
            const finalAccounts = await provider.request({ method: 'eth_accounts' }) as string[]
            console.log('6. Final account verification:', finalAccounts)
            
            if (finalAccounts.length > 0) {
              setAddress(finalAccounts[0])
              console.log('7. Address set successfully:', finalAccounts[0])
              
              // Set up account change listener
              if (provider.on) {
                provider.on('accountsChanged', (...args: unknown[]) => {
                  console.log('Account changed event:', args)
                  const newAccounts = args[0] as string[]
                  if (newAccounts.length > 0) {
                    setAddress(newAccounts[0])
                  } else {
                    setAddress(null)
                  }
                })
                
                provider.on('chainChanged', (...args: unknown[]) => {
                  const chainId = args[0] as string
                  console.log('Chain changed event:', chainId)
                })
              }
            } else {
              throw new Error('No accounts available after network switch')
            }
          } catch (networkError) {
            console.error('Network setup failed:', networkError)
            throw new Error('Failed to connect to Flow EVM Mainnet. Please switch networks manually in MetaMask.')
          }
        } else {
          throw new Error('Provider not available after connection')
        }
      } else {
        throw new Error('No accounts returned from MetaMask')
      }
      
      console.log('=== WALLET CONNECTION SUCCESS ===')
    } catch (error: unknown) {
      console.error('=== WALLET CONNECTION FAILED ===')
      console.error('Error details:', error)
      
      const err = error as { code?: number; message?: string }
      if (err.code === 4001) {
        console.log('User rejected connection')
        return
      }
      
      // Don't throw - just log and let UI handle the failure
      console.error('Connection error:', err.message)
    } finally {
      setIsConnecting(false)
    }
  }, [isClient])

  const disconnect = useCallback(() => {
    console.log('Disconnecting wallet...')
    setAddress(null)
  }, [])

  // Check for existing connection on mount
  useEffect(() => {
    if (!isClient) return

    const checkExistingConnection = async () => {
      try {
        console.log('Checking for existing wallet connection...')
        const provider = MMSDK.getProvider()
        
        if (!provider) {
          console.log('No provider available')
          return
        }
        
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
        console.log('Existing accounts found:', accounts)
        
        if (accounts.length > 0) {
          // Verify we're on correct network
          const currentChainId = await provider.request({ method: 'eth_chainId' }) as string
          console.log('Current network:', currentChainId, 'Expected:', FLOW_EVM_MAINNET.chainId)
          
          if (currentChainId === FLOW_EVM_MAINNET.chainId) {
            console.log('Restoring connection to:', accounts[0])
            setAddress(accounts[0])
          } else {
            console.log('Wrong network, connection not restored')
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error)
      }
    }

    // Small delay to ensure SDK is ready
    setTimeout(checkExistingConnection, 500)
  }, [isClient])

  return {
    address,
    isConnected: !!address,
    connectWallet,
    disconnect,
    isConnecting,
    isMobileDevice: isMobile(),
    hasWalletProvider: true,
    isMetaMaskMobileApp: false
  }
}