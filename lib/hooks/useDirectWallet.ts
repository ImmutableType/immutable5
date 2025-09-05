'use client'

import { useState, useEffect, useCallback } from 'react'

const FLOW_EVM_TESTNET = {
  chainId: '0x221',
  chainName: 'Flow EVM Testnet',
  rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm-testnet.flowscan.org'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
}

export function useDirectWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
          }
        })
        .catch(console.error)
    }
  }, [])

  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) return

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
    
    if (currentChainId !== FLOW_EVM_TESTNET.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: FLOW_EVM_TESTNET.chainId }],
        })
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [FLOW_EVM_TESTNET]
          })
        }
      }
    }
  }

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true)
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }

      await ensureCorrectNetwork()

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
      }
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected - don't show error
        return
      }
      console.error('Connection failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
  }, [])

  return {
    address,
    isConnected: !!address,
    connectWallet,
    disconnect,
    isConnecting
  }
}