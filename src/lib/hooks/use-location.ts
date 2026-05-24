import { atom, useAtom } from 'jotai';
import { useEffect, useCallback, useRef } from 'react';
import { detectLocation, LocationInfo } from '../location-utils';

const LOCATION_STORAGE_KEY = 'shop_location_info';

const locationAtom = atom<LocationInfo | null>(null);
const locationLoadedAtom = atom(false);
const locationInitializingAtom = atom(true);

export function useLocation() {
  const [location, setLocationAtom] = useAtom(locationAtom);
  const [loaded, setLoaded] = useAtom(locationLoadedAtom);
  const [initializing, setInitializing] = useAtom(locationInitializingAtom);
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    if (hasAttemptedLoad.current) return;
    hasAttemptedLoad.current = true;
    let isMounted = true;

    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
      try {
        const info = JSON.parse(saved);
        if (isMounted) {
          setLocationAtom(info);
          setLoaded(true);
          setInitializing(false);
        }
        return;
      } catch (e) {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    }

    detectLocation().then((info) => {
      if (!isMounted) return;
      setLocationAtom(info);
      setLoaded(true);
      setInitializing(false);
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(info));
    }).catch(() => {
      if (!isMounted) return;
      setLoaded(true);
      setInitializing(false);
    });

    return () => { isMounted = false; };
  }, []); // Empty — runs exactly once on mount, no deps needed

  const updateLocation = useCallback(
    (update: ((prev: LocationInfo | null) => LocationInfo) | LocationInfo) => {
      setLocationAtom((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          // localStorage quota exceeded — ignore
        }
        return next;
      });
    },
    [setLocationAtom]
  );

  return {
    country: location?.country,
    currency: location?.currency,
    rate: location?.rate ?? 1.0,
    loaded,
    initializing,
    setLocation: updateLocation,
  };
}