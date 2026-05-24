import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '@/types';
import { useTranslation } from 'next-i18next';
import { getDistance } from '@/lib/get-distance';
import { Phone } from '@/components/icons/phone';
import { Navigation } from '@/components/icons/navigation';
import { useShopRoutes } from '@/lib/hooks/use-shop-routes';
import Image from 'next/image';
import productPlaceholder from '@/assets/placeholders/product.svg';
import { useRouter } from 'next/router';
import { useAtom, useSetAtom } from 'jotai';
import {
    mapSearchAtom,
    availableShopIdsAtom,
    categorySearchAtom,
    shopCategoriesAtom,
    userLocationAtom,
    locationStatusAtom,
    activeSearchTabAtom,
    UserLocation
} from '@/store/map-search-atom';
import { useShopsDiscovery } from '@/framework/shop';
import cn from 'classnames';
import { SHOP_CATEGORIES, getCategoryIcon } from '@/lib/category-utils';
import { getIcon } from '@/lib/get-icon';
import * as categoryIcons from '@/components/icons/category';

const createShopIcon = (name: string) => L.divIcon({
    html: `
        <div class="relative flex flex-col items-center justify-center">
            <div class="relative flex items-center justify-center">
                <div class="absolute inset-0 h-11 w-11 bg-[#00c59a]/30 rounded-full animate-ping"></div>
                <div class="relative h-11 w-11 bg-[#00c59a] rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center text-white transform transition-all hover:scale-110">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </div>
            </div>
            <span class="mt-1 px-2 py-0.5 bg-white text-[#00c59a] text-[10px] font-black uppercase tracking-widest rounded shadow-sm border border-gray-100 whitespace-nowrap">${name}</span>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [120, 64],
    iconAnchor: [60, 32],
});

const USER_ICON = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 h-10 w-10 bg-accent/40 rounded-full animate-ping"></div>
            <div class="relative h-10 w-10 bg-accent rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center text-white">
                <svg width="20" height="20" viewBox="0 0 16.577 18.6" fill="currentColor">
                    <g transform="translate(-95.7 -121.203)">
                        <path d="M-7722.37,2933a.63.63,0,0,1-.63-.63c0-4.424,2.837-6.862,7.989-6.862s7.989,2.438,7.989,6.862a.629.629,0,0,1-.63.63Zm.647-1.251h13.428c-.246-3.31-2.5-4.986-6.713-4.986s-6.471,1.673-6.714,4.986Zm2.564-12.518a4.1,4.1,0,0,1,1.172-3,4.1,4.1,0,0,1,2.979-1.229,4.1,4.1,0,0,1,2.979,1.229,4.1,4.1,0,0,1,1.171,3,4.341,4.341,0,0,1-4.149,4.5,4.344,4.344,0,0,1-4.16-4.5Zm1.251,0a3.1,3.1,0,0,0,2.9,3.254,3.094,3.094,0,0,0,2.9-3.253,2.878,2.878,0,0,0-.813-2.109,2.88,2.88,0,0,0-2.085-.872,2.843,2.843,0,0,0-2.1.856,2.841,2.841,0,0,0-.806,2.122Z" transform="translate(7819 -2793.5)" />
                    </g>
                </svg>
            </div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const MapEvents = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
};

const getZoomByRadius = (radius: number) => {
    if (radius <= 0) return 2;
    if (radius <= 5) return 13;
    if (radius <= 10) return 12;
    if (radius <= 20) return 11;
    if (radius <= 50) return 10;
    if (radius <= 100) return 9;
    if (radius >= 100000) return 2; // World view
    return 8;
};

const ShopMap: React.FC<{ shops: Shop[] }> = ({ shops }) => {
    const { t } = useTranslation('common');
    const routes = useShopRoutes();

    // Global Location State
    const [persistedLocation, setPersistedLocation] = useAtom(userLocationAtom);
    const [locationStatus, setLocationStatus] = useAtom(locationStatusAtom);
    const [activeTab, setActiveTab] = useAtom(activeSearchTabAtom);

    // Local derived state
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        persistedLocation ? [persistedLocation.lat, persistedLocation.lng] : null
    );
    const [radius, setRadius] = useState<number>(10);
    const [mapCenter, setMapCenter] = useState<[number, number]>(
        persistedLocation ? [persistedLocation.lat, persistedLocation.lng] : [0, 0]
    );

    const [addressInput, setAddressInput] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useAtom(categorySearchAtom);
    const router = useRouter();

    const handleLocateMe = () => {
        setLocationStatus('loading');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLoc: UserLocation = {
                        lat: latitude,
                        lng: longitude,
                        source: 'gps',
                        address: 'Current Location'
                    };
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                    setPersistedLocation(newLoc);
                    setLocationStatus('granted');
                    setRadius(10);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationStatus('denied');
                    // Fallback to world view if no persisted location
                    if (!persistedLocation) setRadius(100);
                },
                { timeout: 10000 }
            );
        } else {
            setLocationStatus('denied');
            if (!persistedLocation) setRadius(100);
        }
    };

    useEffect(() => {
        if (persistedLocation) {
            setUserLocation([persistedLocation.lat, persistedLocation.lng]);
            setMapCenter([persistedLocation.lat, persistedLocation.lng]);
        }
    }, [persistedLocation]);

    useEffect(() => {
        if (!persistedLocation) {
            handleLocateMe();
        } else {
            setLocationStatus('granted');
        }
    }, []);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleAddressSearch = (query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Using Positionstack API for production geocoding
                const API_KEY = '9ac6fe5b34ab7b6f35c4c849eb7afac4';
                const response = await fetch(`https://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(query)}&limit=5`);

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                // Map Positionstack format to our existing component structure
                const mappedData = (data.data || []).map((item: any) => ({
                    lat: item.latitude,
                    lon: item.longitude,
                    display_name: item.label
                }));

                setSuggestions(mappedData);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Geocoding error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Reduced debounce to 500ms since we have a paid commercial API now
    };

    const handleSelectAddress = (s: any) => {
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.lon);
        const newLoc: UserLocation = {
            lat,
            lng,
            address: s.display_name,
            source: 'manual'
        };
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setPersistedLocation(newLoc);
        setAddressInput(s.display_name);
        setShowSuggestions(false);
        setRadius(10);
        setLocationStatus('granted'); // Consider manual selection as granted
    };

    const handleMarkerDrag = (e: any) => {
        const marker = e.target;
        const position = marker.getLatLng();
        const newLoc: UserLocation = {
            lat: position.lat,
            lng: position.lng,
            source: 'manual',
            address: 'Custom Pin'
        };
        setUserLocation([position.lat, position.lng]);
        setPersistedLocation(newLoc);
    };

    const hasLocation = (shop: Shop) =>
        shop?.settings?.location?.lat && shop?.settings?.location?.lng;

    const [mapSearch] = useAtom(mapSearchAtom);
    const setMapSearch = useSetAtom(mapSearchAtom);

    // 1. Calculate shops within the radius first
    const shopsInRadius = useMemo(() => {
        return shops.filter((shop) => {
            if (!hasLocation(shop)) return false;
            if (userLocation && radius > 0) {
                const distance = getDistance(
                    userLocation[0],
                    userLocation[1],
                    Number(shop.settings?.location?.lat),
                    Number(shop.settings?.location?.lng)
                );
                return distance <= radius;
            }
            return true;
        });
    }, [shops, userLocation, radius]);

    const shopIdFilter = useMemo(() => {
        return shopsInRadius.map(s => s.id).join(',');
    }, [shopsInRadius]);

    // 2. Fetch discovery results from backend
    const { shops: discoveredShops } = useShopsDiscovery({
        search: mapSearch,
        category_id: selectedCategory ?? undefined,
        shop_id: shopIdFilter
    }, {
        // Enable if we have a search term OR a category filter
        enabled: Boolean((mapSearch && mapSearch.length >= 2) || selectedCategory) && Boolean(shopIdFilter)
    });

    const matchingShopIdsFromBackend = useMemo(() => {
        if (!mapSearch && !selectedCategory) return null;
        return new Set(discoveredShops?.map(s => s.id).filter(Boolean));
    }, [discoveredShops, mapSearch, selectedCategory]);

    const filteredShops = useMemo(() => {
        return shopsInRadius.filter((shop) => {
            // If we have a backend filter active (Search or Category), use those IDs
            if (matchingShopIdsFromBackend) {
                return matchingShopIdsFromBackend.has(shop.id);
            }

            // Fallback to local filtering if no backend results are active
            // Category Filter (Local)
            if (selectedCategory && shop.category !== selectedCategory) {
                // Support aliases
                const isFoodAlias = (selectedCategory === '585' && (shop.category === 'food' || shop.category === 'food-restaurant'));
                if (!isFoodAlias) return false;
            }

            // Search Filter (Product match OR Shop name/description match)
            if (mapSearch && mapSearch.length >= 2) {
                const shopNameMatch = shop.name.toLowerCase().includes(mapSearch.toLowerCase()) ||
                    shop.description?.toLowerCase().includes(mapSearch.toLowerCase());

                const productMatch = matchingShopIdsFromBackend?.has(shop.id);

                if (!shopNameMatch && !productMatch) return false;
            }

            return true;
        });
    }, [shopsInRadius, mapSearch, matchingShopIdsFromBackend, selectedCategory]);

    const setAvailableShopIds = useSetAtom(availableShopIdsAtom);

    useEffect(() => {
        const shopIds = filteredShops.map(shop => shop.id);
        setAvailableShopIds(shopIds);
    }, [filteredShops, setAvailableShopIds]);

    const [shopCategories] = useAtom(shopCategoriesAtom);
    const currentZoom = getZoomByRadius(radius);

    return (
        <div className="relative h-[850px] md:h-[90vh] w-full overflow-hidden shadow-2xl">
            {/* GPS Disabled Banner - Only show when blocked */}
            {locationStatus === 'denied' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-orange-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center animate-fade-in border border-orange-400">
                    <span className="w-2 h-2 bg-white rounded-full mr-2" />
                    GPS Disabled
                    <button
                        onClick={() => setActiveTab('address')}
                        className="ml-3 bg-white text-orange-600 px-2 py-0.5 rounded font-black hover:bg-orange-50"
                    >
                        Set Address
                    </button>
                </div>
            )}

            {/* Premium Floating Controls */}
            <div className="absolute top-16 md:top-20 left-1/2 z-[9999] -translate-x-1/2 flex flex-col items-center w-[94%] max-w-2xl space-y-3 transition-all">

                {/* Search Tabs */}
                <div className="flex bg-white/60 backdrop-blur p-1 rounded-full shadow-lg border border-white/40">
                    <button
                        onClick={() => setActiveTab('intent')}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'intent' ? "bg-accent text-white shadow-md" : "text-heading hover:bg-white/40"
                        )}
                    >
                        Search Intent
                    </button>
                    <button
                        onClick={() => setActiveTab('address')}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'address' ? "bg-accent text-white shadow-md" : "text-heading hover:bg-white/40"
                        )}
                    >
                        My Address
                    </button>
                </div>

                {/* Search Bar - Tab Dependent */}
                <div className="flex flex-row items-center space-x-2 bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.15)] border border-white/40 w-full transition-all">
                    {activeTab === 'intent' ? (
                        <div className="flex-1 flex items-center min-w-[150px]">
                            <input
                                type="text"
                                value={mapSearch}
                                onChange={(e) => setMapSearch(e.target.value)}
                                placeholder={t('text-search-intent-placeholder', 'Search pizza, barber, shoes...')}
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-black text-heading placeholder:text-gray-400 pl-4 uppercase tracking-tighter"
                            />
                            {mapSearch && (
                                <button
                                    type="button"
                                    onClick={() => setMapSearch('')}
                                    className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full hover:bg-gray-200 transition-all font-black text-[10px] uppercase tracking-widest mx-1"
                                >
                                    {t('text-clear', 'Clear')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center min-w-[150px] relative">
                            <input
                                type="text"
                                value={addressInput}
                                onChange={(e) => {
                                    setAddressInput(e.target.value);
                                    handleAddressSearch(e.target.value);
                                }}
                                placeholder={t('text-enter-address', 'City, Street, Zip Code...')}
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-black text-heading placeholder:text-gray-400 pl-4 uppercase tracking-tighter"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl border border-gray-100 py-2 max-h-60 overflow-y-auto no-scrollbar z-[99999]">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectAddress(s)}
                                            className="w-full text-left px-5 py-3 hover:bg-accent/5 transition-colors border-b last:border-0 border-gray-50 group"
                                        >
                                            <p className="text-[11px] font-black text-heading uppercase group-hover:text-accent truncate">{s.display_name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center space-x-1 pr-1 border-l border-gray-100 ml-2 pl-2">
                        <button
                            onClick={handleLocateMe}
                            className={cn(
                                "flex items-center justify-center h-9 w-9 rounded-full transition-all",
                                locationStatus === 'loading' ? "bg-accent/20 text-accent animate-spin" : "bg-gray-100 text-accent hover:bg-gray-200"
                            )}
                        >
                            <Navigation className="h-4 w-4" />
                        </button>

                        <div className="flex items-center bg-gray-100 rounded-full px-3 h-9">
                            <select
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="bg-transparent text-[11px] font-black text-heading focus:outline-none cursor-pointer"
                            >
                                {[5, 10, 20, 50, 100].map((r) => (
                                    <option key={r} value={r}>{r}km</option>
                                ))}
                                <option value={100000}>{t('text-all', 'All')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex w-full overflow-x-auto no-scrollbar py-2 px-4 items-center justify-start md:justify-center space-x-3 flex-nowrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            !selectedCategory ? "bg-accent text-white shadow-lg" : "bg-white/90 text-heading hover:bg-white shadow-sm border border-white/40"
                        )}
                    >
                        All
                    </button>
                    {(shopCategories.length > 0 ? shopCategories : SHOP_CATEGORIES).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center",
                                selectedCategory === cat.id ? "bg-accent text-white shadow-lg" : "bg-white/90 text-heading hover:bg-white shadow-sm border border-white/40"
                            )}
                        >
                            <span className="mr-1.5">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diagnostic Badge */}
            <div className="absolute top-8 right-4 z-[9999] bg-accent text-white px-3 py-1 rounded-full shadow-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                {filteredShops.length} {t('text-shops-found', 'Live Shops')}
            </div>

            <MapContainer
                center={mapCenter}
                zoom={currentZoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents center={mapCenter} zoom={currentZoom} />

                {userLocation && (
                    <Marker position={userLocation} icon={USER_ICON} draggable={true} eventHandlers={{ dragend: handleMarkerDrag }} />
                )}

                {filteredShops.map((shop) => {
                    const shopLat = Number(shop.settings?.location?.lat);
                    const shopLng = Number(shop.settings?.location?.lng);
                    const distance = userLocation ? getDistance(userLocation[0], userLocation[1], shopLat, shopLng) : null;
                    const dynamicCategory = shopCategories.find(c => c.id === shop.category || c.slug === shop.category);
                    const catIcon = dynamicCategory
                        ? { id: dynamicCategory.id, name: dynamicCategory.name, icon: dynamicCategory.icon || '🏠', color: '#00c59a' }
                        : getCategoryIcon(shop.category);

                    return (
                        <Marker
                            key={shop.id}
                            position={[shopLat, shopLng]}
                            icon={L.divIcon({
                                html: `
                                        <div class="relative flex flex-col items-center justify-center">
                                            <div class="relative flex items-center justify-center">
                                                <div class="absolute inset-0 h-11 w-11 rounded-full animate-pulse" style="background-color: ${catIcon.color}44"></div>
                                                <div class="relative h-11 w-11 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center text-white transform transition-all hover:scale-110" style="background-color: ${catIcon.color}">
                                                    <span class="text-xl">${catIcon.icon && catIcon.icon.length <= 2 ? catIcon.icon : '🏠'}</span>
                                                </div>
                                            </div>
                                            <span class="mt-1 px-2 py-0.5 bg-white text-heading text-[10px] font-black uppercase tracking-widest rounded shadow-sm border border-gray-100 whitespace-nowrap">${shop.name}</span>
                                        </div>
                                    `,
                                className: 'custom-div-icon',
                                iconSize: [120, 64],
                                iconAnchor: [60, 32],
                            })}
                            eventHandlers={{
                                click: (e) => {
                                    const map = e.target._map;
                                    const point = map.project([shopLat, shopLng], map.getZoom());
                                    point.y += 180;
                                    const target = map.unproject(point, map.getZoom());
                                    map.setView(target, map.getZoom(), { animate: true });
                                }
                            }}
                        >
                            <Popup autoPan={true} closeButton={false} className="custom-shop-popup" minWidth={240}>
                                <div className="flex flex-col p-0 overflow-hidden rounded-2xl bg-white min-w-[220px]">
                                    {/* Cover Photo Upgrade */}
                                    <div className="relative h-28 w-full bg-gray-100">
                                        <Image
                                            src={shop?.cover_image?.original || shop?.logo?.thumbnail || productPlaceholder}
                                            alt={shop.name}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center">
                                            <span className="mr-1 h-3 w-3 flex items-center justify-center">
                                                {catIcon.icon && catIcon.icon.length > 2 ? (
                                                    getIcon({
                                                        iconList: categoryIcons,
                                                        iconName: catIcon.icon,
                                                        className: "text-accent",
                                                    })
                                                ) : (
                                                    catIcon.icon || '🏠'
                                                )}
                                            </span>
                                            {catIcon.name}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col items-center text-center -mt-8">
                                        {/* Floating Logo */}
                                        <div className="z-10 h-16 w-16 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden relative mb-2">
                                            <Image
                                                src={shop?.logo?.thumbnail || productPlaceholder}
                                                alt={shop.name}
                                                layout="fill"
                                                objectFit="contain"
                                            />
                                        </div>

                                        <h3 className="text-sm font-black text-heading uppercase tracking-tighter leading-tight">
                                            {shop.name}
                                        </h3>

                                        <p className="mt-1 text-[10px] text-gray-500 font-semibold line-clamp-1 italic px-2">
                                            {shop.description || 'Visit our store for amazing products'}
                                        </p>

                                        <div className="mt-2 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
                                            <div className="flex items-center text-accent">
                                                <Navigation className="h-2.5 w-2.5 mr-1" />
                                                {distance ? `${distance.toFixed(1)} km` : 'Near you'}
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <div className="flex items-center text-orange-500">
                                                <span className="mr-1">🕒</span>
                                                {shop.opening_hours || 'Open Now'}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4 w-full">
                                            <button
                                                onClick={() => router.push(routes.shop(shop.slug))}
                                                className="flex-1 bg-accent text-white text-[10px] font-black uppercase py-2.5 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95"
                                            >
                                                Visit Store
                                            </button>

                                            {shop?.settings?.contact && (
                                                <a
                                                    href={`tel:${shop.settings.contact}`}
                                                    className="shrink-0 h-10 w-10 bg-[#e0f7f3] text-[#00c59a] rounded-xl flex items-center justify-center hover:bg-[#d0f0e9] transition-all"
                                                >
                                                    <Phone className="h-4.5 w-4.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default ShopMap;
