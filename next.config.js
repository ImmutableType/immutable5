/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the lockfile warning
  outputFileTracingRoot: process.cwd(),
  
  // Railway handles .env.production automatically
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig