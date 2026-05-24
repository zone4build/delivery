import { Routes } from '@/config/routes';

// Get tenant name from environment variable, capitalize first letter
const getTenantName = () => {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'shop';
  return tenantId.charAt(0).toUpperCase() + tenantId.slice(1);
};

export const siteSettings = {
  name: getTenantName(),
  description: '',
  logo: {
    url: '/logo.svg',
    alt: getTenantName(),
    href: '/grocery',
    width: 128,
    height: 40,
  },
  defaultLanguage: 'en',
  currencyCode: 'TND',
  currencyDisplay: 'code', // Use currency code instead of symbol
  product: {
    placeholderImage: '/product-placeholder.svg',
    cardMaps: {
      grocery: 'Krypton',
      furniture: 'Radon',
      bag: 'Oganesson',
      makeup: 'Neon',
      book: 'Xenon',
      medicine: 'Helium',
      default: 'Argon',
    },
  },
  authorizedLinks: [
    { href: Routes.profile, label: 'auth-menu-profile' },
    { href: Routes.orders, label: 'auth-menu-my-orders' },
  ],
  authorizedLinksMobile: [
    { href: Routes.profile, label: 'auth-menu-profile' },
    { href: Routes.orders, label: 'auth-menu-my-orders' },
    { href: Routes.changePassword, label: 'profile-sidebar-password' },
  ],
  dashboardSidebarMenu: [
    {
      href: Routes.profile,
      label: 'profile-sidebar-profile',
    },
    {
      href: Routes.orders,
      label: 'profile-sidebar-orders',
    },
    {
      href: Routes.changePassword,
      label: 'profile-sidebar-password',
    },
    {
      href: Routes.logout,
      label: 'profile-sidebar-logout',
    },
  ],
  sellingAdvertisement: {
    image: {
      src: '/selling.png',
      alt: 'Selling Advertisement',
    },
  },
  cta: {
    mockup_img_src: '/mockup-img.png',
    play_store_link: '/',
    app_store_link: '/',
  },
  footer: {
    copyright: {
      name: 'RedQ, Inc',
      href: 'https://redq.io/',
    },
    address: '2429 River Drive, Suite 35 Cottonhall, CA 2296 United Kingdom',
    email: 'dummy@dummy.com',
    phone: '+1 256-698-0694',
    // Currency-based reset removed as we now support backend-provided currencies directly
    // and have a simplified 1.0 exchange rate.
    menus: [
      {
        title: 'text-explore',
        links: [
          {
            name: 'text-about-us',
            href: '/',
          },
          {
            name: 'text-sitemap',
            href: '/',
          },
          {
            name: 'text-bookmarks',
            href: '/',
          },
          {
            name: 'text-sign-join',
            href: '/',
          },
        ],
      },
      {
        title: 'text-customer-service',
        links: [
          {
            name: 'text-faq-help',
            href: Routes.help,
          },
          {
            name: 'text-returns',
            href: '/',
          },
          {
            name: 'text-accessibility',
            href: '/',
          },
          {
            name: 'text-contact-us',
            href: Routes.contactUs,
          },
          {
            name: 'text-store-pickup',
            href: '/',
          },
        ],
      },
      {
        title: 'text-our-information',
        links: [
          {
            name: 'text-privacy-update',
            href: Routes.privacy,
          },
          {
            name: 'text-terms-condition',
            href: Routes.terms,
          },
          {
            name: 'text-return-policy',
            href: '/',
          },
          {
            name: 'text-sitemap',
            href: '/',
          },
        ],
      },
    ],
    payment_methods: [
      {
        img: '/payment/master.png',
        url: '/',
      },
      {
        img: '/payment/skrill.png',
        url: '/',
      },
      {
        img: '/payment/paypal.png',
        url: '/',
      },
      {
        img: '/payment/visa.png',
        url: '/',
      },
      {
        img: '/payment/discover.png',
        url: '/',
      },
    ],
  },
};
