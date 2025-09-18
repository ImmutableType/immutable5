/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Load .env.mainnet for mainnet configuration
    ...require('dotenv').config({ path: '.env.mainnet' }).parsed,
  },
  eslint: {
    rules: {
      'react/no-unescaped-entities': 'off'
    }
  }
}

module.exports = nextConfig