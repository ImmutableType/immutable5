// Flow Wallet integration for Flow EVM
// Flow Wallet supports Flow EVM through standard EIP-1193 provider interface

export type WalletType = 'metamask' | 'flow-wallet' | null

export interface FlowWalletProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on?(event: string, handler: (...args: unknown[]) => void): void
  removeListener?(event: string, handler: (...args: unknown[]) => void): void
  isFlowWallet?: boolean
  isMetaMask?: boolean
}

// Check if Flow Wallet is available
// Flow Wallet uses FCL (Flow Client Library) extensions protocol
// For Flow EVM, it should expose an EIP-1193 compatible provider
export function isFlowWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false
  
  const win = window as any
  
  // Flow Wallet uses FCL extensions - check if fcl_extensions exists
  // This indicates Flow Wallet extension is installed
  if (win.fcl_extensions && typeof win.fcl_extensions === 'object') {
    const fclKeys = Object.keys(win.fcl_extensions)
    // If fcl_extensions has any entries, Flow Wallet is likely installed
    if (fclKeys.length > 0) {
      console.log('✅ Flow Wallet detected via fcl_extensions')
      return true
    }
  }
  
  // Flow Wallet may inject as window.flowWallet or window.ethereum with Flow Wallet flag
  const flowWallet = win.flowWallet
  const ethereum = win.ethereum
  
  // More detailed logging - show actual values, not just "Object"
  const detectionInfo = {
    hasFlowWallet: !!flowWallet,
    flowWalletType: typeof flowWallet,
    flowWalletKeys: flowWallet ? Object.keys(flowWallet).slice(0, 10) : [],
    hasEthereum: !!ethereum,
    ethereumIsFlowWallet: ethereum?.isFlowWallet,
    ethereumIsFlowWalletUnderscore: ethereum?._isFlowWallet,
    ethereumProviders: ethereum?.providers ? ethereum.providers.length : 0,
    ethereumProviderTypes: ethereum?.providers ? ethereum.providers.map((p: any) => ({
      isFlowWallet: p.isFlowWallet,
      _isFlowWallet: p._isFlowWallet,
      constructorName: p.constructor?.name,
      hasRequest: typeof p.request === 'function'
    })) : [],
    allWindowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('flow')),
    allEthereumKeys: ethereum ? Object.keys(ethereum).slice(0, 20) : []
  }
  
  console.log('🔍 Flow Wallet Detection - Full Details:', JSON.stringify(detectionInfo, null, 2))
  
  // Log the actual window.ethereum object structure
  if (ethereum) {
    console.log('🔍 window.ethereum object:', JSON.stringify({
      keys: Object.keys(ethereum),
      isMetaMask: ethereum.isMetaMask,
      isFlowWallet: ethereum.isFlowWallet,
      _isFlowWallet: ethereum._isFlowWallet,
      hasProviders: !!ethereum.providers,
      providersLength: ethereum.providers?.length,
      request: typeof ethereum.request
    }, null, 2))
    
    // Log each provider in the array if it exists
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
      console.log('🔍 ethereum.providers array:', ethereum.providers.map((p: any, i: number) => ({
        index: i,
        isFlowWallet: p.isFlowWallet,
        _isFlowWallet: p._isFlowWallet,
        isMetaMask: p.isMetaMask,
        constructorName: p.constructor?.name,
        hasRequest: typeof p.request === 'function',
        keys: Object.keys(p).slice(0, 10)
      })))
    }
  }
  
  // Log all window properties that might be Flow Wallet
  const allWindowKeys = Object.keys(window)
  const flowRelatedKeys = allWindowKeys.filter(k => 
    k.toLowerCase().includes('flow') || 
    k.toLowerCase().includes('fcl') ||
    k.toLowerCase().includes('cadence')
  )
  if (flowRelatedKeys.length > 0) {
    console.log('🔍 Flow-related window properties:', flowRelatedKeys)
    flowRelatedKeys.forEach(key => {
      const value = (window as any)[key]
      console.log(`  - window.${key}:`, {
        type: typeof value,
        isObject: typeof value === 'object',
        hasRequest: typeof value?.request === 'function',
        keys: typeof value === 'object' ? Object.keys(value).slice(0, 20) : []
      })
      
      // Check if fcl_extensions has wallet providers
      if (key === 'fcl_extensions' && value && typeof value === 'object') {
        console.log(`  - window.${key} full inspection:`, JSON.stringify({
          keys: Object.keys(value),
          values: Object.keys(value).reduce((acc: any, k: string) => {
            const v = value[k]
            acc[k] = {
              type: typeof v,
              hasRequest: typeof v?.request === 'function',
              isProvider: typeof v?.request === 'function' && typeof v?.on === 'function',
              keys: typeof v === 'object' ? Object.keys(v).slice(0, 10) : []
            }
            return acc
          }, {})
        }, null, 2))
      }
    })
  }
  
  // Check if fcl_extensions contains wallet providers
  const fclExtensions = (window as any).fcl_extensions
  if (fclExtensions && typeof fclExtensions === 'object') {
    console.log('🔍 Inspecting fcl_extensions for wallet providers...')
    const fclKeys = Object.keys(fclExtensions)
    for (const key of fclKeys) {
      const extension = fclExtensions[key]
      // Check if it's an EIP-1193 provider (has request method)
      if (extension && typeof extension.request === 'function') {
        console.log(`✅ Found EIP-1193 provider in fcl_extensions.${key}`)
        // This might be Flow Wallet!
        return true
      }
      // Also check if extension has a wallet property
      if (extension && extension.wallet && typeof extension.wallet.request === 'function') {
        console.log(`✅ Found EIP-1193 provider in fcl_extensions.${key}.wallet`)
        return true
      }
    }
  }
  
  // Check window.fcl for wallet access
  const fcl = (window as any).fcl
  if (fcl && typeof fcl === 'object') {
    console.log('🔍 Checking window.fcl for wallet provider...')
    if (fcl.wallet && typeof fcl.wallet.request === 'function') {
      console.log('✅ Found Flow Wallet provider in window.fcl.wallet')
      return true
    }
    if (fcl.currentUser?.wallet && typeof fcl.currentUser.wallet.request === 'function') {
      console.log('✅ Found Flow Wallet provider in window.fcl.currentUser.wallet')
      return true
    }
  }
  
  // Check for Flow Wallet specifically
  if (flowWallet && typeof flowWallet.request === 'function') {
    console.log('✅ Flow Wallet detected via window.flowWallet')
    return true
  }
  
  // Check if ethereum provider is Flow Wallet
  if (ethereum && (ethereum.isFlowWallet || ethereum._isFlowWallet)) {
    console.log('✅ Flow Wallet detected via window.ethereum')
    return true
  }
  
  // Check if Flow Wallet is in ethereum.providers array (multi-wallet scenario)
  if (ethereum?.providers) {
    const flowProvider = ethereum.providers.find((p: any) => 
      p.isFlowWallet || p._isFlowWallet || (p.constructor?.name?.includes('Flow'))
    )
    if (flowProvider) {
      console.log('✅ Flow Wallet detected in ethereum.providers')
      return true
    }
  }
  
  // Check for Flow Wallet extension by looking for specific properties
  // Flow Wallet might inject with different patterns
  const flowIndicators = [
    'flowWallet',
    'FlowWallet',
    'flow',
    'Flow',
    'fcl',
    'FCL'
  ]
  
  for (const indicator of flowIndicators) {
    const provider = (window as any)[indicator]
    if (provider && typeof provider.request === 'function') {
      console.log(`✅ Flow Wallet detected via window.${indicator}`)
      return true
    }
  }
  
  // Check if Flow Wallet is in ethereum.providers (multi-wallet scenario)
  // Sometimes wallets add themselves to ethereum.providers array
  if (ethereum?.providers && Array.isArray(ethereum.providers)) {
    for (let i = 0; i < ethereum.providers.length; i++) {
      const provider = ethereum.providers[i]
      // Check for Flow Wallet indicators in provider
      if (
        provider &&
        (provider.isFlowWallet ||
         provider._isFlowWallet ||
         provider.constructor?.name?.includes('Flow') ||
         provider.constructor?.name?.includes('flow'))
      ) {
        console.log(`✅ Flow Wallet detected in ethereum.providers[${i}]`)
        return true
      }
    }
  }
  
  // Last resort: check if ethereum itself is Flow Wallet (not MetaMask)
  // If ethereum exists but is NOT MetaMask, it might be Flow Wallet
  if (ethereum && !ethereum.isMetaMask && !ethereum._metamask) {
    // Check if it has Flow-specific methods or properties
    const flowMethods = ['fcl', 'flow', 'cadence']
    const hasFlowMethods = flowMethods.some(method => 
      typeof (ethereum as any)[method] !== 'undefined'
    )
    if (hasFlowMethods) {
      console.log('✅ Flow Wallet detected via ethereum (non-MetaMask with Flow methods)')
      return true
    }
  }
  
  console.log('❌ Flow Wallet not detected')
  console.log('💡 Debug: Check browser console for full window object inspection')
  return false
}

