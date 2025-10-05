'use client';

import { useState } from 'react';
import { BookmarkCollection, BookmarkItem } from '../../../../lib/types/bookmark';
import { BookmarkNFTService, BookmarkData } from '../../../../lib/services/bookmark/BookmarkNFTService';

interface BookmarkCardProps {
  collection: BookmarkCollection;
  onDelete: (id: string) => void;
  onEdit: (collection: BookmarkCollection) => void;
  userAddress?: string;
}

export function BookmarkCard({ collection, onDelete, onEdit, userAddress }: BookmarkCardProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);

  const handleMint = async () => {
    console.log('Mint button clicked');
    
    // Get wallet address directly from ethereum provider
    let currentAddress = userAddress; // First try the prop
    
    if (!currentAddress && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          currentAddress = accounts[0];
        }
      } catch (error) {
        console.error('Error getting accounts:', error);
      }
    }
    
    console.log('Wallet address:', currentAddress);
    
    if (!currentAddress) {
      console.log('No wallet connected');
      setMintError('Please connect your wallet first');
      return;
    }

    console.log('Using address:', currentAddress);
    console.log('Collection items:', collection.items);

    if (collection.items.length === 0) {
      console.log('No bookmarks to mint');
      setMintError('No bookmarks to mint');
      return;
    }

    if (collection.items.length > 5) {
      console.log('Too many bookmarks:', collection.items.length);
      setMintError('Maximum 5 bookmarks per mint transaction');
      return;
    }

    setIsMinting(true);
    setMintError(null);
    setMintSuccess(null);

    try {
      console.log('Creating BookmarkNFTService...');
      const bookmarkService = new BookmarkNFTService();
      
      console.log('Initializing service...');
      await bookmarkService.initialize();
      console.log('Service initialized successfully');

      // Check if user is qualified
      console.log('Checking user qualification...');
      const isQualified = await bookmarkService.isQualified(currentAddress);
      console.log('User qualified:', isQualified);
      
      if (!isQualified) {
        throw new Error('Not qualified to mint. Need ProfileNFT + 100+ BUFFAFLOW tokens or MoonBuffaflow NFT');
      }

      // Check remaining daily mints
      console.log('Checking daily limits...');
      const remainingMints = await bookmarkService.getRemainingDailyMints(currentAddress);
      console.log('Remaining mints:', remainingMints);
      
      if (remainingMints < collection.items.length) {
        throw new Error(`Daily limit exceeded. ${remainingMints} mints remaining today`);
      }

      // Prepare bookmark data with proper validation
      console.log('Preparing bookmark data...');
      const bookmarkData: BookmarkData[] = collection.items.map((item: BookmarkItem) => {
        // Truncate title to 100 characters max (contract requirement)
        let title = item.title.trim();
        if (title.length > 100) {
          title = title.substring(0, 97) + '...';
        }
        
        // Ensure URL is valid and within limits (500 chars max per contract)
        let url = item.url.trim();
        if (url.length > 500) {
          throw new Error(`URL too long for bookmark "${title}"`);
        }
        
        // Ensure description is within limits (300 chars max per contract)
        let description = (item.description || '').trim();
        if (description.length > 300) {
          description = description.substring(0, 297) + '...';
        }
        
        return {
          title,
          url,
          description
        };
      });
      
      console.log('Bookmark data prepared:', bookmarkData);

      // Mint the bookmarks
      console.log('Starting mint transaction...');
      const transactionHash = await bookmarkService.mintBookmarks(bookmarkData);
      console.log('Transaction hash received:', transactionHash);
      
      setMintSuccess(`Successfully minted ${collection.items.length} bookmark NFTs! Transaction: ${transactionHash.slice(0, 10)}...`);
      
      // Remove the collection from localStorage after successful mint
      setTimeout(() => {
        onDelete(collection.id);
      }, 3000);

    } catch (error: any) {
      console.error('Minting error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setMintError(error.message || 'Failed to mint bookmarks');
    } finally {
      setIsMinting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="bookmark-card">
      <div className="bookmark-card-header">
        <h3 className="bookmark-card-title">{collection.title}</h3>
        <div className="bookmark-card-actions">
          <button 
            onClick={() => onEdit(collection)}
            className="edit-button"
            disabled={isMinting}
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(collection.id)}
            className="delete-button"
            disabled={isMinting}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bookmark-card-content">
        <div className="bookmark-count">
          {collection.items.length} bookmark{collection.items.length !== 1 ? 's' : ''}
        </div>
        <div className="bookmark-date">
          Created: {formatDate(collection.createdAt)}
        </div>
        
        <div className="bookmark-items">
        {collection.items.slice(0, 3).map((item: BookmarkItem, index: number) => (
            <div key={index} className="bookmark-item-preview">
              <strong>{item.title}</strong>
              <div className="bookmark-url">{truncateUrl(item.url)}</div>
            </div>
          ))}
          {collection.items.length > 3 && (
            <div className="bookmark-item-more">
              +{collection.items.length - 3} more bookmarks
            </div>
          )}
        </div>
      </div>

      <div className="bookmark-card-footer">
        <div className="mint-section">
          <button 
            onClick={handleMint}
            disabled={isMinting || collection.items.length === 0 || collection.items.length > 5}
            className={`mint-button ${isMinting ? 'minting' : ''}`}
          >
            {isMinting ? 'Minting...' : `Mint to Blockchain (${collection.items.length} NFTs)`}
          </button>
          
          <div className="mint-info">
            <div className="mint-fee">Fee: 0.025 FLOW + gas</div>
            <div className="mint-limit">Max 5 per transaction, 20 per day</div>
          </div>
        </div>

        {mintError && (
          <div className="mint-error">
            Error: {mintError}
          </div>
        )}

        {mintSuccess && (
          <div className="mint-success">
            {mintSuccess}
          </div>
        )}
      </div>

      <style jsx>{`
        .bookmark-card {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          background: white;
        }

        .bookmark-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .bookmark-card-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
        }

        .bookmark-card-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button, .delete-button {
          padding: 6px 12px;
          border: 1px solid #e1e5e9;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .edit-button:hover {
          background: #f8f9fa;
        }

        .delete-button:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .bookmark-card-content {
          margin-bottom: 16px;
        }

        .bookmark-count {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .bookmark-date {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .bookmark-item-preview {
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .bookmark-item-preview strong {
          display: block;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .bookmark-url {
          font-size: 12px;
          color: #6b7280;
        }

        .bookmark-item-more {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
          text-align: center;
          padding: 8px;
        }

        .mint-section {
          border-top: 1px solid #e1e5e9;
          padding-top: 16px;
        }

        .mint-button {
          width: 100%;
          padding: 12px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .mint-button:hover:not(:disabled) {
          background: #0052a3;
        }

        .mint-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .mint-button.minting {
          background: #059669;
        }

        .mint-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }

        .mint-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          margin-top: 8px;
        }

        .mint-success {
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #16a34a;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}