'use client';

import { useState, useEffect } from 'react';
import { MintedBookmark, MintedBookmarkService } from '../../../../lib/services/blockchain/MintedBookmarkService';
import { useUnifiedWallet } from '../../../../lib/hooks/useUnifiedWallet';

interface MintedBookmarksProps {
  userAddress?: string;
  profileId?: string;
  profileOwnerAddress?: string; // NEW: The actual profile owner
}

export function MintedBookmarks({ userAddress, profileId, profileOwnerAddress }: MintedBookmarksProps) {
  const [mintedBookmarks, setMintedBookmarks] = useState<MintedBookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBookmarksCount, setTotalBookmarksCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(5); // NEW: Pagination
  const [hasMore, setHasMore] = useState(false); // NEW: Track if more bookmarks exist

  // Use unified wallet hook for wallet connection state
  const { isConnected } = useUnifiedWallet();
  const mintedBookmarkService = new MintedBookmarkService();

  useEffect(() => {
    // Load bookmarks for profile owner, regardless of connected wallet
    if (profileOwnerAddress) {
      loadMintedBookmarks();
      loadTotalCount();
    }
  }, [profileOwnerAddress]);

  const loadMintedBookmarks = async () => {
    if (!profileOwnerAddress) return;
  
    setLoading(true);
    setError(null);
  
    try {
      await mintedBookmarkService.initializeReadOnly();
      const bookmarks = await mintedBookmarkService.getUserMintedBookmarks(profileOwnerAddress);
      setMintedBookmarks(bookmarks);
      setHasMore(bookmarks.length > displayCount);
    } catch (error: any) {
      console.error('Error loading minted bookmarks:', error);
      setError(error.message || 'Failed to load minted bookmarks');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTotalCount = async () => {
    try {
      await mintedBookmarkService.initializeReadOnly();
      const count = await mintedBookmarkService.getTotalBookmarksCount();
      setTotalBookmarksCount(count);
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => {
      const newCount = prev + 5;
      setHasMore(mintedBookmarks.length > newCount);
      return newCount;
    });
  };

  // Wallet connection is now handled globally via Navigation component
  // No need for local connection handler

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const viewOnExplorer = (tokenId: string) => {
    const explorerUrl = `https://evm.flowscan.io/token/0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5/instance/${tokenId}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  const openExtensionStore = () => {
    window.open('https://chromewebstore.google.com/search/ImmutableType%20Stacks', '_blank', 'noopener,noreferrer');
  };

  // Show wallet connection prompt if no wallet connected
  if (!userAddress) {
    return (
      <div className="minted-bookmarks-container">
        <div className="connection-prompt">
          <div className="connect-icon">🔗</div>
          <h3>Connect Wallet to View Bookmarks</h3>
          <p>This user has bookmark NFT collections. Connect your wallet to view their curated bookmarks.</p>
          <div className="browse-note" style={{ marginBottom: '1rem' }}>
            <strong>Connect your wallet</strong> using the "Connect Wallet" button in the navigation bar to view your bookmarks.
          </div>
          <div className="browse-note">
            Or continue browsing publicly:
            <br />• View profile information
            <br />• See verification status
            <br />• Check creation date
          </div>
        </div>

        <style jsx>{`
          .minted-bookmarks-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .connection-prompt {
            text-align: center;
            padding: 60px 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            margin: 20px;
          }

          .connect-icon {
            font-size: 64px;
            margin-bottom: 24px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          }

          .connection-prompt h3 {
            margin: 0 0 16px 0;
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }

          .connection-prompt p {
            color: #64748b;
            margin-bottom: 32px;
            line-height: 1.6;
            font-size: 18px;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
          }

          .connect-button {
            background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 32px;
            box-shadow: 0 8px 16px rgba(0, 102, 204, 0.3);
            transition: all 0.2s ease;
            transform: translateY(0);
          }

          .connect-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #0052a3 0%, #003d7a 100%);
            box-shadow: 0 12px 24px rgba(0, 102, 204, 0.4);
            transform: translateY(-2px);
          }

          .connect-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .browse-note {
            font-size: 16px;
            color: #64748b;
            background: white;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            max-width: 360px;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            text-align: left;
          }
        `}</style>
      </div>
    );
  }

  if (loading && mintedBookmarks.length === 0) {
    return (
      <div className="minted-bookmarks-container">
        <div className="loading-state">
          Loading minted bookmarks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="minted-bookmarks-container">
        <div className="error-state">
          <h3>Error Loading Bookmarks</h3>
          <p>{error}</p>
          <button onClick={loadMintedBookmarks} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayedBookmarks = mintedBookmarks.slice(0, displayCount);

  return (
    <div className="minted-bookmarks-container">
      <div className="minted-bookmarks-header">
        <div className="header-info">
          <h2>Minted Bookmark NFTs</h2>
          <div className="stats">
            <span className="user-count">Profile NFTs: {mintedBookmarks.length}</span>
            <span className="total-count">Total Platform NFTs: {totalBookmarksCount}</span>
          </div>
        </div>
        {mintedBookmarks.length > 0 && (
          <button onClick={loadMintedBookmarks} className="refresh-button" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {mintedBookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Minted Bookmarks Yet</h3>
          <p>This user hasn't minted any bookmark collections as NFTs yet.</p>
        </div>
      ) : (
        <>
          <div className="bookmarks-grid">
            {displayedBookmarks.map((bookmark) => (
              <div key={bookmark.tokenId} className="bookmark-nft-card">
                <div className="nft-header">
                  <div className="token-info">
                    <span className="token-id">#{bookmark.tokenId}</span>
                    <button 
                      onClick={() => viewOnExplorer(bookmark.tokenId)}
                      className="explorer-link"
                      title="View on Flow Explorer"
                    >
                      🔗
                    </button>
                  </div>
                  <div className="mint-date">
                    {formatDate(bookmark.mintedAt)}
                  </div>
                </div>

                <div className="bookmark-content">
                  <h3 className="bookmark-title">{bookmark.title}</h3>
                  
                  {bookmark.description && (
                    <p className="bookmark-description">"{bookmark.description}"</p>
                  )}

                  <div className="bookmark-url-section">
                    <button 
                      onClick={() => openUrl(bookmark.url)}
                      className="url-button"
                      title="Visit URL"
                    >
                      🌐 Visit Link
                    </button>
                    <div className="url-display">
                      {bookmark.url}
                    </div>
                  </div>
                </div>

                <div className="nft-footer">
                  <div className="creator-info">
                    <span className="creator-label">Minted by:</span>
                    <span className="creator-address">
                      {bookmark.creator === userAddress ? 'You' : truncateAddress(bookmark.creator)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="load-more-container">
              <button onClick={loadMore} className="load-more-button">
                Load More Bookmarks ({mintedBookmarks.length - displayCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Extension Promotion Section - Only shows for connected users */}
      {userAddress && (
        <div className="extension-promotion">
          <div className="extension-content">
            <h3>Browser Extension Available</h3>
            <p>
              Install the ImmutableType Stacks extension to easily save and export your bookmarks. 
              Capture URLs as you browse, organize them into collections, and seamlessly import them 
              into your ImmutableType profile for minting as NFTs.
            </p>
            <button onClick={openExtensionStore} className="extension-button">
              Download Chrome Extension
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .minted-bookmarks-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .minted-bookmarks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-info h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .user-count, .total-count {
          font-size: 14px;
          color: #6b7280;
        }

        .user-count {
          font-weight: 500;
          color: #059669;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 60px 20px;
        }

        .error-state h3 {
          color: #dc2626;
          margin-bottom: 12px;
        }

        .retry-button {
          padding: 10px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 12px 0;
          color: #374151;
        }

        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .bookmark-nft-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .nft-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .token-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .token-id {
          font-weight: 600;
          color: #059669;
          font-size: 14px;
        }

        .explorer-link {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.7;
        }

        .explorer-link:hover {
          opacity: 1;
        }

        .mint-date {
          font-size: 12px;
          color: #6b7280;
        }

        .bookmark-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #111827;
        }

        .bookmark-description {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .bookmark-url-section {
          margin-bottom: 16px;
        }

        .url-button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .url-button:hover {
          background: #0052a3;
        }

        .url-display {
          font-size: 12px;
          color: #6b7280;
          font-family: 'SF Mono', 'Monaco', monospace;
          word-break: break-all;
          background: #f9fafb;
          padding: 8px;
          border-radius: 4px;
        }

        .nft-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }

        .creator-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .creator-label {
          color: #6b7280;
        }

        .creator-address {
          color: #374151;
          font-family: 'SF Mono', 'Monaco', monospace;
        }

        .load-more-container {
          text-align: center;
          margin-top: 32px;
        }

        .load-more-button {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .load-more-button:hover {
          background: #e5e7eb;
        }

        .extension-promotion {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }

        .extension-content {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
        }

        .extension-content h3 {
          margin: 0 0 16px 0;
          color: #0c4a6e;
          font-size: 22px;
          font-weight: 600;
        }

        .extension-content p {
          color: #075985;
          line-height: 1.6;
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto 24px;
        }

        .extension-button {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          transition: all 0.2s ease;
        }

        .extension-button:hover {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}