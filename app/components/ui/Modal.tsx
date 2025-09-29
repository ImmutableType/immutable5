'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-surface);
          border-radius: 16px;
          max-width: 640px;
          width: calc(100% - 2rem);
          max-height: 85vh;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-border);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          background: var(--color-surface);
          z-index: 1;
        }

        .modal-title {
          font-family: var(--font-headlines);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          line-height: 1;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--color-slate-100);
          color: var(--color-text-primary);
        }

        .modal-content {
          padding: 1.5rem;
        }

        @media (max-width: 640px) {
          .modal-container {
            max-height: 90vh;
            width: calc(100% - 1rem);
          }

          .modal-header {
            padding: 1.25rem 1.25rem 0.75rem 1.25rem;
          }

          .modal-title {
            font-size: var(--text-lg);
          }

          .modal-content {
            padding: 1.25rem;
          }
        }
      `}</style>
    </>
  );
}