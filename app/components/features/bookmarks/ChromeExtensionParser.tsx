'use client'

import { useState } from 'react'
import { ParsedExtensionData, BookmarkItem } from '../../../../lib/types/bookmark'

interface ChromeExtensionParserProps {
    onParsed: (data: ParsedExtensionData) => void
    onError: (error: string) => void
  }

export default function ChromeExtensionParser({ onParsed, onError }: ChromeExtensionParserProps) {
  const [inputText, setInputText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [previewData, setPreviewData] = useState<ParsedExtensionData | null>(null)

  const parseExtensionData = (text: string): ParsedExtensionData => {
    const lines = text.trim().split('\n').map(line => line.trim()).filter(Boolean)
    
    if (lines.length === 0) {
      throw new Error('No content to parse')
    }

    // Extract title and date from first line
    const titleLine = lines[0]
    const titleMatch = titleLine.match(/^(.+?)\s*-\s*(.+)$/)
    
    if (!titleMatch) {
      throw new Error('Invalid format: Title line should be in format "Title - Date"')
    }

    const title = titleMatch[1].trim()
    const date = titleMatch[2].trim()

    // Parse bookmark items
    const items: BookmarkItem[] = []
    let currentItem: Partial<BookmarkItem> = {}
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      // Check if line starts with bullet point (bookmark title)
      if (line.match(/^[•·*\-]\s*/)) {
        // Save previous item if exists
        if (currentItem.title && currentItem.url) {
          items.push(currentItem as BookmarkItem)
        }
        
        // Parse new item title and source
        const titleText = line.replace(/^[•·*\-]\s*/, '')
        const titleMatch = titleText.match(/^(.+?)\s*-\s*(.+)$/)
        
        if (titleMatch) {
          currentItem = {
            title: titleMatch[1].trim(),
            source: titleMatch[2].trim()
          }
        } else {
          currentItem = {
            title: titleText,
            source: 'Unknown'
          }
        }
      }
      // Check if line is a description (quoted text)
      else if (line.match(/^[""].*[""]$/)) {
        if (currentItem.title) {
          currentItem.description = line.replace(/^[""]|[""]$/g, '').trim()
        }
      }
      // Check if line is a URL
      else if (line.match(/^https?:\/\//)) {
        if (currentItem.title) {
          currentItem.url = line
        }
      }
    }
    
    // Save last item
    if (currentItem.title && currentItem.url) {
      items.push(currentItem as BookmarkItem)
    }

    if (items.length === 0) {
      throw new Error('No valid bookmarks found')
    }

    return { title, date, items }
  }

  const handleParse = async () => {
    if (!inputText.trim()) {
      onError('Please paste some content to parse')
      return
    }

    setIsParsing(true)
    
    try {
      const parsedData = parseExtensionData(inputText)
      setPreviewData(parsedData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse content'
      onError(errorMessage)
      setPreviewData(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleConfirm = () => {
    if (previewData) {
      onParsed(previewData)
      setInputText('')
      setPreviewData(null)
    }
  }

  const handleClear = () => {
    setInputText('')
    setPreviewData(null)
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Input Section */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--color-text-secondary)',
          marginBottom: '0.5rem'
        }}>
          Paste Chrome Extension Export
        </label>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Paste your exported bookmarks here...

Example format:
My ImmutableType Stacks - September 20, 2025
- Bitcoin: A Peer-to-Peer Electronic Cash System - bitcoin.org
  "Satoshi Nakamoto's original Bitcoin whitepaper"
  https://bitcoin.org/en/bitcoin-paper`}
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '1rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.5',
            resize: 'vertical',
            background: 'var(--color-slate-50)'
          }}
        />
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleParse}
            disabled={isParsing || !inputText.trim()}
            className="btn btn-primary"
            style={{
              minHeight: '44px',
              opacity: isParsing || !inputText.trim() ? 0.6 : 1,
              cursor: isParsing || !inputText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isParsing ? 'Parsing...' : 'Parse Content'}
          </button>
          
          <button
            onClick={handleClear}
            disabled={!inputText.trim()}
            className="btn btn-secondary"
            style={{
              minHeight: '44px',
              opacity: !inputText.trim() ? 0.6 : 1,
              cursor: !inputText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div style={{
          border: '1px solid var(--color-primary-200)',
          borderRadius: '12px',
          padding: '1.5rem',
          background: 'var(--color-primary-50)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--color-primary-700)',
            marginBottom: '1rem'
          }}>
            📋 Preview Parsed Results
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Title:</strong> {previewData.title}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Date:</strong> {previewData.date}
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Found:</strong> {previewData.items.length} bookmark{previewData.items.length !== 1 ? 's' : ''}
          </div>

          {/* Preview Items */}
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {previewData.items.map((item: BookmarkItem, index: number) => (
              <div key={index} style={{
                padding: '0.75rem 0',
                borderBottom: index < previewData.items.length - 1 ? '1px solid var(--color-slate-100)' : 'none'
              }}>
                <div style={{
                  fontWeight: '500',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.25rem'
                }}>
                  🌐 {item.source}
                </div>
                {item.description && (
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                    fontStyle: 'italic',
                    marginBottom: '0.25rem'
                  }}>
                    "{item.description}"
                  </div>
                )}
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary-600)',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all'
                }}>
                  {item.url}
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{ minHeight: '44px', flex: '1' }}
            >
              ✅ Confirm & Add Collection
            </button>
            
            <button
              onClick={() => setPreviewData(null)}
              className="btn btn-secondary"
              style={{ minHeight: '44px', flex: '1' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}