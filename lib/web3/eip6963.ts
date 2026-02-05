'use client';

// ============================================================
// EIP-6963 Types
// ============================================================
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

// ============================================================
// Known RDNS identifiers
// ============================================================
export const WALLET_RDNS = {
  FLOW_WALLET: 'com.flowfoundation.wallet',
  METAMASK: 'io.metamask',
  COINBASE: 'com.coinbase.wallet',
} as const;

// ============================================================
// Provider Store — collects all announced wallets
// ============================================================
const discoveredProviders = new Map<string, EIP6963ProviderDetail>();
let isListening = false;

function onAnnounceProvider(event: Event) {
  const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
  const { info, provider } = customEvent.detail;

  if (!info?.rdns || !provider) {
    console.warn('[EIP-6963] Received invalid provider announcement:', { info, hasProvider: !!provider });
    return;
  }

  // Store by RDNS for stable identification (uuid changes each session)
  discoveredProviders.set(info.rdns, { info, provider });

  console.log(`[EIP-6963] Wallet announced: ${info.name} (${info.rdns})`);
  
  // Special handling for Flow Wallet
  if (info.rdns === WALLET_RDNS.FLOW_WALLET || info.name.toLowerCase().includes('flow')) {
    console.log(`[EIP-6963] ✅ Flow Wallet detected: ${info.name} (${info.rdns})`);
  }
}

/**
 * Start listening for wallet announcements.
 * Call this ONCE on app initialization.
 */
export function initEIP6963Discovery(): void {
  if (typeof window === 'undefined') return;
  if (isListening) {
    console.log('[EIP-6963] Already initialized, requesting providers again...');
    // Request again in case wallets weren't ready the first time
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return;
  }

  // Listen for wallet announcements
  window.addEventListener('eip6963:announceProvider', onAnnounceProvider);

  // Request all wallets to announce themselves
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  isListening = true;
  console.log('[EIP-6963] Discovery initialized');
  
  // Request again after a delay to catch wallets that load late
  setTimeout(() => {
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    console.log('[EIP-6963] Re-requesting providers for late-loading wallets');
  }, 1000);
  
  setTimeout(() => {
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    console.log('[EIP-6963] Final provider request');
  }, 3000);
}

/**
 * Get a specific wallet provider by RDNS.
 */
export function getProviderByRDNS(rdns: string): EIP6963ProviderDetail | null {
  return discoveredProviders.get(rdns) || null;
}

/**
 * Get ALL discovered providers.
 */
export function getAllProviders(): EIP6963ProviderDetail[] {
  return Array.from(discoveredProviders.values());
}

/**
 * Get Flow Wallet's EIP-1193 provider specifically.
 * Checks both EIP-6963 (desktop) and mobile-specific detection.
 */
export function getFlowWalletProvider(): EIP1193Provider | null {
  // First check EIP-6963 (desktop browser extensions)
  const detail = discoveredProviders.get(WALLET_RDNS.FLOW_WALLET);
  if (detail?.provider) {
    return detail.provider;
  }
  
  // Fall back to mobile-specific detection
  if (typeof window !== 'undefined') {
    const mobileProvider = checkMobileFlowWallet();
    if (mobileProvider) {
      return mobileProvider;
    }
  }
  
  return null;
}

/**
 * Get MetaMask's EIP-1193 provider specifically.
 */
export function getMetaMaskProvider(): EIP1193Provider | null {
  const detail = discoveredProviders.get(WALLET_RDNS.METAMASK);
  return detail?.provider || null;
}

/**
 * Check for Flow Wallet on mobile devices (not using EIP-6963)
 * Mobile apps may inject providers differently
 */
function checkMobileFlowWallet(): EIP1193Provider | null {
  if (typeof window === 'undefined') return null;
  
  const win = window as any;
  
  // Check if window.ethereum is Flow Wallet on mobile
  if (win.ethereum) {
    // Check for Flow Wallet specific properties
    if (win.ethereum.isFlowWallet || 
        win.ethereum.providers?.some((p: any) => p.isFlowWallet) ||
        win.flowWallet) {
      console.log('[Mobile] Flow Wallet detected via window.ethereum');
      return win.ethereum.isFlowWallet ? win.ethereum : win.flowWallet || win.ethereum;
    }
    
    // On mobile, Flow Wallet might be in providers array
    if (Array.isArray(win.ethereum.providers)) {
      const flowProvider = win.ethereum.providers.find((p: any) => 
        p.isFlowWallet || 
        (p.constructor?.name?.toLowerCase().includes('flow')) ||
        (p._state?.isFlowWallet)
      );
      if (flowProvider) {
        console.log('[Mobile] Flow Wallet found in providers array');
        return flowProvider;
      }
    }
  }
  
  // Direct window.flowWallet check
  if (win.flowWallet && typeof win.flowWallet.request === 'function') {
    console.log('[Mobile] Flow Wallet detected via window.flowWallet');
    return win.flowWallet;
  }
  
  return null;
}

/**
 * Check if Flow Wallet has been discovered (desktop EIP-6963 or mobile).
 */
export function isFlowWalletAvailable(): boolean {
  // Check EIP-6963 first (desktop browser extensions)
  if (discoveredProviders.has(WALLET_RDNS.FLOW_WALLET)) {
    return true;
  }
  
  // Check mobile-specific detection
  if (typeof window !== 'undefined') {
    const mobileProvider = checkMobileFlowWallet();
    if (mobileProvider) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if MetaMask has been discovered.
 */
export function isMetaMaskAvailable(): boolean {
  return discoveredProviders.has(WALLET_RDNS.METAMASK);
}
