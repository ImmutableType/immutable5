'use client'

// Debug helper to manually inspect Flow Wallet injection
// Run this in browser console: window.inspectFlowWallet()

export function FlowWalletDebugger() {
  if (typeof window !== 'undefined') {
    setupFlowWalletDebugger()
  }
  return null
}

function setupFlowWalletDebugger() {
  if (typeof window === 'undefined') return
  
  (window as any).inspectFlowWallet = function() {
    const win = window as any
    console.log('=== FLOW WALLET INSPECTION ===')
    
    // Check fcl_extensions
    if (win.fcl_extensions) {
      console.log('✅ fcl_extensions found:', Object.keys(win.fcl_extensions))
      Object.keys(win.fcl_extensions).forEach(key => {
        const ext = win.fcl_extensions[key]
        console.log(`  - ${key}:`, {
          type: typeof ext,
          hasRequest: typeof ext?.request === 'function',
          hasWallet: !!ext?.wallet,
          keys: typeof ext === 'object' ? Object.keys(ext).slice(0, 15) : []
        })
        if (ext?.wallet) {
          console.log(`    wallet:`, {
            hasRequest: typeof ext.wallet.request === 'function',
            keys: Object.keys(ext.wallet).slice(0, 10)
          })
        }
      })
    }
    
    // Check window.fcl
    if (win.fcl) {
      console.log('✅ fcl found:', {
        type: typeof win.fcl,
        hasWallet: !!win.fcl.wallet,
        hasCurrentUser: !!win.fcl.currentUser,
        keys: Object.keys(win.fcl).slice(0, 15)
      })
      if (win.fcl.wallet) {
        console.log('  fcl.wallet:', {
          hasRequest: typeof win.fcl.wallet.request === 'function',
          keys: Object.keys(win.fcl.wallet).slice(0, 10)
        })
      }
      if (win.fcl.currentUser) {
        console.log('  fcl.currentUser:', {
          hasWallet: !!win.fcl.currentUser.wallet,
          keys: Object.keys(win.fcl.currentUser).slice(0, 10)
        })
        if (win.fcl.currentUser.wallet) {
          console.log('    wallet:', {
            hasRequest: typeof win.fcl.currentUser.wallet.request === 'function',
            keys: Object.keys(win.fcl.currentUser.wallet).slice(0, 10)
          })
        }
      }
    }
    
    // Check ethereum.providers
    if (win.ethereum?.providers) {
      console.log('✅ ethereum.providers found:', win.ethereum.providers.length)
      win.ethereum.providers.forEach((p: any, i: number) => {
        console.log(`  Provider ${i}:`, {
          isMetaMask: p.isMetaMask,
          isFlowWallet: p.isFlowWallet,
          _isFlowWallet: p._isFlowWallet,
          constructorName: p.constructor?.name,
          hasRequest: typeof p.request === 'function',
          keys: Object.keys(p).slice(0, 10)
        })
      })
    }
    
    // Check all Flow-related window properties
    const flowKeys = Object.keys(win).filter(k => 
      k.toLowerCase().includes('flow') || 
      k.toLowerCase().includes('fcl')
    )
    console.log('Flow-related window keys:', flowKeys)
    
    console.log('=== END INSPECTION ===')
  }
  
  console.log('💡 Run window.inspectFlowWallet() in console to inspect Flow Wallet')
}
