import { Category } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const mapSearchAtom = atom('');
export const categorySearchAtom = atom<string | null>(null);
export const availableShopIdsAtom = atom<string[]>([]);
export const shopCategoriesAtom = atom<Category[]>([]);

// Location State
export type LocationSource = 'gps' | 'manual' | 'default';
export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  source: LocationSource;
}

export const locationStatusAtom = atom<LocationStatus>('idle');
export const activeSearchTabAtom = atom<'intent' | 'address'>('intent');

// Persisted user location
export const userLocationAtom = atomWithStorage<UserLocation | null>('user-location', null);
