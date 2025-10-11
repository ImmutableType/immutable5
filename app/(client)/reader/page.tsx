// app/(client)/reader/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatDistanceToNow } from 'date-fns';

// Import the existing type or define a compatible one for the reader
interface ReaderBookmark {
  tokenId: string;
  title: string;
  url: string;
  description: string;
  creatorAddress: string;
  timestamp: string;
}

// Simple Card component (since it might not exist in your project)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card ${className}`}>
    {children}
    <style jsx>{`
      .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        overflow: hidden;
      }
    `}</style>
  </div>
);

// Simple LoadingSpinner component
const LoadingSpinner = () => (
  <div className="spinner">
    <style jsx>{`
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const BOOKMARK_NFT_ADDRESS = process.env.NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS || '0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5';
const FLOW_EVM_RPC = process.env.NEXT_PUBLIC_FLOW_EVM_RPC_URL || 'https://mainnet.evm.nodes.onflow.org';

// Bookmark NFT ABI (minimal for reading)
const BOOKMARK_NFT_ABI = [
  'function totalSupply() view returns (uint256)',
  'function getBookmark(uint256 tokenId) view returns (tuple(string title, string url, string description, address creator, uint256 createdAt))',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'event BookmarkMinted(uint256 indexed tokenId, address indexed creator, string title, string url)'
];

export default function ReaderPage() {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [listening, setListening] = useState(false);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [displayCount, setDisplayCount] = useState(20);

  // Initialize read-only provider and contract
  const getContract = () => {
    const provider = new ethers.JsonRpcProvider(FLOW_EVM_RPC);
    return new ethers.Contract(BOOKMARK_NFT_ADDRESS, BOOKMARK_NFT_ABI, provider);
  };

  // Fetch bookmarks from the contract
const fetchBookmarks = async () => {
    try {
      const contract = getContract();
      const totalSupply = await contract.totalSupply();
      const total = Number(totalSupply);
      setTotalBookmarks(total);
  
      const bookmarkPromises: Promise<ReaderBookmark | null>[] = [];
      
      // Calculate how many to fetch
      const fetchCount = Math.min(displayCount, total);
      
      // Fetch from the end backwards (most recent first)
      // Note: token IDs might be 1-indexed, not 0-indexed
      for (let i = total; i > total - fetchCount && i > 0; i--) {
        bookmarkPromises.push(
          contract.getBookmark(i)
            .then((data: any) => ({
              tokenId: i.toString(),
              title: data.title,
              url: data.url,
              description: data.description,
              creatorAddress: data.creator,
              timestamp: new Date(Number(data.createdAt) * 1000).toISOString()
            }))
            .catch((err) => {
              console.log(`Failed to fetch bookmark ${i}:`, err);
              return null;
            })
        );
      }
  
      const results = await Promise.all(bookmarkPromises);
      const validBookmarks = results.filter((b: ReaderBookmark | null): b is ReaderBookmark => b !== null);
      
      setBookmarks(validBookmarks);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to fetch bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Set up event listener for new bookmarks
  const setupEventListener = async () => {
    try {
      const contract = getContract();
      
      // Listen for BookmarkMinted events
      contract.on('BookmarkMinted', async (tokenId, creator, title, url, event) => {
        console.log('New bookmark minted:', { tokenId: tokenId.toString(), creator, title, url });
        
        // Fetch the full bookmark details
        try {
          const bookmarkData = await contract.getBookmark(tokenId);
          const newBookmark: ReaderBookmark = {
            tokenId: tokenId.toString(),
            title: bookmarkData.title,
            url: bookmarkData.url,
            description: bookmarkData.description,
            creatorAddress: bookmarkData.creator,
            timestamp: new Date(Number(bookmarkData.createdAt) * 1000).toISOString()
          };
          
          // Add to the beginning of the list (newest first)
          setBookmarks(prev => [newBookmark, ...prev]);
          setTotalBookmarks(prev => prev + 1);
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Error fetching new bookmark details:', err);
        }
      });

      setListening(true);
    } catch (err) {
      console.error('Error setting up event listener:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBookmarks();
    setupEventListener();

    // Cleanup listener on unmount
    return () => {
      try {
        const contract = getContract();
        contract.removeAllListeners();
      } catch (err) {
        console.error('Error removing listeners:', err);
      }
    };
  }, [displayCount]);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Load more bookmarks
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, totalBookmarks));
  };

  if (loading) {
    return (
      <div className="reader-loading">
        <LoadingSpinner />
        <p>Loading bookmarks from the blockchain...</p>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <div className="reader-container">
        {/* Header */}
        <header className="reader-header">
          <h1>Onchain Bookmark Reader</h1>
          <p className="reader-subtitle">
            Real-time feed of onchainbookmarks minted on Flow EVM
          </p>
          
          <div className="reader-stats">
            <div className="stat-item">
              <span className="stat-label">Total Bookmarks:</span>
              <span className="stat-value">{totalBookmarks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Update:</span>
              <span className="stat-value">
                {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Live Updates:</span>
              <span className={`stat-value ${listening ? 'active' : ''}`}>
                {listening ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="reader-error">
            <p>{error}</p>
            <button onClick={fetchBookmarks} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <Card>
            <div className="empty-state">
              <h3>No bookmarks found</h3>
              <p>Be the first to mint a bookmark on the platform!</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="bookmarks-grid">
              {bookmarks.map((bookmark) => (
                <Card key={bookmark.tokenId} className="bookmark-card">
                  <div className="bookmark-header">
                    <h3 className="bookmark-title">{bookmark.title}</h3>
                    <span className="bookmark-id">#{bookmark.tokenId}</span>
                  </div>
                  
                  {bookmark.description && (
                    <p className="bookmark-description">{bookmark.description}</p>
                  )}
                  
                  <div className="bookmark-url">
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bookmark-link"
                    >
                      {bookmark.url}
                    </a>
                  </div>
                  
                  <div className="bookmark-footer">
                    <span className="bookmark-creator">
                      By {formatAddress(bookmark.creatorAddress)}
                    </span>
                    <span className="bookmark-time">
                      {formatDistanceToNow(new Date(bookmark.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="bookmark-actions">
                    <a 
                      href={`https://evm.flowscan.io/token/${BOOKMARK_NFT_ADDRESS}/instance/${bookmark.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chain-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      View on Chain
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
{bookmarks.length < totalBookmarks && (
  <div className="load-more-container">
    <button onClick={loadMore} className="load-more-button">
      Load More ({Math.max(0, totalBookmarks - bookmarks.length)} remaining)
    </button>
  </div>
)}
          </>
        )}
      </div>

      <style jsx>{`
        .reader-page {
          min-height: 100vh;
          background: var(--color-slate-50, #f8fafc);
          padding: 2rem 1rem;
        }

        .reader-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .reader-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .reader-header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-text-primary, #0f172a);
          margin-bottom: 0.5rem;
        }

        .reader-subtitle {
          font-size: 1.125rem;
          color: var(--color-text-secondary, #64748b);
          margin-bottom: 2rem;
        }

        .reader-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-label {
          color: var(--color-text-secondary, #64748b);
        }

        .stat-value {
          font-weight: 600;
          color: var(--color-text-primary, #0f172a);
        }

        .stat-value.active {
          color: var(--color-success-600, #16a34a);
        }

        .reader-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
          color: var(--color-text-secondary, #64748b);
        }

        .reader-error {
          background: var(--color-red-50, #fef2f2);
          border: 1px solid var(--color-red-200, #fecaca);
          color: var(--color-red-700, #b91c1c);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 2rem;
        }

        .retry-button {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--color-red-600, #dc2626);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retry-button:hover {
          background: var(--color-red-700, #b91c1c);
        }

        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .bookmark-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bookmark-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .bookmark-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .bookmark-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary, #0f172a);
          margin: 0;
          flex: 1;
          word-break: break-word;
        }

        .bookmark-id {
          font-size: 0.875rem;
          color: var(--color-text-tertiary, #94a3b8);
          font-family: var(--font-mono);
          flex-shrink: 0;
          margin-left: 1rem;
        }

        .bookmark-description {
          color: var(--color-text-secondary, #64748b);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .bookmark-url {
          margin-bottom: 1rem;
        }

        .bookmark-link {
          color: var(--color-primary-600, #2563eb);
          text-decoration: none;
          word-break: break-all;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .bookmark-link:hover {
          color: var(--color-primary-700, #1d4ed8);
          text-decoration: underline;
        }

        .bookmark-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: var(--color-text-tertiary, #94a3b8);
          border-top: 1px solid var(--color-slate-200, #e2e8f0);
          padding-top: 1rem;
        }

        .bookmark-creator {
          font-family: var(--font-mono);
        }

        .bookmark-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-slate-200, #e2e8f0);
        }

        .chain-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary, #64748b);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .chain-link:hover {
          color: var(--color-primary-600, #2563eb);
        }

        .chain-link svg {
          width: 16px;
          height: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: var(--color-text-primary, #0f172a);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--color-text-secondary, #64748b);
        }

        .load-more-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .load-more-button {
          padding: 0.75rem 2rem;
          background: var(--color-primary-600, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .load-more-button:hover {
          background: var(--color-primary-700, #1d4ed8);
        }

        @media (max-width: 768px) {
          .reader-header h1 {
            font-size: 2rem;
          }

          .reader-stats {
            gap: 1rem;
          }

          .stat-item {
            flex-direction: column;
            gap: 0.25rem;
            text-align: center;
          }

          .bookmarks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}