'use client';

import { useState, useEffect } from 'react';
import { GlobalBookmarkFeedService } from '../../../../lib/services/bookmark/GlobalBookmarkFeedService';
import { MintedBookmark } from '../../../../lib/services/blockchain/MintedBookmarkService';

export function GlobalBookmarkFeed() {
  const [bookmarks, setBookmarks] = useState<MintedBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalSupply, setTotalSupply] = useState(0);

  const feedService = new GlobalBookmarkFeedService();

  useEffect(() => {
    loadInitialBookmarks();
  }, []);

  const loadInitialBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      await feedService.initialize();
      const recentBookmarks = await feedService.getRecentGlobalBookmarks(5);
      
      setBookmarks(recentBookmarks);
      setTotalSupply(recentBookmarks.length > 0 ? parseInt(recentBookmarks[0].tokenId) : 0);
      setHasMore(recentBookmarks.length === 5);
    } catch (err: any) {
      console.error('Error loading initial bookmarks:', err);
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      
      const moreBookmarks = await feedService.loadMoreBookmarks(bookmarks.length, 5);
      
      if (moreBookmarks.length === 0) {
        setHasMore(false);
      } else {
        setBookmarks([...bookmarks, ...moreBookmarks]);
        setHasMore(moreBookmarks.length === 5);
      }
    } catch (err: any) {
      console.error('Error loading more bookmarks:', err);
      setError(err.message || 'Failed to load more bookmarks');
    } finally {
      setLoadingMore(false);
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

  if (loading) {
    return (
      <div className="global-feed-container">
        <div className="loading-state">Loading global bookmark feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-feed-container">
        <div className="error-state">
          <h3>Error Loading Feed</h3>
          <p>{error}</p>
          <button onClick={loadInitialBookmarks} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="global-feed-container">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Bookmarks Yet</h3>
          <p>Be the first to mint a bookmark NFT!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-feed-container">
      <div className="feed-header">
        <h2>Global Bookmark Feed</h2>
        <p className="feed-subtitle">Most recent bookmarks from all users</p>
      </div>

      <div className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.tokenId} className="bookmark-feed-card">
            <div className="bookmark-header">
              <div className="token-info">
                <span className="token-id">#{bookmark.tokenId}</span>
              </div>
              <div className="bookmark-date">
                {formatDate(bookmark.mintedAt)}
              </div>
            </div>

            <div className="bookmark-body">
              <h3 className="bookmark-title">{bookmark.title}</h3>
              
              {bookmark.description && (
                <p className="bookmark-description">"{bookmark.description}"</p>
              )}

              <button 
                onClick={() => openUrl(bookmark.url)}
                className="url-button"
              >
                🌐 Visit Link
              </button>
            </div>

            <div className="bookmark-footer">
              <div className="creator-info">
                <span className="creator-label">Minted by:</span>
                <span className="creator-address">
                  {truncateAddress(bookmark.creator)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button 
            onClick={loadMore} 
            disabled={loadingMore}
            className="load-more-button"
          >
            {loadingMore ? 'Loading...' : 'Load 5 More'}
          </button>
        </div>
      )}

      <style jsx>{`
        .global-feed-container {
          max-width: 100%;
        }

        .feed-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .feed-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .feed-subtitle {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-secondary);
        }

        .error-state h3 {
          color: var(--color-red-600);
          margin-bottom: 0.75rem;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background: var(--color-red-600);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .bookmarks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bookmark-feed-card {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.25rem;
          background: white;
          transition: box-shadow 0.2s ease;
        }

        .bookmark-feed-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .bookmark-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .token-id {
          font-weight: 600;
          color: var(--color-emerald-600);
          font-size: var(--text-sm);
        }

        .bookmark-date {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }

        .bookmark-title {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: var(--color-text-primary);
        }

        .bookmark-description {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          font-style: italic;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .url-button {
          background: var(--color-primary-600);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: var(--text-sm);
          transition: background 0.2s ease;
        }

        .url-button:hover {
          background: var(--color-primary-700);
        }

        .bookmark-footer {
          border-top: 1px solid var(--color-border);
          padding-top: 0.75rem;
          margin-top: 1rem;
        }

        .creator-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-xs);
        }

        .creator-label {
          color: var(--color-text-tertiary);
        }

        .creator-address {
          color: var(--color-text-secondary);
          font-family: var(--font-mono);
        }

        .load-more-container {
          text-align: center;
          margin-top: 1.5rem;
        }

        .load-more-button {
          background: var(--color-slate-100);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: var(--text-base);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .load-more-button:hover:not(:disabled) {
          background: var(--color-slate-200);
        }

        .load-more-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}