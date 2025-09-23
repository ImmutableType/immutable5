'use client'

export default function BuyBuffaflow() {
  const handleBuyClick = () => {
    window.open('https://flowfun.xyz/collection/6893c3f9fc44a8bb9e159eb4/token', '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem',
      color: 'var(--color-text-secondary)'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem'
      }}>
        💰
      </div>
      
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '1rem'
      }}>
        Buy BUFFAFLOW Tokens
      </h2>
      
      <p style={{
        fontSize: 'var(--text-base)',
        lineHeight: '1.6',
        maxWidth: '400px',
        margin: '0 auto 2rem'
      }}>
        Purchase BUFFAFLOW tokens to get free profile creation and unlock premium features on ImmutableType.
      </p>

      <div style={{
        background: 'var(--color-primary-50)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--color-primary-200)',
        marginBottom: '2rem',
        maxWidth: '500px',
        margin: '0 auto 2rem'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-primary-700)',
          marginBottom: '1rem'
        }}>
          Token Benefits
        </h3>
        <ul style={{
          textAlign: 'left',
          color: 'var(--color-primary-800)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6'
        }}>
          <li>Hold 100+ BUFFAFLOW tokens = Free profile creation</li>
          <li>No 3 FLOW fees for identity verification</li>
          <li>Early access to premium features</li>
          <li>Support the ImmutableType ecosystem</li>
        </ul>
      </div>

      <button
        onClick={handleBuyClick}
        style={{
          background: 'var(--color-primary-600)',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '8px',
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          minWidth: '200px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'
        }}
      >
        Buy BUFFAFLOW →
      </button>

      <p style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        marginTop: '1rem'
      }}>
        Opens FlowFun marketplace in new window
      </p>
    </div>
  )
}