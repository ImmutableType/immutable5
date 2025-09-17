'use client'

import { useState, useEffect, useCallback } from 'react'

interface EthereumError extends Error {
  code: number;
}

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  isMetaMask?: boolean;
  isFlowWallet?: boolean;
  isCoinbaseWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const FLOW_EVM_MAINNET = {
  chainId: '0x2eb',
  chainName: 'Flow EVM Mainnet',
  rpcUrls: ['https://mainnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm.flowscan.io'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}

// Error-safe mobile detection helpers
const isMobile = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  } catch {
    return false
  }
}

const isMetaMaskMobileApp = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  try {
    return navigator.userAgent.includes('MetaMaskMobile')
  } catch {
    return false
  }
}

const hasMetaMaskProvider = () => {
  if (typeof window === 'undefined') return false
  try {
    return !!(window.ethereum?.isMetaMask || window.ethereum)
  } catch {
    return false
  }
}

const getMetaMaskDeepLink = () => {
  try {
    return `https://metamask.app.link/dapp/${window.location.host}/profile/create`
  } catch {
    return 'https://metamask.app.link/dapp/app.immutabletype.com/profile/create'
  }
}

export function useDirectWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [hasWalletProvider, setHasWalletProvider] = useState(false)

  useEffect(() => {
    try {
      setIsMobileDevice(isMobile())
      setHasWalletProvider(hasMetaMaskProvider())
      
      if (window.ethereum) {
        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts) => {
            const accountList = accounts as string[]
            if (accountList.length > 0) {
              setAddress(accountList[0])
            }
          })
          .catch(console.error)
      }
    } catch (error) {
      console.error('Error in wallet initialization:', error)
    }
  }, [])

  const ensureCorrectNetwork = async (provider: EthereumProvider) => {
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' }) as string
      
      if (currentChainId !== FLOW_EVM_MAINNET.chainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: FLOW_EVM_MAINNET.chainId }],
          })
        } catch (error: unknown) {
          const ethError = error as EthereumError
          if (ethError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [FLOW_EVM_MAINNET]
            })
          }
        }
      }
    } catch (error) {
      console.error('Network switching error:', error)
    }
  }

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true)
      
      // Simple approach - always try direct connection first
      if (!window.ethereum) {
        // If no provider, try MetaMask deep link on mobile
        if (isMobileDevice) {
          const deepLink = getMetaMaskDeepLink()
          window.location.href = deepLink
          return
        } else {
          throw new Error('Please install MetaMask')
        }
      }

      // For any device with provider, proceed directly
      const provider = window.ethereum
      await ensureCorrectNetwork(provider)

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts.length > 0) {
        setAddress(accounts[0])
      }
    } catch (err: unknown) {
      const ethError = err as EthereumError
      if (ethError.code === 4001) {
        // User rejected - don't show error
        return
      }
      console.error('Connection failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [isMobileDevice])

  const disconnect = useCallback(() => {
    setAddress(null)
  }, [])

  return {
    address,
    isConnected: !!address,
    connectWallet,
    disconnect,
    isConnecting,
    isMobileDevice,
    hasWalletProvider,
    isMetaMaskMobileApp: isMetaMaskMobileApp()
  }
}