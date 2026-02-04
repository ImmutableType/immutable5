# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security details to: [security@immutabletype.com] (if available)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Private keys
   - API keys
   - Database credentials

2. **Use environment variables**
   - Store secrets in `.env.local`
   - Never commit `.env.local`
   - Use `NEXT_PUBLIC_` prefix only for public values

3. **Validate inputs**
   - Always validate user inputs
   - Sanitize data before storing
   - Use TypeScript types

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update dependencies promptly
   - Review security advisories

### For Users

1. **Verify contract addresses**
   - Check addresses on FlowScan
   - Verify against official documentation
   - Be cautious of phishing

2. **Protect your wallet**
   - Never share private keys
   - Use hardware wallets for large amounts
   - Verify transactions before signing

3. **Check URLs**
   - Always use official domain
   - Verify SSL certificates
   - Be cautious of similar domains

## Known Security Considerations

### Smart Contracts

- Contracts are immutable once deployed
- Admin functions are protected
- No upgrade mechanism (by design)

### Frontend

- All contract addresses are public
- No sensitive data stored client-side
- Wallet connections use standard EIP-1193

### Network

- Flow EVM Mainnet is public blockchain
- All transactions are public
- No private data on-chain

## Security Audit Status

- **ProfileNFTFixed**: Not audited (consider for production)
- **TokenQualifierFixed**: Not audited
- **BookmarkNFT**: Not audited

**Recommendation**: Professional security audit recommended before handling significant funds.

## Disclosure Policy

- Vulnerabilities will be disclosed after fix is deployed
- Credit will be given to reporters (if desired)
- Timeline: 30-90 days depending on severity

## Further Reading

- [Smart Contracts Documentation](./smart-contracts.md)
- [Environment Configuration](./environment.md)
- [Contributing Guidelines](./contributing.md)
