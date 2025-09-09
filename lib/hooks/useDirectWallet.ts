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
        .then((accounts) => {
          const accountList = accounts as string[]
          if (accountList.length > 0) {
            setAddress(accountList[0])
          }
        })
        .catch(console.error)
    }
  }, [])

  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) return

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string
    
    if (currentChainId !== FLOW_EVM_TESTNET.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: FLOW_EVM_TESTNET.chainId }],
        })
      } catch (error: unknown) {
        const ethError = error as EthereumError
        if (ethError.code === 4902) {
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