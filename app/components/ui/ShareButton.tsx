'use client';

export function ShareButton() {
  const shareOnX = () => {
    const text = "Check out ImmutableType - Decentralized journalism platform on Flow EVM! 🚀";
    const url = "https://app.immutabletype.com";
    
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use Web Share API if available (better mobile experience)
      if (navigator.share) {
        navigator.share({
          title: 'ImmutableType',
          text: text,
          url: url
        }).catch((error) => {
          // Fallback to Twitter URL if share fails
          console.log('Error sharing:', error);
          openTwitterShare(text, url);
        });
      } else {
        // Fallback for mobile browsers without Web Share API
        openTwitterShare(text, url);
      }
    } else {
      // Desktop: Open in popup
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
    }
  };

  const openTwitterShare = (text: string, url: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    // On mobile, open in same window to trigger app
    window.location.href = twitterUrl;
  };

  return (
    <button 
      onClick={shareOnX}
      className="share-button"
      aria-label="Share on X (Twitter)"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      <span className="share-button-text">Share on X</span>
    </button>
  );
}