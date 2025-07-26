/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Docker with nginx
  output: 'export',
  
  // Disable server-side image optimization in Docker
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Disable trailing slash for cleaner URLs
  trailingSlash: false,
};

export default nextConfig;
