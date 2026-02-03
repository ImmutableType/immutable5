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
 */
export function getFlowWalletProvider(): EIP1193Provider | null {
  const detail = discoveredProviders.get(WALLET_RDNS.FLOW_WALLET);
  return detail?.provider || null;
}

/**
 * Get MetaMask's EIP-1193 provider specifically.
 */
export function getMetaMaskProvider(): EIP1193Provider | null {
  const detail = discoveredProviders.get(WALLET_RDNS.METAMASK);
  return detail?.provider || null;
}

/**
 * Check if Flow Wallet has been discovered.
 */
export function isFlowWalletAvailable(): boolean {
  return discoveredProviders.has(WALLET_RDNS.FLOW_WALLET);
}

/**
 * Check if MetaMask has been discovered.
 */
export function isMetaMaskAvailable(): boolean {
  return discoveredProviders.has(WALLET_RDNS.METAMASK);
}
