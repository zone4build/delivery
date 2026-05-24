import { AUTH_TOKEN_KEY } from '@/lib/constants';
import type { SearchParamOptions } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { resolveShopSlug } from '@/lib/shop-utils';
import { PLATFORM_SUBDOMAINS } from '@/lib/routing-constants';
import Router from 'next/router';

function resolveTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID || 'store2200';
}

const isServer = typeof window === 'undefined';

const httpClient = axios.create({
  baseURL: isServer && process.env.INTERNAL_REST_API_URL 
    ? process.env.INTERNAL_REST_API_URL 
    : process.env.NEXT_PUBLIC_REST_API_ENDPOINT,
  timeout: 30000,
  headers: {
    'x-tenant-id': resolveTenantId(),
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
httpClient.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  const shopSlug = resolveShopSlug();
  const marketplaceId = Cookies.get('MARKETPLACE_ID');

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token ? token : ''}`,
    'x-tenant-id': resolveTenantId(),
    ...(shopSlug && { 'x-shop-slug': shopSlug }),
    ...(marketplaceId && !PLATFORM_SUBDOMAINS.has(marketplaceId) && { 'x-marketplace-id': marketplaceId }),
  };
  return config;
});
// Helper to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Change response data/error here
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Retry logic for 429 (Too Many Requests)
    if (response && response.status === 429) {
      // Initialize retry count if it doesn't exist
      config.retryCount = config.retryCount || 0;

      // Maximum number of retries
      const MAX_RETRIES = 3;

      if (config.retryCount < MAX_RETRIES) {
        config.retryCount += 1;

        // Calculate backoff delay: 1s, 2s, 4s...
        const backoffDelay = Math.pow(2, config.retryCount - 1) * 1000;

        console.warn(
          `[HTTP Client] 429 detected on ${config.url}. Retrying (${config.retryCount}/${MAX_RETRIES}) after ${backoffDelay}ms...`
        );

        await sleep(backoffDelay);
        return httpClient(config);
      }
    }

    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403) ||
      (error.response &&
        error.response.data.message === 'PICKBAZAR_ERROR.NOT_AUTHORIZED')
    ) {
      Cookies.remove(AUTH_TOKEN_KEY);
      // Only reload/redirect if we're not already on the homepage/login to avoid infinite loops
      if (typeof window !== 'undefined' && Router.pathname !== '/') {
        Router.push('/');
      }
    }
    return Promise.reject(error);
  }
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await httpClient.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await httpClient.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await httpClient.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await httpClient.delete<T>(url);
    return response.data;
  }

  static formatSearchParams(params: Partial<SearchParamOptions> & { text?: string;[key: string]: any }) {
    const { text, ...rest } = params;

    // Standard parameters that should NOT be part of the 'search' string
    const excludedKeys = [
      'limit',
      'page',
      'searchJoin',
      'orderBy',
      'sortedBy',
      'with',
      'language',
      'permission',
      'text',
      // 'shop_id', // Allow shop_id to be part of the search string
      'search', // avoid recursion
    ];

    const searchString = Object.entries(rest)
      .filter(([k, value]) => Boolean(value) && !excludedKeys.includes(k))
      .map(([k, v]) =>
        ['type', 'categories', 'tags', 'author', 'manufacturer'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`
      )
      .join(';');

    if (text) {
      return searchString ? `${text};${searchString}` : text;
    }

    return searchString;
  }
}