// Get Flow Wallet provider
// Flow Wallet for Flow EVM should expose an EIP-1193 compatible provider
// When multiple wallets are present, Flow Wallet is typically in window.ethereum.providers
export function getFlowWalletProvider(): FlowWalletProvider | null {
  if (typeof window === 'undefined') return null
  
  const win = window as any
  const ethereum = win.ethereum
  
  console.log('🔍 getFlowWalletProvider - Starting search...')
  
  // FIRST: Check ethereum.providers array (most common when multiple wallets installed)
  // Flow Wallet injects itself here when MetaMask is also present
  if (ethereum?.providers && Array.isArray(ethereum.providers)) {
    console.log(`🔍 Checking ethereum.providers array (${ethereum.providers.length} providers)...`)
    console.log('🔍 Full providers array:', ethereum.providers.map((p: any, i: number) => ({
      index: i,
      isMetaMask: p?.isMetaMask,
      isFlowWallet: p?.isFlowWallet,
      _isFlowWallet: p?._isFlowWallet,
      _metamask: p?._metamask,
      constructorName: p?.constructor?.name,
      hasRequest: typeof p?.request === 'function',
      keys: p ? Object.keys(p).slice(0, 20) : []
    })))
    
    for (let i = 0; i < ethereum.providers.length; i++) {
      const provider = ethereum.providers[i]
      console.log(`  Provider ${i}:`, {
        isMetaMask: provider?.isMetaMask,
        isFlowWallet: provider?.isFlowWallet,
        _isFlowWallet: provider?._isFlowWallet,
        _metamask: provider?._metamask,
        constructorName: provider?.constructor?.name,
        hasRequest: typeof provider?.request === 'function',
        keys: provider ? Object.keys(provider).slice(0, 20) : []
      })
      
      // Flow Wallet is NOT MetaMask, so skip MetaMask providers
      if (provider && !provider.isMetaMask && !provider._metamask) {
        // If it has request method and is not MetaMask, it might be Flow Wallet
        if (typeof provider.request === 'function') {
          // Check for Flow Wallet indicators
          const isFlowWallet = 
            provider.isFlowWallet ||
            provider._isFlowWallet ||
            provider.constructor?.name?.includes('Flow') ||
            provider.constructor?.name?.includes('flow') ||
            // If fcl_extensions exists and this provider is not MetaMask, it's likely Flow Wallet
            (win.fcl_extensions && !provider.isMetaMask)
          
          console.log(`  Provider ${i} isFlowWallet check:`, {
            isFlowWallet,
            hasFclExtensions: !!win.fcl_extensions,
            isNotMetaMask: !provider.isMetaMask,
            constructorName: provider.constructor?.name
          })
          
          if (isFlowWallet) {
            console.log(`✅ Found Flow Wallet EVM provider in ethereum.providers[${i}]`)
            return provider as FlowWalletProvider
          }
        }
      }
    }
    
    // If we have fcl_extensions and providers array, Flow Wallet might be the non-MetaMask one
    if (win.fcl_extensions) {
      console.log('🔍 fcl_extensions exists, checking for non-MetaMask providers...')
      const nonMetaMaskProviders = ethereum.providers.filter((p: any) => 
        !p.isMetaMask && !p._metamask && typeof p.request === 'function'
      )
      console.log(`🔍 Found ${nonMetaMaskProviders.length} non-MetaMask providers:`, 
        nonMetaMaskProviders.map((p: any) => ({
          constructorName: p.constructor?.name,
          keys: Object.keys(p).slice(0, 10)
        }))
      )
      if (nonMetaMaskProviders.length > 0) {
        console.log(`✅ Found Flow Wallet EVM provider (non-MetaMask provider in array)`)
        return nonMetaMaskProviders[0] as FlowWalletProvider
      }
    }
  } else {
    console.log('🔍 ethereum.providers:', {
      exists: !!ethereum?.providers,
      isArray: Array.isArray(ethereum?.providers),
      type: typeof ethereum?.providers,
      value: ethereum?.providers
    })
  }
  
  // SECOND: Check if ethereum itself is Flow Wallet (when Flow Wallet is only wallet)
  if (ethereum && !ethereum.isMetaMask && !ethereum._metamask) {
    // If fcl_extensions exists and ethereum is not MetaMask, it might be Flow Wallet
    if (win.fcl_extensions && typeof ethereum.request === 'function') {
      console.log('✅ Found Flow Wallet EVM provider as window.ethereum (not MetaMask)')
      return ethereum as FlowWalletProvider
    }
  }
  
  // THIRD: Check fcl_extensions for EVM provider (less common, but possible)
  const fclExtensions = win.fcl_extensions
  if (fclExtensions && typeof fclExtensions === 'object') {
    console.log('🔍 Checking fcl_extensions for Flow Wallet EVM provider...')
    const fclKeys = Object.keys(fclExtensions)
    
    for (const key of fclKeys) {
      const extension = fclExtensions[key]
      console.log(`  Checking extension: ${key}`, {
        type: typeof extension,
        hasRequest: typeof extension?.request === 'function',
        hasWallet: !!extension?.wallet,
        hasEvm: !!extension?.evm,
        keys: typeof extension === 'object' ? Object.keys(extension).slice(0, 15) : []
      })
      
      // Check if extension itself is an EIP-1193 provider
      if (extension && typeof extension.request === 'function') {
        console.log(`✅ Found potential Flow Wallet EVM provider in fcl_extensions.${key}`)
        return extension as FlowWalletProvider
      }
      
      // Check if extension has a wallet property with request method
      if (extension?.wallet && typeof extension.wallet.request === 'function') {
        console.log(`✅ Found Flow Wallet EVM provider in fcl_extensions.${key}.wallet`)
        return extension.wallet as FlowWalletProvider
      }
      
      // Check if extension has an evm property
      if (extension?.evm && typeof extension.evm.request === 'function') {
        console.log(`✅ Found Flow Wallet EVM provider in fcl_extensions.${key}.evm`)
        return extension.evm as FlowWalletProvider
      }
    }
  }
  
  // FOURTH: Check window.fcl for EVM provider access
  const fcl = win.fcl
  if (fcl && typeof fcl === 'object') {
    console.log('🔍 Checking window.fcl for EVM provider...')
    
    // FCL might have an EVM provider property
    if (fcl.evm && typeof fcl.evm.request === 'function') {
      console.log('✅ Found Flow Wallet EVM provider in window.fcl.evm')
      return fcl.evm as FlowWalletProvider
    }
    
    // Or FCL might have a wallet property with EVM access
    if (fcl.wallet) {
      if (typeof fcl.wallet.request === 'function') {
        console.log('✅ Found Flow Wallet EVM provider in window.fcl.wallet')
        return fcl.wallet as FlowWalletProvider
      }
      if (fcl.wallet.evm && typeof fcl.wallet.evm.request === 'function') {
        console.log('✅ Found Flow Wallet EVM provider in window.fcl.wallet.evm')
        return fcl.wallet.evm as FlowWalletProvider
      }
    }
    
    // Check currentUser for wallet access
    if (fcl.currentUser?.wallet) {
      const userWallet = fcl.currentUser.wallet
      if (typeof userWallet.request === 'function') {
        console.log('✅ Found Flow Wallet EVM provider in window.fcl.currentUser.wallet')
        return userWallet as FlowWalletProvider
      }
      if (userWallet.evm && typeof userWallet.evm.request === 'function') {
        console.log('✅ Found Flow Wallet EVM provider in window.fcl.currentUser.wallet.evm')
        return userWallet.evm as FlowWalletProvider
      }
    }
  }
  
  // Try window.flowWallet first
  const flowWallet = win.flowWallet
  if (flowWallet && typeof flowWallet.request === 'function') {
    console.log('✅ Using Flow Wallet provider from window.flowWallet')
    return flowWallet as FlowWalletProvider
  }
  
  // Try window.flow
  const flow = win.flow
  if (flow && typeof flow.request === 'function') {
    console.log('✅ Using Flow Wallet provider from window.flow')
    return flow as FlowWalletProvider
  }
  
  // Try window.ethereum if it's Flow Wallet (not MetaMask)
  if (ethereum && (ethereum.isFlowWallet || ethereum._isFlowWallet)) {
    console.log('✅ Using Flow Wallet provider from window.ethereum (Flow Wallet flag)')
    return ethereum as FlowWalletProvider
  }
  
  // Check ethereum.providers array
  if (ethereum?.providers && Array.isArray(ethereum.providers)) {
    for (let i = 0; i < ethereum.providers.length; i++) {
      const provider = ethereum.providers[i]
      if (
        provider &&
        (provider.isFlowWallet ||
         provider._isFlowWallet ||
         provider.constructor?.name?.includes('Flow') ||
         provider.constructor?.name?.includes('flow'))
      ) {
        console.log(`✅ Using Flow Wallet provider from ethereum.providers[${i}]`)
        return provider as FlowWalletProvider
      }
    }
  }
  
  // If ethereum exists but is NOT MetaMask, it might be Flow Wallet
  if (ethereum && !ethereum.isMetaMask && !ethereum._metamask) {
    // Check if it has Flow-specific methods
    const flowMethods = ['fcl', 'flow', 'cadence']
    const hasFlowMethods = flowMethods.some(method => 
      typeof ethereum[method] !== 'undefined'
    )
    if (hasFlowMethods) {
      console.log('✅ Using Flow Wallet provider from window.ethereum (Flow methods detected)')
      return ethereum as FlowWalletProvider
    }
  }
  
  // Try other possible injection patterns
  const flowIndicators = ['flowWallet', 'FlowWallet', 'flow', 'Flow', 'fcl', 'FCL']
  for (const indicator of flowIndicators) {
    const provider = win[indicator]
    if (provider && typeof provider.request === 'function') {
      console.log(`✅ Using Flow Wallet provider from window.${indicator}`)
      return provider as FlowWalletProvider
    }
  }
  
  console.log('❌ Flow Wallet provider not found')
  return null
}

// Check if MetaMask is available
export function isMetaMaskAvailable(): boolean {
  if (typeof window === 'undefined') return false
  const ethereum = (window as any).ethereum
  return !!(ethereum && (ethereum.isMetaMask || ethereum._metamask))
}
