'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface LocationMapProps {
  selectedLatLng: { lat: number; lng: number } | null
  onMapClick?: (lat: number, lng: number) => void
}

export default function LocationMap({ selectedLatLng, onMapClick }: LocationMapProps) {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 z-0">
      <MapContainer
        center={selectedLatLng || { lat: 5.173557250803711, lng: 97.13162647801875 }}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedLatLng && <Marker position={selectedLatLng} />}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>
      {!selectedLatLng && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 pointer-events-none z-[1000]">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center px-4">
            Klik pada peta untuk memilih lokasi outlet
          </p>
        </div>
      )}
    </div>
  )
}
