'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDirectWallet } from '../../../lib/hooks/useDirectWallet'

export default function Navigation() {
  const { address, isConnected, connectWallet } = useDirectWallet()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Get user's profile ID when wallet connects
  useEffect(() => {
    async function loadProfileId() {
      if (!isConnected || !address) {
        setProfileId(null)
        return
      }

      try {
        const { profileNFTService } = await import('../../../lib/services/profile/ProfileNFT')
        await profileNFTService.initializeReadOnly()
        
        const hasProfile = await profileNFTService.hasProfile(address)
        
        if (hasProfile) {
          const profileData = await profileNFTService.getProfileByAddress(address)
          if (profileData?.profileId) {
            setProfileId(profileData.profileId)
          }
        }
      } catch (error) {
        console.error('Failed to load profile ID:', error)
      }
    }

    loadProfileId()
  }, [isConnected, address])

  const handleConnect = async () => {
    try {
      await connectWallet()
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

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