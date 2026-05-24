import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '@/types';

const createShopIcon = (name: string) => L.divIcon({
    html: `
        <div class="relative flex flex-col items-center">
            <div class="relative flex items-center justify-center">
                <div class="h-8 w-8 bg-accent rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 17.996 20.442" fill="currentColor">
                        <g transform="translate(-30.619 0.236)">
                            <path d="M48.187,7.823,39.851.182A.7.7,0,0,0,38.9.2L31.03,7.841a.7.7,0,0,0-.211.5V19.311a.694.694,0,0,0,.694.694H37.3A.694.694,0,0,0,38,19.311V14.217h3.242v5.095a.694.694,0,0,0,.694.694h5.789a.694.694,0,0,0,.694-.694V8.335a.7.7,0,0,0-.228-.512ZM47.023,18.617h-4.4V13.522a.694.694,0,0,0-.694-.694H37.3a.694.694,0,0,0-.694.694v5.095H32.2V8.63l7.192-6.98L47.02,8.642v9.975Z" />
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const SingleShopMap: React.FC<{ shop: Shop }> = ({ shop }) => {
    const lat = Number(shop?.settings?.location?.lat);
    const lng = Number(shop?.settings?.location?.lng);

    if (!lat || !lng) return null;

    return (
        <div className="h-64 w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm md:h-80 lg:h-96">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={createShopIcon(shop.name)}>
                    <Popup>
                        <div className="p-1 min-w-[150px]">
                            <div className="text-center font-bold text-heading mb-1">{shop.name}</div>
                            <div className="text-xs text-body text-center mb-3">
                                {(shop?.address as any)?.address || (shop?.address as any)?.title}
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-full bg-accent text-light py-2 px-3 rounded text-xs font-bold hover:bg-accent-hover transition-colors"
                            >
                                Itinéraire
                            </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default SingleShopMap;
