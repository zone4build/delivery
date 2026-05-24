const path = require('path');
const withPWA = require('next-pwa');

const { i18n } = require('./next-i18next.config');

console.log('>>> next.config.js loading...');
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  basePath: '',
  i18n,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'googleusercontent.com' },
      { hostname: 'graph.facebook.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 's3.amazonaws.com' },
      { hostname: '18.141.64.26' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      { hostname: 'pixarlaravel.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'pickbazarlaravel.s3-ap-southeast-1.amazonaws.com' },
      { hostname: 's3.ap-southeast-1.amazonaws.com' },
      { hostname: 's3-ap-southeast-1.amazonaws.com' },
      { hostname: 'zone4food.s3.eu-west-3.amazonaws.com' },
      { hostname: 'admin.zone4food.com' },
      { hostname: 'zone4food.com' },
      { hostname: 'i.pravatar.cc' },
      { hostname: 'omzn-s3-demo-bucket.s3.us-east-1.amazonaws.com' },
    ],
  },
  webpack(config, options) {
    config.resolve.alias['react'] = path.resolve(__dirname, 'node_modules', 'react');
    config.resolve.alias['react-dom'] = path.resolve(
      __dirname,
      'node_modules',
      'react-dom'
    );

    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];

    return config;
  },
  experimental: {
    // Disable ISR memory cache to force dynamic rendering
    // This prevents static generation errors with Jotai atoms
  },
  transpilePackages: [
    'jotai',
    'framer-motion',
    'swiper',
    'react-query',
    '@headlessui/react',
    'react-sticky-box',
    'rc-table',
    'rc-pagination',
    'rc-collapse',
    'rc-rate',
    'rc-slider',
    'react-datepicker',
    'react-toastify',
    'react-use',
    'react-dropzone',
    'react-hook-form',
    'react-phone-input-2',
    'react-otp-input',
    'react-copy-to-clipboard',
    'react-content-loader',
    'react-device-detect'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.zone4build.com'}/auth/:path*`,
      },
      // SEO files: per-shop sitemap and robots
      { source: '/:shopSlug/sitemap.xml', destination: '/sitemap.xml' },
      { source: '/:shopSlug/robots.txt', destination: '/robots.txt' },
      // System pages on marketplace hub
      { source: '/:shopSlug/checkout', destination: '/checkout' },
      { source: '/:shopSlug/checkout/digital', destination: '/checkout/digital' },
      { source: '/:shopSlug/checkout/guest', destination: '/checkout/guest' },
      { source: '/:shopSlug/profile', destination: '/profile' },
      { source: '/:shopSlug/orders', destination: '/orders' },
      { source: '/:shopSlug/orders/:tracking_number', destination: '/orders/:tracking_number' },
      { source: '/:shopSlug/orders/:tracking_number/payment/success', destination: '/orders/:tracking_number/payment/success' },
      { source: '/:shopSlug/orders/:tracking_number/payment/cancel', destination: '/orders/:tracking_number/payment/cancel' },
      { source: '/:shopSlug/order-received', destination: '/order-received' },
      { source: '/:shopSlug/products/:slug', destination: '/products/:slug' },
      { source: '/:shopSlug/authors', destination: '/authors' },
      { source: '/:shopSlug/authors/:author', destination: '/authors/:author' },
      { source: '/:shopSlug/manufacturers', destination: '/manufacturers' },
      { source: '/:shopSlug/manufacturers/:manufacturer', destination: '/manufacturers/:manufacturer' },
      { source: '/:shopSlug/help', destination: '/help' },
      { source: '/:shopSlug/contact', destination: '/contact' },
      { source: '/:shopSlug/privacy', destination: '/privacy' },
      { source: '/:shopSlug/terms', destination: '/terms' },
      { source: '/:shopSlug/change-password', destination: '/change-password' },
      { source: '/:shopSlug/downloads', destination: '/downloads' },
      { source: '/:shopSlug/offers', destination: '/offers' },
      { source: '/:shopSlug/questions', destination: '/questions' },
      { source: '/:shopSlug/refunds', destination: '/refunds' },
      { source: '/:shopSlug/reports', destination: '/reports' },
      { source: '/:shopSlug/wishlists', destination: '/wishlists' },
      { source: '/:shopSlug/coupon-generator', destination: '/coupon-generator' },
      { source: '/:shopSlug/logout', destination: '/logout' },
      { source: '/:shopSlug/login', destination: '/login' },
      { source: '/:shopSlug/forgotPassword', destination: '/forgotPassword' },
      { source: '/:shopSlug/search', destination: '/search' },
      // Dynamic SEO routes
      { source: '/robots.txt', destination: '/api/robots' },
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ];
  },
};

const withPWAConfig = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/api\.zone4build\.com/,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\/_next\/data\//,
      handler: 'NetworkOnly',
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
});

module.exports = withPWAConfig(nextConfig);
