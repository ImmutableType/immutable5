'use client';

export function HowToModalContent() {
  return (
    <div className="howto-content">
      <div className="howto-section">
        <h3 className="howto-step-title">Step 1: Install MetaMask</h3>
        <p className="howto-text">
          Before creating a profile, you need MetaMask installed in your browser.
        </p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="howto-link"
        >
          Download MetaMask →
        </a>
        <p className="howto-note">After installing, refresh this page to continue.</p>
      </div>

      <div className="howto-section">
        <h3 className="howto-step-title">Step 2: Connect & Network Switching</h3>
        <p className="howto-text">
          Click "Connect Wallet" and approve the connection in MetaMask.
        </p>
        <div className="howto-highlight">
          <strong>Flow EVM Mainnet:</strong> Our system will automatically add Flow EVM Mainnet to your MetaMask and switch to it.
        </div>
        <p className="howto-text" style={{ marginTop: '0.75rem' }}>
          If auto-switch doesn't work, manually add the network with these details:
        </p>
        <ul className="howto-list">
          <li><strong>Network Name:</strong> Flow EVM Mainnet</li>
          <li><strong>RPC URL:</strong> https://mainnet.evm.nodes.onflow.org</li>
          <li><strong>Chain ID:</strong> 747</li>
          <li><strong>Currency:</strong> FLOW</li>
        </ul>
      </div>

      <div className="howto-section">
        <h3 className="howto-step-title">Step 3: Fill Out Your Profile</h3>
        <p className="howto-text">
          Most fields are straightforward. Here's help for the profile picture:
        </p>
        <div className="howto-highlight">
          <strong>Profile Picture URL:</strong> Upload your image to a free service like Imgur.com (no account needed), then paste the direct image URL (should end in .jpg, .png, etc.)
        </div>
      </div>

      <div className="howto-section">
        <h3 className="howto-step-title">Step 4: Payment Options</h3>
        
        <div className="howto-payment-option">
          <strong>Option A: Pay 3 FLOW</strong>
          <p className="howto-text">You need 3 FLOW tokens plus a small amount for gas fees.</p>
          <p className="howto-text"><strong>How to get FLOW:</strong></p>
          <ol className="howto-list">
            <li>Buy directly in MetaMask wallet (click "Buy" button)</li>
            <li>Transfer FLOW from an exchange to your EVM address</li>
            <li>
              Follow <a 
                href="https://x.com/Immutable_type" 
                target="_blank" 
                rel="noopener noreferrer"
                className="howto-link-inline"
              >
                @Immutable_type
              </a> on Twitter and request 100 BUFFAFLOW tokens
            </li>
          </ol>
        </div>

        <div className="howto-payment-option">
          <strong>Option B: Hold 100+ BUFFAFLOW (FREE)</strong>
          <p className="howto-text">
            If you hold 100 or more BUFFAFLOW tokens, profile creation is completely free!
          </p>
        </div>
      </div>

      <div className="howto-section">
        <h3 className="howto-step-title">Step 5: Transaction Confirmation</h3>
        <p className="howto-text">After clicking "Create Profile":</p>
        <ol className="howto-list">
          <li>MetaMask will pop up asking you to confirm the transaction</li>
          <li>The transaction takes a few seconds to write to the blockchain</li>
          <li>This is normal - blockchain is different from instant web2 apps</li>
          <li>Don't refresh the page while waiting</li>
          <li>You'll see a success message when complete</li>
        </ol>
      </div>

      <style jsx>{`
        .howto-content {
          font-family: var(--font-body);
          color: var(--color-text-primary);
        }

        .howto-section {
          margin-bottom: 2rem;
        }

        .howto-section:last-child {
          margin-bottom: 0;
        }

        .howto-step-title {
          font-family: var(--font-headlines);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.75rem;
        }

        .howto-text {
          font-size: var(--text-base);
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
        }

        .howto-highlight {
          background: var(--color-slate-50);
          border-left: 3px solid var(--color-primary-600);
          padding: 0.875rem 1rem;
          border-radius: 6px;
          font-size: var(--text-sm);
          line-height: 1.5;
          color: var(--color-text-secondary);
        }

        .howto-list {
          margin: 0.75rem 0 0.75rem 1.5rem;
          padding: 0;
          font-size: var(--text-sm);
          line-height: 1.6;
          color: var(--color-text-secondary);
        }

        .howto-list li {
          margin-bottom: 0.5rem;
        }

        .howto-list li:last-child {
          margin-bottom: 0;
        }

        .howto-payment-option {
          background: var(--color-slate-50);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 0.75rem;
          border: 1px solid var(--color-border);
        }

        .howto-payment-option:first-of-type {
          margin-bottom: 1rem;
        }

        .howto-payment-option strong {
          display: block;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          font-size: var(--text-base);
        }

        .howto-link {
          display: inline-block;
          color: var(--color-primary-600);
          text-decoration: none;
          font-weight: 500;
          font-size: var(--text-sm);
          margin-top: 0.5rem;
          transition: color 0.2s ease;
        }

        .howto-link:hover {
          color: var(--color-primary-700);
          text-decoration: underline;
        }

        .howto-link-inline {
          color: var(--color-primary-600);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .howto-link-inline:hover {
          color: var(--color-primary-700);
          text-decoration: underline;
        }

        .howto-note {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          margin-top: 0.5rem;
          font-style: italic;
        }

        @media (max-width: 640px) {
          .howto-step-title {
            font-size: var(--text-base);
          }

          .howto-text {
            font-size: var(--text-sm);
          }

          .howto-list {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
}