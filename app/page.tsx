'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [showProfileApp, setShowProfileApp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set current year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }, []);

  const loadProfileApp = () => {
    router.push('/profile/create');
  };

  return (
    <div className="bg-red-500 text-white p-8">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-40">
        <div>
          <h1 className="text-lg font-bold">
            ImmutableType <span className="text-xs bg-red-500 px-2 py-1 rounded">BETA</span>
          </h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="text-white" 
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <nav className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">
                ImmutableType <span className="text-xs bg-red-500 px-2 py-1 rounded">BETA</span>
              </h1>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white" 
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                <a href="#welcome" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Welcome</div>
                  <div className="text-sm text-gray-400">Getting started</div>
                </a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">About Us</div>
                  <div className="text-sm text-gray-400">Our mission</div>
                </a>
                <a href="#create-profile" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Create Profile</div>
                  <div className="text-sm text-gray-400">Journalist identity</div>
                </a>
                <a href="#chrome-extension" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Chrome Extension</div>
                  <div className="text-sm text-gray-400">Research tools</div>
                </a>
                <a href="#nft-collection" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">MoonBuffaFLOW</div>
                  <div className="text-sm text-gray-400">NFT Collection</div>
                </a>
                <a href="#buy-buffaflow" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Buy $BUFFAFLOW</div>
                  <div className="text-sm text-gray-400">Governance tokens</div>
                </a>
                <a href="https://immutabletype.com/collections/all" target="_blank" className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Shop Gear</div>
                  <div className="text-sm text-gray-400">Merchandise & apparel</div>
                </a>
                <a href="#social" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">Follow Us</div>
                  <div className="text-sm text-gray-400">Join community</div>
                </a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block p-4 text-white hover:bg-gray-800 rounded-lg">
                  <div className="font-semibold">FAQ</div>
                  <div className="text-sm text-gray-400">Get answers</div>
                </a>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Layout */}
      <div className="flex h-screen lg:h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 bg-gray-900 text-white flex-col">
          <div className="fixed-logo p-10">
            <h1 className="text-xl font-bold">
              ImmutableType <span className="text-xs bg-red-500 px-2 py-1 rounded">BETA</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Decentralized Journalism</p>
          </div>
          
          <nav className="scrollable-nav p-4 pt-8">
            <div className="space-y-2">
              <a href="#welcome" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors bg-gray-800 border-l-4 border-purple-500">
                <div className="font-semibold">Welcome</div>
                <div className="text-xs text-gray-400 mt-1">Getting started</div>
              </a>
              
              <a href="#about" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">About Us</div>
                <div className="text-xs text-gray-400 mt-1">Our mission</div>
              </a>
              
              <a href="#create-profile" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">Create Profile</div>
                <div className="text-xs text-gray-400 mt-1">Journalist identity</div>
              </a>
              
              <a href="#chrome-extension" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">Chrome Extension</div>
                <div className="text-xs text-gray-400 mt-1">Research tools</div>
              </a>
              
              <a href="#nft-collection" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">MoonBuffaFLOW</div>
                <div className="text-xs text-gray-400 mt-1">NFT Collection</div>
              </a>
              
              <a href="#buy-buffaflow" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">Buy $BUFFAFLOW</div>
                <div className="text-xs text-gray-400 mt-1">Governance tokens</div>
              </a>
              
              <a href="https://immutabletype.com/collections/all" target="_blank" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">Shop Gear</div>
                <div className="text-xs text-gray-400 mt-1">Merchandise & apparel</div>
              </a>
              
              <a href="#social" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">Follow Us</div>
                <div className="text-xs text-gray-400 mt-1">Join community</div>
              </a>
              
              <a href="#faq" className="block w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="font-semibold">FAQ</div>
                <div className="text-xs text-gray-400 mt-1">Get answers</div>
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto pt-16 lg:pt-0">
          {/* Welcome Section */}
          <section id="welcome" className="p-6 lg:p-12 min-h-screen flex items-center">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm font-semibold">
                  Beta Notice: This platform is in beta testing. Use at your own risk. Features may change without notice.
                </p>
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Welcome to ImmutableType</h2>
              <p className="text-lg lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                The future of journalism is decentralized, transparent, and immutable.
              </p>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                ImmutableType is building the infrastructure for independent journalism - 
                where truth can't be censored, sources are protected, and readers can trust 
                what they're reading through blockchain verification.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">For Journalists</h3>
                  <p className="text-sm text-gray-600 mb-4">Create verified profiles, publish immutable articles, build reader trust</p>
                  <a 
                    href="https://t.me/immutabletypewaitlist" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="telegram-btn text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Join Waitlist
                  </a>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">For Readers</h3>
                  <p className="text-sm text-gray-600 mb-4">Verify sources, support independent media, access uncensored content</p>
                  <button 
                    onClick={loadProfileApp}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Launch Application
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* About Us Section */}
          <section id="about" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">About ImmutableType</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-6">
                ImmutableType addresses the fundamental challenges facing modern journalism:
                advertiser influence, platform censorship, and reader trust erosion.
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Immutable Publishing</h3>
                  <p className="text-gray-600">Articles published on-chain cannot be deleted or modified, preserving journalistic integrity</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Verified Identities</h3>
                  <p className="text-gray-600">Progressive verification system ensures readers know who they're reading</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Decentralized Governance</h3>
                  <p className="text-gray-600">Community-driven platform decisions through BUFFAFLOW token governance</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Independent Funding</h3>
                  <p className="text-gray-600">Direct reader support without advertiser dependency</p>
                </div>
              </div>
              
              <p className="text-gray-600">
                Read more about our mission on our <a href="https://immutabletype.substack.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">Substack</a> or <a href="https://immutabletype.com/blogs/news" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">blog</a>.
              </p>
            </div>
          </section>

          {/* Create Profile Section */}
          <section id="create-profile" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Create Your Profile</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                Build your verified identity on ImmutableType through our progressive tier system.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900">Tier 0: Basic</div>
                  <div className="text-sm text-gray-600 mt-1">Wallet connection</div>
                  <div className="text-xs text-purple-600 mt-1">3 FLOW fee</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900">Tier 1: Social</div>
                  <div className="text-sm text-gray-600 mt-1">Farcaster verification</div>
                  <div className="text-xs text-gray-600 mt-1">Social credibility</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900">Tier 2: Identity</div>
                  <div className="text-sm text-gray-600 mt-1">KYC verification</div>
                  <div className="text-xs text-gray-600 mt-1">Professional trust</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900">Tier 3: Anonymous</div>
                  <div className="text-sm text-gray-600 mt-1">Zero-knowledge proofs</div>
                  <div className="text-xs text-gray-600 mt-1">Protected sources</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">Ready to create your profile?</div>
                <div className="text-gray-600 mb-4">Start with Tier 0 for 3 FLOW tokens (free with BUFFAFLOW holdings)</div>
                <button 
                  onClick={loadProfileApp}
                  className="bg-purple-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Launch Application
                </button>
              </div>
            </div>
          </section>

          {/* Chrome Extension Section */}
          <section id="chrome-extension" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Chrome Extension</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                Enhance your research workflow with our Chrome extension. 
                Automatically capture and organize bookmarks, sources, and research 
                directly to your ImmutableType profile.
              </p>
              
              <div className="bg-gray-100 h-48 lg:h-64 rounded-lg mb-8 flex items-center justify-center">
                <span className="text-gray-500">Extension Interface Preview</span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">Download Extension</div>
                <div className="text-gray-600 mb-4">Available now in the Chrome Web Store</div>
                <a 
                  href="https://chromewebstore.google.com/detail/eplgoiihhgmihacfngflijkokfbhfceo" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
                >
                  Add to Chrome
                </a>
              </div>
            </div>
          </section>

          {/* NFT Collection Section */}
          <section id="nft-collection" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">MoonBuffaFLOW Collection</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                The MoonBuffaFLOW NFT collection represents our community of early supporters 
                and contributors to the decentralized journalism movement.
              </p>
              
              <div className="bg-gray-100 h-48 lg:h-64 rounded-lg mb-8 flex items-center justify-center">
                <span className="text-gray-500">NFT Collection Gallery</span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">Collector Benefits</div>
                <ul className="text-gray-600 mb-4 space-y-1">
                  <li>• Display NFTs on your ImmutableType profile</li>
                  <li>• Exclusive community access</li>
                  <li>• Early feature previews</li>
                  <li>• Governance participation rights</li>
                </ul>
                <a 
                  href="https://opensea.io/collection/moonbuffaflow" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  View Collection
                </a>
              </div>
            </div>
          </section>

          {/* Buy BUFFAFLOW Section */}
          <section id="buy-buffaflow" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">$BUFFAFLOW Governance Token</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                BUFFAFLOW tokens provide governance rights in the ImmutableType ecosystem 
                and unlock premium platform features.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Token Benefits</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free profile creation</li>
                    <li>• Governance voting rights</li>
                    <li>• Premium features access</li>
                    <li>• Community recognition</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">How to Use</h3>
                  <p className="text-sm text-gray-600">
                    Hold BUFFAFLOW tokens in your wallet to automatically 
                    bypass profile creation fees and access governance features.
                  </p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">Purchase BUFFAFLOW</div>
                <div className="text-gray-600 mb-4">Available on decentralized exchanges</div>
                <a 
                  href="https://flowfun.xyz/collection/6893c3f9fc44a8bb9e159eb4/token" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-yellow-500 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors inline-block"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </section>

          {/* Social Section */}
          <section id="social" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Join Our Community</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                Follow our progress and join the conversation about the future of decentralized journalism.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">X (Twitter)</h3>
                    <p className="text-sm text-gray-600">Latest updates and news</p>
                  </div>
                  <a 
                    href="https://x.com/Immutable_type" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
                  >
                    Follow
                  </a>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Newsletter</h3>
                    <p className="text-sm text-gray-600">In-depth articles and commentary</p>
                  </div>
                  <a 
                    href="https://immutabletype.substack.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-center"
                  >
                    Subscribe
                  </a>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Blog</h3>
                    <p className="text-sm text-gray-600">Platform updates and insights</p>
                  </div>
                  <a 
                    href="https://immutabletype.com/blogs/news" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                  >
                    Read
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="p-6 lg:p-12 min-h-screen border-t border-gray-200">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What is ImmutableType?</h3>
                  <p className="text-gray-600">ImmutableType is a decentralized journalism platform that uses blockchain technology to ensure article immutability, journalist verification, and reader trust.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How much does it cost to create a profile?</h3>
                  <p className="text-gray-600">Creating a basic profile costs 3 FLOW tokens. However, BUFFAFLOW token holders can create profiles for free.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What are the verification tiers?</h3>
                  <p className="text-gray-600">We offer 4 tiers: Basic (wallet), Social (Farcaster), Identity (KYC), and Anonymous (zK proofs). Each provides different levels of credibility and features.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How does decentralized journalism work?</h3>
                  <p className="text-gray-600">Articles are published on-chain, making them immutable and uncensorable. Journalists have verified identities, and readers can trust the authenticity of content.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What is BUFFAFLOW?</h3>
                  <p className="text-gray-600">BUFFAFLOW is our governance token that provides voting rights, free profile creation, and access to premium platform features.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Is this platform safe to use?</h3>
                  <p className="text-gray-600">ImmutableType is currently in beta testing. While we've implemented security best practices, please use the platform at your own risk and only with funds you can afford to lose.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="font-bold mb-4">ImmutableType <span className="text-xs bg-red-500 px-2 py-1 rounded ml-2">BETA</span></h4>
                  <p className="text-sm text-gray-400">Building the future of decentralized journalism</p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Platform</h4>
                  <div className="space-y-2 text-sm">
                    <a href="#create-profile" className="block text-gray-400 hover:text-white">Create Profile</a>
                    <a href="#chrome-extension" className="block text-gray-400 hover:text-white">Chrome Extension</a>
                    <a href="#buy-buffaflow" className="block text-gray-400 hover:text-white">Buy BUFFAFLOW</a>
                    <a href="#nft-collection" className="block text-gray-400 hover:text-white">NFT Collection</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Community</h4>
                  <div className="space-y-2 text-sm">
                    <a href="https://immutabletype.com/blogs/news" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">Blog</a>
                    <a href="https://immutabletype.substack.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">Substack</a>
                    <a href="https://x.com/Immutable_type" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">Twitter</a>
                    <a href="https://immutabletype.com/collections/all" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">Shop</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Legal</h4>
                  <div className="space-y-2 text-sm">
                    <a href="#" className="block text-gray-400 hover:text-white">Terms of Use</a>
                    <a href="#" className="block text-gray-400 hover:text-white">Privacy Policy</a>
                    <a href="#faq" className="block text-gray-400 hover:text-white">FAQ</a>
                    <a href="#" className="block text-gray-400 hover:text-white">Contact</a>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="text-sm text-gray-400">
                    © <span id="current-year"></span> Stadium Gates Collective. All rights reserved.
                  </div>
                  <div className="text-sm text-gray-400">
                    Beta Platform - Use at your own risk
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}