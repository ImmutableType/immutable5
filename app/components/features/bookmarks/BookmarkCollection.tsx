'use client';

import { useState, useEffect } from 'react';
import { BookmarkCollection, BookmarkItem, ParsedExtensionData } from '../../../../lib/types/bookmark';
import { BookmarkCard } from '../../ui/cards/BookmarkCard';
import ChromeExtensionParser from './ChromeExtensionParser';
import { MintedBookmarkService } from '../../../../lib/services/blockchain/MintedBookmarkService';

interface BookmarkCollectionProps {
  userAddress?: string;
  isOwner: boolean;
}

export function BookmarkCollectionManager({ userAddress, isOwner }: BookmarkCollectionProps) {
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<BookmarkCollection | null>(null);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [userQualified, setUserQualified] = useState(false);
  const [remainingMints, setRemainingMints] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states for manual bookmark entry
  const [newBookmark, setNewBookmark] = useState<BookmarkItem>({
    title: '',
    url: '',
    source: 'manual',
    description: ''
  });

  const mintedBookmarkService = new MintedBookmarkService();

  useEffect(() => {
    loadCollections();
    if (userAddress) {
      checkUserStatus();
    }
  }, [userAddress]);

  const loadCollections = () => {
    const stored = localStorage.getItem('bookmarkCollections');
    if (stored) {
      setCollections(JSON.parse(stored));
    }
  };

  const saveCollections = (updatedCollections: BookmarkCollection[]) => {
    localStorage.setItem('bookmarkCollections', JSON.stringify(updatedCollections));
    setCollections(updatedCollections);
  };

  const checkUserStatus = async () => {
    if (!userAddress) return;

    setLoading(true);
    try {
      await mintedBookmarkService.initialize();
      const qualified = await mintedBookmarkService.isUserQualified(userAddress);
      const remaining = await mintedBookmarkService.getUserRemainingMints(userAddress);
      
      setUserQualified(qualified);
      setRemainingMints(remaining);
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = () => {
    if (!newCollectionTitle.trim()) return;

    const newCollection: BookmarkCollection = {
      id: Date.now().toString(),
      title: newCollectionTitle,
      items: [],
      createdAt: Date.now(),
      date: new Date().toLocaleDateString()
    };

    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);
    setNewCollectionTitle('');
    setShowCreateForm(false);
  };

  const deleteCollection = (id: string) => {
    const updatedCollections = collections.filter(c => c.id !== id);
    saveCollections(updatedCollections);
  };

  const editCollection = (collection: BookmarkCollection) => {
    setEditingCollection(collection);
    setNewCollectionTitle(collection.title);
    setShowCreateForm(true);
  };

  const saveEditedCollection = () => {
    if (!editingCollection || !newCollectionTitle.trim()) return;

    const updatedCollections = collections.map(c => 
      c.id === editingCollection.id 
        ? { ...c, title: newCollectionTitle }
        : c
    );
    
    saveCollections(updatedCollections);
    setEditingCollection(null);
    setNewCollectionTitle('');
    setShowCreateForm(false);
  };

  const addBookmarkToCollection = (collectionId: string, bookmark: BookmarkItem) => {
    const updatedCollections = collections.map(collection => 
      collection.id === collectionId 
        ? { ...collection, items: [...collection.items, bookmark] }
        : collection
    );
    saveCollections(updatedCollections);
  };

  const addManualBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;

    if (collections.length === 0) {
      // Create a new collection if none exist
      const newCollection: BookmarkCollection = {
        id: Date.now().toString(),
        title: 'My Bookmarks',
        items: [newBookmark],
        createdAt: Date.now(),
        date: new Date().toLocaleDateString()
      };
      saveCollections([newCollection]);
    } else {
      // Add to the first collection
      addBookmarkToCollection(collections[0].id, newBookmark);
    }

    // Reset form
    setNewBookmark({
      title: '',
      url: '',
      source: 'manual',
      description: ''
    });
  };

  const handleImportedBookmarks = (bookmarks: BookmarkItem[]) => {
    if (bookmarks.length === 0) return;

    const newCollection: BookmarkCollection = {
      id: Date.now().toString(),
      title: `Imported Bookmarks - ${new Date().toLocaleDateString()}`,
      items: bookmarks,
      createdAt: Date.now(),
      date: new Date().toLocaleDateString()
    };

    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);
    setShowImportForm(false);
  };

  if (!isOwner) {
    return (
      <div className="bookmark-collection-container">
        <div className="access-message">
          Only the profile owner can manage bookmark collections.
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-collection-container">
      <div className="bookmark-collection-header">
        <h2>Bookmark Collections</h2>
        <div className="user-status">
          {loading && <span>Checking qualification...</span>}
          {userAddress && !loading && (
            <div className="qualification-status">
              <div className={`status-indicator ${userQualified ? 'qualified' : 'not-qualified'}`}>
                {userQualified ? 'Qualified to Mint' : 'Not Qualified'}
              </div>
              <div className="remaining-mints">
                Daily mints remaining: {remainingMints}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-button"
        >
          Create Collection
        </button>
        <button 
          onClick={() => setShowImportForm(true)}
          className="import-button"
        >
          Import from Chrome
        </button>
      </div>

      {!userQualified && userAddress && (
        <div className="qualification-warning">
          To mint bookmark NFTs, you need:
          <ul>
            <li>A ProfileNFT (create at profile creation)</li>
            <li>100+ BUFFAFLOW tokens OR 1+ MoonBuffaflow NFT</li>
          </ul>
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h3>{editingCollection ? 'Edit Collection' : 'Create New Collection'}</h3>
          <input
            type="text"
            placeholder="Collection title"
            value={newCollectionTitle}
            onChange={(e) => setNewCollectionTitle(e.target.value)}
            className="title-input"
          />
          <div className="form-actions">
            <button 
              onClick={editingCollection ? saveEditedCollection : createCollection}
              className="save-button"
            >
              {editingCollection ? 'Save Changes' : 'Create'}
            </button>
            <button 
              onClick={() => {
                setShowCreateForm(false);
                setEditingCollection(null);
                setNewCollectionTitle('');
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showImportForm && (
        <div className="import-form">
          <ChromeExtensionParser
  onParsed={(data) => {
    handleImportedBookmarks(data.items);
    setShowImportForm(false);
  }}
  onError={(error) => {
    console.error('Import error:', error);
    // Could add state to show error to user
  }}
/>
        </div>
      )}

      <div className="manual-entry-form">
        <h3>Add Individual Bookmark</h3>
        <div className="bookmark-form">
          <input
            type="text"
            placeholder="Bookmark title"
            value={newBookmark.title}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
            className="form-input"
          />
          <input
            type="url"
            placeholder="URL (https://example.com)"
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newBookmark.description}
            onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
            className="form-input"
          />
          <button 
            onClick={addManualBookmark}
            disabled={!newBookmark.title || !newBookmark.url}
            className="add-bookmark-button"
          >
            Add Bookmark
          </button>
        </div>
      </div>

      <div className="collections-list">
        {collections.length === 0 ? (
          <div className="empty-state">
            <p>No bookmark collections yet.</p>
            <p>Create a collection or import bookmarks to get started.</p>
          </div>
        ) : (
          collections.map(collection => (
            <BookmarkCard
              key={collection.id}
              collection={collection}
              onDelete={deleteCollection}
              onEdit={editCollection}
              userAddress={userAddress}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .bookmark-collection-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .bookmark-collection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .bookmark-collection-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .user-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .qualification-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .status-indicator {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-indicator.qualified {
          background: #dcfce7;
          color: #15803d;
        }

        .status-indicator.not-qualified {
          background: #fef2f2;
          color: #dc2626;
        }

        .remaining-mints {
          font-size: 12px;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .create-button, .import-button {
          padding: 10px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .create-button:hover, .import-button:hover {
          background: #f9fafb;
        }

        .qualification-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          color: #92400e;
        }

        .qualification-warning ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .create-form, .import-form {
          background: #f9fafb;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 24px;
        }

        .create-form h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .title-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .save-button, .cancel-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .save-button {
          background: #0066cc;
          color: white;
          border-color: #0066cc;
        }

        .cancel-button {
          background: white;
        }

        .manual-entry-form {
          background: #f9fafb;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 24px;
        }

        .manual-entry-form h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .bookmark-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
        }

        .add-bookmark-button {
          padding: 10px 16px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .add-bookmark-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .access-message {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}