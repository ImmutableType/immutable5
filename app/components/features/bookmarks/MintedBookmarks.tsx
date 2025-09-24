'use client';

import { useState, useEffect } from 'react';
import { MintedBookmark, MintedBookmarkService } from '../../../../lib/services/blockchain/MintedBookmarkService';

interface MintedBookmarksProps {
  userAddress?: string;
  profileId?: string;
}

export function MintedBookmarks({ userAddress, profileId }: MintedBookmarksProps) {
  const [mintedBookmarks, setMintedBookmarks] = useState<MintedBookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBookmarksCount, setTotalBookmarksCount] = useState(0);

  const mintedBookmarkService = new MintedBookmarkService();

  useEffect(() => {
    if (userAddress) {
      loadMintedBookmarks();
      loadTotalCount();
    }
  }, [userAddress]);

  const loadMintedBookmarks = async () => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);

    try {
      await mintedBookmarkService.initialize();
      const bookmarks = await mintedBookmarkService.getUserMintedBookmarks(userAddress);
      setMintedBookmarks(bookmarks);
    } catch (error: any) {
      console.error('Error loading minted bookmarks:', error);
      setError(error.message || 'Failed to load minted bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const loadTotalCount = async () => {
    try {
      await mintedBookmarkService.initialize();
      const count = await mintedBookmarkService.getTotalBookmarksCount();
      setTotalBookmarksCount(count);
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  };

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
    const explorerUrl = `https://evm.flowscan.io/token/0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5/${tokenId}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

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

  return (
    <div className="minted-bookmarks-container">
      <div className="minted-bookmarks-header">
        <div className="header-info">
          <h2>Minted Bookmark NFTs</h2>
          <div className="stats">
            <span className="user-count">Your NFTs: {mintedBookmarks.length}</span>
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
          <div className="empty-icon">📑</div>
          <h3>No Minted Bookmarks Yet</h3>
          <p>Once you mint bookmark collections, your NFTs will appear here.</p>
          <p className="hint">Go to "Bookmark URLs" tab to create and mint collections.</p>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {mintedBookmarks.map((bookmark) => (
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

        .hint {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 16px;
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
      `}</style>
    </div>
  );
}