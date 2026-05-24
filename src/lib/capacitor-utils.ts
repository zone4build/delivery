// Mobile wrapper bridge utilities for Capacitor
// This allows the Next.js app to detect if it's running inside the mobile shell
declare global {
  interface Window {
    Capacitor?: any;
  }
}
/**
 * Checks if the Next.js application is currently being rendered 
 * inside the Capacitor native Webview wrapper.
 */
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false; // Not native if on server
  return !!window.Capacitor && window.Capacitor.isNativePlatform();
};
/**
 * Utility to safely invoke native plugins ONLY if running in the wrapper.
 * Fallbacks should be provided for standard web behaviors.
 */
export const getNativePlugin = (pluginName: string) => {
  if (!isNativeApp()) return null;
  // In Capacitor v3+, plugins can be accessed via window.Capacitor.Plugins
  // or imported. Since this is a shared web/mobile app, we use the bridge.
  return (window as any).Capacitor?.Plugins?.[pluginName] || null;
};
/**
 * Universal Geolocation Bridge.
 * Automatically checks Capacitor Native Permissions and Hardware mapping if running
 * in the native shell, or falls back to HTML5 `navigator.geolocation` for web visitors.
 */
export const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  if (isNativeApp()) {
    try {
      const Geolocation = getNativePlugin('Geolocation');
      if (!Geolocation) throw new Error('Geolocation plugin missing');
      
      // Request native OS permissions first (Required for iOS App Store and Android 10+)
      const permStatus = await Geolocation.checkPermissions();
      if (permStatus.location === 'prompt' || permStatus.location === 'prompt-with-rationale') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') throw new Error('Location permission denied.');
      }
      // Fetch from hardware OS sensor
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      return { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude };
    } catch (error) {
      console.warn('[Capacitor Geolocation] Native fetch failed or plugin stripped. Falling back to HTML5...', error);
      // Do not return null. Let the execution fall through to the Web HTML5 fallback below!
    }
  }
  // Fallback to HTML5 Browser Sensor (For Web Visitors OR Apps with Location Pluing Stripped)
  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      console.warn('[HTML5 Geolocation] Not supported by this browser.');
      return resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.warn('[HTML5 Geolocation] Web fetch failed:', err);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * Native Google Login Bridge.
 * Fetches the ID Token from the native Google SDK if running in Capacitor.
 */
export const getNativeGoogleToken = async (): Promise<string | null> => {
  if (!isNativeApp()) return null;

  try {
    const GoogleAuth = getNativePlugin('GoogleAuth');
    if (!GoogleAuth) throw new Error('GoogleAuth plugin missing in native shell');
    
    // Trigger native OS login sheet
    const user = await GoogleAuth.signIn();
    return user.authentication.idToken || null;
  } catch (error) {
    console.error('[Capacitor GoogleAuth] Native login failed:', error);
    return null;
  }
};
