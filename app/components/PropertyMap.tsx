"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface PropertyMapProps {
  lat: number | null
  lng: number | null
  location?: string
  title?: string
}

export default function PropertyMap({ lat, lng, location, title }: PropertyMapProps) {
  const defaultCenter: [number, number] = [24.4539, 54.3773] // Abu Dhabi fallback
  const position: [number, number] = lat !== null && lng !== null ? [lat, lng] : defaultCenter

  return (
    <MapContainer
      center={position}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {lat !== null && lng !== null && (
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>
            <div className="p-1 min-w-[160px]">
              {title && <p className="font-bold text-gray-900 text-sm">{title}</p>}
              <p className="text-gray-600 text-xs mt-1">📍 {location || "Address not specified"}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}