'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUnifiedWallet } from '../../../lib/hooks/useUnifiedWallet'
import { ShareButton } from '../ui/ShareButton'
import { WalletSelector } from '../ui/WalletSelector'
import { Modal } from '../ui/Modal'

export default function Navigation() {
  const { address, isConnected, walletType } = useUnifiedWallet()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Debug logging - log all state changes
  useEffect(() => {
    console.log('🔍 Navigation - Wallet state changed:', {
      address,
      isConnected,
      walletType,
      showWalletSelector,
      hasCheckedProfile
    })
  }, [address, isConnected, walletType, showWalletSelector, hasCheckedProfile])

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Get user's profile ID when wallet connects and redirect if no profile
  useEffect(() => {
    async function loadProfileId() {
      console.log('🔍 Navigation - loadProfileId called', { isConnected, address, hasCheckedProfile })
      
      if (!isConnected || !address) {
        console.log('🔍 Navigation - Profile check skipped: not connected or no address', { isConnected, address })
        setProfileId(null)
        // Don't reset hasCheckedProfile here - only reset when disconnected
        return
      }

      // Only check once per connection to avoid multiple redirects
      if (hasCheckedProfile) {
        console.log('⏸️ Navigation - Profile already checked for this connection')
        return
      }

      console.log('🔍 Navigation - Starting profile check for address:', address)
      console.log('🔍 Navigation - Current pathname:', pathname)

      try {
        setHasCheckedProfile(true)
        const { profileNFTService } = await import('../../../lib/services/profile/ProfileNFT')
        await profileNFTService.initializeReadOnly()
        
        console.log('🔍 Navigation - Checking if profile exists...')
        const hasProfile = await profileNFTService.hasProfile(address)
        console.log('🔍 Navigation - Profile check result:', hasProfile)
        
        if (hasProfile) {
          console.log('✅ Navigation - Profile exists, loading profile data...')
          const profileData = await profileNFTService.getProfileByAddress(address)
          if (profileData?.profileId) {
            console.log('✅ Navigation - Profile ID found:', profileData.profileId)
            setProfileId(profileData.profileId)
          } else {
            console.log('⚠️ Navigation - Profile exists but no profileId returned')
          }
        } else {
          // No profile found - redirect to create profile page
          // Only redirect if not already on the create profile page to avoid loops
          console.log('🔍 Navigation - No profile found, checking if should redirect...')
          console.log('🔍 Navigation - pathname:', pathname, 'should redirect:', pathname !== '/profile/create')
          
          if (pathname !== '/profile/create') {
            console.log('✅ Navigation - No profile found, redirecting to /profile/create')
            router.push('/profile/create')
          } else {
            console.log('⏸️ Navigation - Already on /profile/create, skipping redirect')
          }
        }
      } catch (error) {
        console.error('❌ Navigation - Failed to load profile ID:', error)
        setHasCheckedProfile(false) // Allow retry on error
        // On error, don't redirect - let user stay on current page
      }
    }

    // Add a small delay to ensure state has propagated
    const timer = setTimeout(() => {
      loadProfileId()
    }, 100)

    return () => clearTimeout(timer)
  }, [isConnected, address, router, pathname, hasCheckedProfile])
  
  // Reset check flag when wallet disconnects or address changes
  useEffect(() => {
    if (!isConnected || !address) {
      setHasCheckedProfile(false)
    }
  }, [isConnected, address])

  const handleConnect = () => {
    console.log('🔍 Navigation - handleConnect called')
    setShowWalletSelector(true)
    setIsMobileMenuOpen(false)
  }

  // Close wallet selector when connected and force UI update
  useEffect(() => {
    if (isConnected && address && showWalletSelector) {
      console.log('✅ Navigation - Wallet connected, closing selector and updating UI', {
        isConnected,
        address,
        walletType
      })
      setShowWalletSelector(false)
      // Force a small delay to ensure state has propagated to all components
      setTimeout(() => {
        // This ensures React re-renders with the new connection state
        console.log('✅ Navigation - Connection state confirmed:', { isConnected, address, walletType })
      }, 50)
    }
  }, [isConnected, address, walletType, showWalletSelector])

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <nav className="immutable-nav">
        <Link href="/" className="nav-logo">
          <h1>ImmutableType</h1>
        </Link>

        <Link 
          href="/reader" 
          className="nav-reader-link"
          aria-label="Reader - View articles and journalism"
        >
          <span className="nav-reader-icon">🗞️</span>
          <span>Reader</span>
        </Link>

        <Link href="/about" className="nav-about-link">
          <span className="nav-about-icon">ℹ️</span>
          <span>About</span>
        </Link>

        <Link href="/roadmap" className="nav-roadmap-link">
          <span className="nav-roadmap-icon">🗺️</span>
          <span>Roadmap</span>
        </Link>

        <Link href="/faq" className="nav-faq-link" aria-label="Frequently Asked Questions">
          <span className="nav-faq-icon">❓</span>
          <span>FAQ</span>
        </Link>

        <ShareButton />

        {isConnected && profileId && (
          <Link href={`/profile/${profileId}`} className="nav-profile-link">
            <span className="nav-profile-icon">👤</span>
            <span>My Profile</span>
          </Link>
        )}

        <div className="nav-wallet">
          {isConnected && address ? (
            <div className="wallet-connected">
              <span className="connection-dot">🟢</span>
              <span className="wallet-address">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          ) : (
            <button onClick={handleConnect} className="btn-connect">
              Connect Wallet
            </button>
          )}
        </div>

        {/* Wallet Selector Modal */}
        <Modal
          isOpen={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          title="Connect Wallet"
        >
          <WalletSelector onClose={() => setShowWalletSelector(false)} />
        </Modal>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h2>Menu</h2>
              <button
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-links">
              <Link 
                href="/reader" 
                className="mobile-menu-link"
                onClick={closeMenu}
              >
                <span className="nav-reader-icon">🗞️</span>
                <span>Reader</span>
              </Link>

              <Link href="/about" className="mobile-menu-link" onClick={closeMenu}>
                <span className="nav-about-icon">ℹ️</span>
                <span>About</span>
              </Link>

              <Link href="/roadmap" className="mobile-menu-link" onClick={closeMenu}>
                <span className="nav-roadmap-icon">🗺️</span>
                <span>Roadmap</span>
              </Link>

              <Link href="/faq" className="mobile-menu-link" onClick={closeMenu}>
                <span className="nav-faq-icon">❓</span>
                <span>FAQ</span>
              </Link>

              <div className="mobile-menu-link" onClick={closeMenu}>
                <ShareButton />
              </div>

              {isConnected && profileId && (
                <Link 
                  href={`/profile/${profileId}`} 
                  className="mobile-menu-link"
                  onClick={closeMenu}
                >
                  <span className="nav-profile-icon">👤</span>
                  <span>My Profile</span>
                </Link>
              )}
            </div>

            <div className="mobile-menu-wallet">
              {isConnected && address ? (
                <div className="wallet-connected-mobile">
                  <span className="connection-dot">🟢</span>
                  <span className="wallet-address">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
              ) : (
                <button onClick={handleConnect} className="btn-connect-mobile">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}