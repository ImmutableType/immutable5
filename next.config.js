/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the lockfile warning
  outputFileTracingRoot: process.cwd(),
  
  // Remove custom dotenv loading - Railway handles this differently
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig