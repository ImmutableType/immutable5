'use client'

import { useState, useEffect } from 'react'
import { BookmarkCollection, BookmarkItem, ParsedExtensionData } from '../../../../lib/types/bookmark'
import ChromeExtensionParser from './ChromeExtensionParser'
import ManualUrlEntry from './ManualUrlEntry'
import BookmarkCard from '../../ui/cards/BookmarkCard'

interface BookmarkCollectionProps {
  profileId: string
}

export default function BookmarkCollectionComponent({ profileId }: BookmarkCollectionProps) {
  const [collections, setCollections] = useState<BookmarkCollection[]>([])
  const [inputMethod, setInputMethod] = useState<'manual' | 'extension'>('manual')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tempBookmarks, setTempBookmarks] = useState<BookmarkItem[]>([])

  // Storage key for this profile's bookmark collections
  const storageKey = `immutable_bookmarks_${profileId}`

  // Load collections from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedCollections = JSON.parse(stored)
        setCollections(parsedCollections)
      }
    } catch (err) {
      console.error('Failed to load bookmark collections:', err)
      setError('Failed to load saved bookmarks')
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  // Save collections to localStorage whenever collections change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(collections))
      } catch (err) {
        console.error('Failed to save bookmark collections:', err)
        setError('Failed to save bookmarks')
      }
    }
  }, [collections, storageKey, isLoading])

  const generateCollectionId = (): string => {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleExtensionParsed = (data: ParsedExtensionData) => {
    // Generate a better collection title based on the content
    const collectionTitle = data.items.length === 1 
      ? `${data.items[0].title} - ${data.date}`
      : `Bookmark Collection - ${data.date}`

    const newCollection: BookmarkCollection = {
      id: generateCollectionId(),
      title: collectionTitle,
      date: data.date,
      items: data.items,
      createdAt: Date.now()
    }

    setCollections(prev => [newCollection, ...prev].slice(0, 5))
    setError(null)
  }

  const handleManualBookmarkAdd = (item: BookmarkItem) => {
    setTempBookmarks(prev => [...prev, item])
    setError(null)
  }

  const createManualCollection = () => {
    if (tempBookmarks.length === 0) {
      setError('No bookmarks to save')
      return
    }

    const now = new Date()
    const dateString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const newCollection: BookmarkCollection = {
      id: generateCollectionId(),
      title: `Manual Collection - ${dateString}`,
      date: dateString,
      items: [...tempBookmarks],
      createdAt: now.getTime()
    }

    setCollections(prev => [newCollection, ...prev].slice(0, 5))
    setTempBookmarks([])
    setError(null)
  }

  const handleMintCollection = (collection: BookmarkCollection) => {
    console.log('Mint collection:', collection)
    // TODO: Implement blockchain minting
    alert(`Minting "${collection.title}" to blockchain...`)
  }

  const handleDeleteCollection = (collection: BookmarkCollection) => {
    if (confirm(`Delete "${collection.title}"?`)) {
      setCollections(prev => prev.filter(c => c.id !== collection.id))
    }
  }

  const handleDeleteBookmark = (collectionId: string, bookmarkIndex: number) => {
    setCollections(prev => {
      return prev.map(collection => {
        if (collection.id === collectionId) {
          const updatedItems = collection.items.filter((_, index) => index !== bookmarkIndex)
          
          // If no items left, remove the entire collection
          if (updatedItems.length === 0) {
            return null
          }
          
          return {
            ...collection,
            items: updatedItems
          }
        }
        return collection
      }).filter(Boolean) as BookmarkCollection[]
    })
  }

  const removeTempBookmark = (index: number) => {
    setTempBookmarks(prev => prev.filter((_, i) => i !== index))
  }

  const clearTempBookmarks = () => {
    setTempBookmarks([])
  }

  const clearError = () => {
    setError(null)
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        color: 'var(--color-text-secondary)'
      }}>
        Loading bookmark collections...
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      
      {/* Error Display */}
      {error && (
        <div style={{
          background: 'var(--color-red-50)',
          border: '1px solid var(--color-red-200)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontWeight: '500',
              color: 'var(--color-red-700)',
              marginBottom: '0.25rem'
            }}>
              Error
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-red-600)'
            }}>
              {error}
            </div>
          </div>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-red-600)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Method Toggle */}
      <div style={{
        display: 'flex',
        background: 'var(--color-slate-100)',
        borderRadius: '8px',
        padding: '0.25rem',
        marginBottom: '2rem',
        gap: '0.25rem'
      }}>
        <button
          onClick={() => setInputMethod('manual')}
          style={{
            flex: '1',
            minHeight: '44px',
            padding: '0.75rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            background: inputMethod === 'manual' ? 'var(--color-white)' : 'transparent',
            color: inputMethod === 'manual' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: inputMethod === 'manual' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          📝 Manual Entry
        </button>
        <button
          onClick={() => setInputMethod('extension')}
          style={{
            flex: '1',
            minHeight: '44px',
            padding: '0.75rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            background: inputMethod === 'extension' ? 'var(--color-white)' : 'transparent',
            color: inputMethod === 'extension' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: inputMethod === 'extension' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          🔌 Chrome Extension
        </button>
      </div>

      {/* Input Method Content */}
      <div style={{ marginBottom: '3rem' }}>
        {inputMethod === 'manual' ? (
          <div>
            <ManualUrlEntry
              onAdd={handleManualBookmarkAdd}
              onError={setError}
            />

            {/* Temporary Bookmarks */}
            {tempBookmarks.length > 0 && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--color-amber-50)',
                border: '1px solid var(--color-amber-200)',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '600',
                    color: 'var(--color-amber-700)'
                  }}>
                    📋 Pending Bookmarks ({tempBookmarks.length})
                  </h3>
                  <button
                    onClick={clearTempBookmarks}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-amber-700)',
                      background: 'var(--color-amber-100)',
                      border: '1px solid var(--color-amber-300)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {tempBookmarks.map((bookmark, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '0.75rem 0',
                      borderBottom: index < tempBookmarks.length - 1 ? '1px solid var(--color-amber-200)' : 'none'
                    }}>
                      <div style={{ flex: '1' }}>
                        <div style={{
                          fontWeight: '500',
                          color: 'var(--color-text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {bookmark.title}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          🌐 {bookmark.source}
                        </div>
                        {bookmark.description && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-tertiary)',
                            fontStyle: 'italic',
                            marginTop: '0.25rem'
                          }}>
                            "{bookmark.description}"
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeTempBookmark(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-red-600)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          marginLeft: '1rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={createManualCollection}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    minHeight: '44px'
                  }}
                >
                  💾 Save as Collection
                </button>
              </div>
            )}
          </div>
        ) : (
          <ChromeExtensionParser
            onParsed={handleExtensionParsed}
            onError={setError}
          />
        )}
      </div>

      {/* Collections Display - Stacked Layout */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '600',
            color: 'var(--color-text-primary)'
          }}>
            📚 Bookmark Collections
          </h2>
          {collections.length > 0 && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              Showing {collections.length} of 5 max
            </span>
          )}
        </div>

        {collections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--color-slate-50)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              📂
            </div>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '500',
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem'
            }}>
              No Bookmark Collections Yet
            </h3>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              Start by adding bookmarks manually or import them from your Chrome extension export.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {collections.map((collection) => (
              <BookmarkCard
                key={collection.id}
                collection={collection}
                onMint={handleMintCollection}
                onDelete={handleDeleteCollection}
                onDeleteBookmark={handleDeleteBookmark}
              />
            ))}
          </div>
        )}

        {collections.length >= 5 && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary-700)',
              fontWeight: '500'
            }}>
              📊 Collection Limit Reached
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary-600)',
              marginTop: '0.25rem'
            }}>
              Showing 5 most recent collections. Older collections are automatically archived.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}