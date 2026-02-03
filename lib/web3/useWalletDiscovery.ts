'use client';

import { useState, useEffect } from 'react';
import {
  EIP6963ProviderDetail,
  WALLET_RDNS,
} from './eip6963';

export interface DiscoveredWallets {
  all: EIP6963ProviderDetail[];
  flowWallet: EIP6963ProviderDetail | null;
  metaMask: EIP6963ProviderDetail | null;
}

/**
 * React hook that discovers all EIP-6963 wallets.
 * Returns reactive state that updates as wallets announce themselves.
 */
export function useWalletDiscovery(): DiscoveredWallets {
  const [wallets, setWallets] = useState<Map<string, EIP6963ProviderDetail>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAnnounce = (event: Event) => {
      const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
      const { info, provider } = customEvent.detail;
      if (!info?.rdns || !provider) return;

      setWallets(prev => {
        const next = new Map(prev);
        next.set(info.rdns, { info, provider });
        return next;
      });
    };

    // Listen for announcements
    window.addEventListener('eip6963:announceProvider', handleAnnounce);

    // Request wallets to announce
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, []);

  return {
    all: Array.from(wallets.values()),
    flowWallet: wallets.get(WALLET_RDNS.FLOW_WALLET) || null,
    metaMask: wallets.get(WALLET_RDNS.METAMASK) || null,
  };
}
