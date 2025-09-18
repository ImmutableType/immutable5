/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Load .env.mainnet for mainnet configuration
    ...require('dotenv').config({ path: '.env.mainnet' }).parsed,
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig