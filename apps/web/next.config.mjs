import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in dev for testing offline support
  fallbacks: {
    document: '/offline', // Fallback for document requests (pages)
  },
})(nextConfig);
