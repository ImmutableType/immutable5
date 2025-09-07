// Simple wallet connection test
if (typeof window !== 'undefined' && window.ethereum) {
  console.log('MetaMask detected');
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => console.log('Connected:', accounts))
    .catch(err => console.error('Connection failed:', err));
} else {
  console.log('No wallet detected');
}
