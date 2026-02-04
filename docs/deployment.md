# Deployment Guide

Guide for deploying ImmutableType to production.

## Deployment Platforms

### Supported Platforms

- **Railway** (Current) - Recommended
- **Vercel** - Alternative
- **Self-hosted** - Docker/Node.js

## Railway Deployment

### Initial Setup

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Build**
   - Railway auto-detects Next.js
   - Uses `railway.toml` for configuration
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Set Environment Variables**
   - Go to project settings
   - Navigate to "Variables"
   - Add all `NEXT_PUBLIC_*` variables
   - See [Environment Configuration](./environment.md)

### Railway Configuration

The `railway.toml` file configures Railway:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Custom Domain

1. **Add Domain**
   - Go to project settings
   - Navigate to "Domains"
   - Add custom domain (e.g., `app.immutabletype.com`)

2. **DNS Configuration**
   - Add CNAME record pointing to Railway domain
   - Railway handles SSL automatically

### Monitoring

- **Logs**: View in Railway dashboard
- **Metrics**: CPU, memory, network usage
- **Deployments**: View deployment history

## Vercel Deployment

### Setup

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import GitHub repository
   - Vercel auto-detects Next.js

2. **Configure**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Set for Production, Preview, Development

### Vercel Configuration

Create `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

## Build Process

### Local Build Test

Test production build locally:

```bash
# Build
npm run build

# Start production server
npm start
```

### Build Optimization

Next.js automatically:
- Optimizes images
- Code splits
- Minifies JavaScript
- Tree shakes unused code

### Build Output

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── .next/          # Build cache
```

## Environment Variables in Production

### Railway

Set in Railway dashboard:
1. Project → Settings → Variables
2. Add each variable
3. Redeploy after adding

### Vercel

Set in Vercel dashboard:
1. Project → Settings → Environment Variables
2. Add for each environment
3. Redeploy

### Verification

Check variables are loaded:

```typescript
// Should log in production
console.log('Profile NFT:', process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS)
```

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Contract addresses verified
- [ ] RPC URL is correct
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Tests pass (if applicable)
- [ ] Documentation updated

## Deployment Steps

### Railway

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Railway auto-deploys**
   - Monitors GitHub for pushes
   - Triggers build automatically

3. **Monitor deployment**
   - Watch logs in Railway dashboard
   - Check for build errors

4. **Verify deployment**
   - Visit deployed URL
   - Test wallet connection
   - Verify contract interactions

### Manual Deploy

If auto-deploy fails:

1. Go to Railway dashboard
2. Click "Redeploy"
3. Select commit
4. Monitor build logs

## Post-Deployment

### Verification

1. **Check Application**
   - Visit production URL
   - Test wallet connection
   - Create test profile
   - Mint test bookmark

2. **Check Logs**
   - Monitor for errors
   - Check RPC requests
   - Verify contract calls

3. **Check Performance**
   - Monitor response times
   - Check error rates
   - Verify uptime

### Monitoring

- **Application Logs**: Check Railway/Vercel logs
- **Error Tracking**: Consider Sentry or similar
- **Analytics**: Add analytics if needed
- **Uptime Monitoring**: Use UptimeRobot or similar

## Troubleshooting Deployment

### Build Fails

**Check:**
1. Node.js version (requires 18+)
2. Environment variables
3. TypeScript errors
4. Missing dependencies

**Solution:**
```bash
# Test build locally
npm run build

# Fix errors
npm run lint
```

### Runtime Errors

**Check:**
1. Environment variables loaded
2. Contract addresses correct
3. RPC endpoint accessible
4. Network configuration

**Solution:**
- Check deployment logs
- Verify environment variables
- Test RPC endpoint

### Performance Issues

**Check:**
1. Build optimization
2. Image optimization
3. Code splitting
4. Caching

**Solution:**
- Enable Next.js optimizations
- Use CDN for static assets
- Implement caching strategies

## Rollback

### Railway

1. Go to deployments
2. Find previous successful deployment
3. Click "Redeploy"

### Vercel

1. Go to deployments
2. Find previous deployment
3. Click "Promote to Production"

## CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

## Security

### Environment Variables

- Never commit `.env.local`
- Use platform secrets management
- Rotate keys regularly
- Limit access to production variables

### Build Security

- Keep dependencies updated
- Run `npm audit` regularly
- Use `npm audit fix` for vulnerabilities
- Review security advisories

## Scaling

### Railway

- Auto-scales based on traffic
- Configure resource limits
- Monitor usage

### Vercel

- Auto-scales with Edge Network
- Configure bandwidth limits
- Monitor usage

## Further Reading

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
