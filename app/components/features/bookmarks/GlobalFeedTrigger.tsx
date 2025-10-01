'use client';

interface GlobalFeedTriggerProps {
  onOpenFeed: () => void;
  isConnected: boolean;
}

export function GlobalFeedTrigger({ onOpenFeed, isConnected }: GlobalFeedTriggerProps) {
  if (!isConnected) {
    return null;
  }

  return (
    <div className="global-feed-trigger">
      <div className="trigger-content">
        <p className="trigger-text">View most recent bookmarks</p>
        <button onClick={onOpenFeed} className="trigger-button">
          View Global Feed
        </button>
      </div>

      <style jsx>{`
        .global-feed-trigger {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          background: var(--color-slate-50);
        }

        .trigger-content {
          text-align: center;
        }

        .trigger-text {
          margin: 0 0 1rem 0;
          color: var(--color-text-secondary);
          font-size: var(--text-base);
          font-weight: 500;
        }

        .trigger-button {
          background: var(--color-primary-600);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: var(--text-base);
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .trigger-button:hover {
          background: var(--color-primary-700);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }

        .trigger-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}