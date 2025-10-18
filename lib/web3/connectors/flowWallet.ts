'use client';

import { ChainNotConfiguredError, createConnector } from 'wagmi';
import { getAddress } from 'viem';
import type { WindowProvider } from 'wagmi';

declare global {
  interface Window {
    ethereum?: WindowProvider & {
      providers?: WindowProvider[];
      isFlow?: boolean;
    };
  }
}

type FlowWalletProvider = WindowProvider & {
  isFlow: boolean;
};

export interface FlowWalletOptions {
  /**
   * MetaMask and other wallets may also inject `window.ethereum`
   * Flow Wallet can be detected by checking for `window.ethereum.isFlow`
   */
  getProvider?: () => FlowWalletProvider | undefined;
  /**
   * Options to pass to the WalletConnect connector if Flow Wallet is not injected
   */
  walletConnectOptions?: {
    projectId: string;
    metadata?: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
}

flowWalletConnector.type = 'flowWallet' as const;

export function flowWalletConnector(options: FlowWalletOptions = {}) {
  const getProvider = () => {
    if (typeof window === 'undefined') return;
    
    const ethereum = window.ethereum;
    if (!ethereum) return;
    
    // Check if Flow Wallet is available
    if (ethereum.isFlow) {
      return ethereum as FlowWalletProvider;
    }
    
    // Check providers array for Flow Wallet
    if (ethereum.providers?.length) {
      const flowProvider = ethereum.providers.find((provider) => 
        (provider as any).isFlow
      );
      if (flowProvider) return flowProvider as FlowWalletProvider;
    }
    
    return undefined;
  };

  return createConnector((config) => ({
    id: 'flow-wallet',
    name: 'Flow Wallet',
    type: flowWalletConnector.type,

    async setup() {
      // This will help detect the provider as soon as possible
      const provider = getProvider();
      if (provider) {
        // Listen for accounts change
        provider.on('accountsChanged', this.onAccountsChanged.bind(this));
        // Listen for chain change
        provider.on('chainChanged', this.onChainChanged.bind(this));
        // Listen for disconnect
        provider.on('disconnect', this.onDisconnect.bind(this));
      }
    },

    async connect({ chainId } = {}) {
      const provider = getProvider();
      
      if (!provider) {
        throw new Error('Flow Wallet not found. Please install the Flow Wallet extension.');
      }

      let accounts: readonly `0x${string}`[] = [];
      
      try {
        // Request accounts
        accounts = await provider.request({
          method: 'eth_requestAccounts',
        }) as `0x${string}`[];

        if (!accounts.length) {
          throw new Error('No accounts returned from Flow Wallet');
        }

        // Get current chain
        const currentChainIdHex = await provider.request({
          method: 'eth_chainId',
        }) as string;
        
        const currentChainId = parseInt(currentChainIdHex, 16);

        // Switch chain if needed
        if (chainId && currentChainId !== chainId) {
          await this.switchChain({ chainId });
        }

        return {
          accounts,
          chainId: currentChainId,
        };
      } catch (error) {
        console.error('Flow Wallet connection error:', error);
        throw error;
      }
    },

    async disconnect() {
      const provider = getProvider();
      if (!provider) return;
      
      // Flow Wallet doesn't have a disconnect method, but we can clear listeners
      provider.removeAllListeners();
    },

    async getAccounts() {
      const provider = getProvider();
      if (!provider) return [];
      
      try {
        const accounts = await provider.request({
          method: 'eth_accounts',
        }) as string[];
        
        return accounts.map(account => getAddress(account) as `0x${string}`);
      } catch {
        return [];
      }
    },

    async getChainId() {
      const provider = getProvider();
      if (!provider) throw new Error('Flow Wallet not found');
      
      const chainIdHex = await provider.request({
        method: 'eth_chainId',
      }) as string;
      
      return parseInt(chainIdHex, 16);
    },

    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return !!accounts.length;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const provider = getProvider();
      if (!provider) throw new Error('Flow Wallet not found');
      
      const chainIdHex = `0x${chainId.toString(16)}`;
      
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        
        return config.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${chainId}`,
          network: `${chainId}`,
          nativeCurrency: { name: 'FLOW', decimals: 18, symbol: 'FLOW' },
          rpcUrls: { default: { http: [] }, public: { http: [] } },
        };
      } catch (error: any) {
        // Chain not added to wallet
        if (error.code === 4902) {
          throw new ChainNotConfiguredError();
        }
        throw error;
      }
    },

    async getProvider() {
      return getProvider();
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect');
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x) as `0x${string}`),
        });
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
}