'use client'

export default function BuyBuffaflow() {
  const handleFlowFunClick = () => {
    window.open('https://flowfun.xyz/collection/6893c3f9fc44a8bb9e159eb4/token', '_blank', 'noopener,noreferrer')
  }

  const handleOpenSeaClick = () => {
    window.open('https://opensea.io/collection/moonbuffaflow', '_blank', 'noopener,noreferrer')
  }

  const handleExplorerClick = () => {
    window.open('https://evm.flowscan.io/address/0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798', '_blank', 'noopener,noreferrer')
  }

  const handleViewNFTsClick = () => {
    window.open('https://opensea.io/collection/moonbuffaflow', '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{
      padding: '2rem 1rem',
      color: 'var(--color-text-secondary)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Main Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🦬
        </div>
        
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '2rem'
        }}>
          Unlock Premium Features with $BUFFAFLOW
        </h2>

        {/* Contract Address */}
        <div style={{
          background: 'var(--color-primary-50)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--color-primary-200)',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-600)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            CONTRACT ADDRESS
          </p>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'monospace',
            color: 'var(--color-primary-800)',
            wordBreak: 'break-all'
          }}>
            0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
          </p>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-primary-600)',
            marginTop: '0.5rem'
          }}>
            Flow EVM Blockchain
          </p>
        </div>
      </div>

      {/* Value Propositions */}
      <div style={{
        background: 'var(--color-primary-50)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--color-primary-200)',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-primary-700)',
          marginBottom: '1rem'
        }}>
          Premium Benefits
        </h3>
        <ul style={{
          color: 'var(--color-primary-800)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          paddingLeft: '1rem'
        }}>
          <li><strong>Free profile creation</strong> - Hold 100+ $BUFFAFLOW to bypass all creation fees</li>
          <li><strong>Access bookmark collections</strong> - Create and manage your bookmark NFTs</li>
          <li><strong>Exclusive utility token</strong> - Only 15,600,000 $BUFFAFLOW exist on Flow EVM</li>
          <li><strong>Bonded to sold-out NFTs</strong> - Connected to the MoonBuffaFLOW collection</li>
        </ul>
      </div>

      {/* About Section */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--color-neutral-50)',
        borderRadius: '8px',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '1rem'
        }}>
          About $BUFFAFLOW
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem'
        }}>
          $BUFFAFLOW are the bonded tokens of the MoonBuffaFLOW NFT collection, which sold out in under 5 hours. These ERC404 tokens on Flow EVM Mainnet combine fungible utility with NFT rarity.
        </p>
        <p style={{
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)'
        }}>
          <strong>How It Works:</strong> Acquire 100+ $BUFFAFLOW tokens or MoonBuffaFLOW NFTs, keep them in your wallet for platform access, and create profiles and bookmark collections without fees.
        </p>
      </div>

      {/* Setup Instructions */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--color-neutral-50)',
        borderRadius: '8px',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '1rem'
        }}>
          MetaMask Setup
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem'
          }}>
            Add Flow EVM to MetaMask:
          </h4>
          <ul style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            lineHeight: '1.5',
            paddingLeft: '1rem'
          }}>
            <li>Network Name: Flow EVM Mainnet</li>
            <li>RPC URL: https://mainnet.evm.nodes.onflow.org</li>
            <li>Chain ID: 747</li>
            <li>Currency Symbol: FLOW</li>
            <li>Block Explorer: https://evm.flowscan.io</li>
          </ul>
        </div>

        <div>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem'
          }}>
            Add $BUFFAFLOW Token to MetaMask:
          </h4>
          <ul style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            lineHeight: '1.5',
            paddingLeft: '1rem'
          }}>
            <li>Token Contract: 0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798</li>
            <li>Token Symbol: $BUFFAFLOW</li>
            <li>Decimals: 18</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={handleFlowFunClick}
          style={{
            background: 'var(--color-primary-600)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'
          }}
        >
          Buy Tokens on FlowFun →
        </button>

        <button
          onClick={handleOpenSeaClick}
          style={{
            background: 'var(--color-secondary-600)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-600)'
          }}
        >
          Buy NFTs on OpenSea →
        </button>

        <button
          onClick={handleViewNFTsClick}
          style={{
            background: 'transparent',
            color: 'var(--color-secondary-600)',
            border: '1px solid var(--color-secondary-300)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary-50)'
            e.currentTarget.style.borderColor = 'var(--color-secondary-400)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-secondary-300)'
          }}
        >
          View NFTs on OpenSea →
        </button>

        <button
          onClick={handleExplorerClick}
          style={{
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-neutral-300)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'
            e.currentTarget.style.borderColor = 'var(--color-neutral-400)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-neutral-300)'
          }}
        >
          View Contract on Flow Explorer
        </button>
      </div>

      {/* Technical Details */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        textAlign: 'center',
        lineHeight: '1.5',
        marginBottom: '2rem'
      }}>
        <p>
          Limited supply of 15,600,000 tokens bonded to a sold-out NFT collection.<br />
          Hold 100+ tokens OR any MoonBuffaFLOW NFT to unlock all premium platform features.
        </p>
      </div>
     
{/* Legal Disclaimers */}
<div style={{
  borderTop: '1px solid var(--color-neutral-200)',
  paddingTop: '1.5rem',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-tertiary)',
  lineHeight: '1.4'
}}>
  <h4 style={{
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem'
  }}>
    Legal Disclaimers
  </h4>
  
  <p style={{ marginBottom: '0.75rem' }}>
    <strong>Collectible Nature:</strong> $BUFFAFLOW are collectible tokens which unlock utility on ImmutableType. These tokens and MoonBuffaFLOW NFTs are experimental digital collectibles that may fluctuate in value. Only acquire what you can afford to lose.
  </p>
  
  <p style={{ marginBottom: '0.75rem' }}>
    <strong>Entertainment Purposes:</strong> ImmutableType tokens foster experiments in collaboration that should be used for entertainment purposes only. This information is educational and does not constitute financial, investment, or legal advice.
  </p>
  
  <p style={{ marginBottom: '0.75rem' }}>
    <strong>No Financial Advice:</strong> Consult with qualified professionals before making any decisions regarding digital collectibles or blockchain interactions.
  </p>
  
  <p style={{ marginBottom: '0.75rem' }}>
    <strong>Platform Features:</strong> Utility features and token benefits are subject to change. ImmutableType reserves the right to modify platform functionality, qualification requirements, and terms of service.
  </p>
  
  <p style={{ marginBottom: '0.75rem' }}>
    <strong>Regulatory Compliance:</strong> Users are responsible for compliance with applicable laws and regulations in their jurisdiction. Some features may not be available in all regions.
  </p>
  
  <p>
    <strong>Smart Contract Risk:</strong> Blockchain transactions are irreversible. Ensure you understand the risks associated with smart contract interactions before proceeding.
  </p>
</div>



    </div>
  )
}