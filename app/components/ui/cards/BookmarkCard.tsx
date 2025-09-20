'use client'

import { BookmarkCollection, BookmarkItem } from '../../../../lib/types/bookmark'

interface BookmarkCardProps {
  collection: BookmarkCollection
  onMint?: (collection: BookmarkCollection) => void
  onDelete?: (collection: BookmarkCollection) => void
  onDeleteBookmark?: (collectionId: string, bookmarkIndex: number) => void
}

export default function BookmarkCard({ collection, onMint, onDelete, onDeleteBookmark }: BookmarkCardProps) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      background: 'var(--color-white)',
      transition: 'all 0.2s ease'
    }}>
      {/* Collection Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
          lineHeight: '1.4'
        }}>
          {collection.title}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          flexWrap: 'wrap'
        }}>
          <span>📅 {collection.date}</span>
          <span>🔗 {collection.items.length} bookmark{collection.items.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* All Bookmarks with Individual Delete */}
      <div style={{ marginBottom: '1rem' }}>
        {collection.items.map((item: BookmarkItem, index: number) => (
          <div key={index} style={{
            padding: '0.75rem 0',
            borderBottom: index < collection.items.length - 1 ? '1px solid var(--color-slate-100)' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{ flex: '1', minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                marginBottom: '0.25rem',
                lineHeight: '1.4'
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span>🌐 {item.source}</span>
                {item.description && (
                  <span style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    • {item.description}
                  </span>
                )}
              </div>
            </div>
            
            {/* Individual bookmark delete button */}
            {onDeleteBookmark && (
              <button
                onClick={() => onDeleteBookmark(collection.id, index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-red-500)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-red-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                }}
                title={`Delete "${item.title}"`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--color-slate-100)',
        flexWrap: 'wrap'
      }}>
        {onMint && (
          <button
            onClick={() => onMint(collection)}
            style={{
              minHeight: '44px',
              padding: '0.75rem 1rem',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-white)',
              background: 'var(--color-primary-600)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: '1'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-700)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-600)'
            }}
          >
            ⛓️ Mint Onchain
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(collection)}
            style={{
              minHeight: '44px',
              padding: '0.75rem 1rem',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-red-600)',
              background: 'var(--color-red-50)',
              border: '1px solid var(--color-red-200)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-red-100)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-red-50)'
            }}
          >
            Delete Collection
          </button>
        )}
      </div>
    </div>
  )
}