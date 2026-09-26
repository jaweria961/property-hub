"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface LocationPickerProps {
  lat: number | null
  lng: number | null
  searchQuery?: string
  onLocationSelect: (lat: number, lng: number) => void
}

function MapController({ lat, lng, searchQuery, onLocationSelect }: LocationPickerProps) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) return

    const fetchCoordinates = async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()

        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat)
          const newLng = parseFloat(data[0].lon)
          
          map.flyTo([newLat, newLng], 14)
          onLocationSelect(newLat, newLng)
        }
      } catch (err) {
        console.error("Geocoding error:", err)
      }
    }

    const timeoutId = setTimeout(fetchCoordinates, 800)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, map, onLocationSelect])

  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])

  return null
}

export default function LocationPicker({ lat, lng, searchQuery, onLocationSelect }: LocationPickerProps) {
  const defaultCenter: [number, number] = [24.4539, 54.3773] // Abu Dhabi
  const position: [number, number] = lat !== null && lng !== null ? [lat, lng] : defaultCenter

  return (
    <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          lat={lat} 
          lng={lng} 
          searchQuery={searchQuery} 
          onLocationSelect={onLocationSelect} 
        />

        {lat !== null && lng !== null && (
          <CircleMarker 
            center={[lat, lng]} 
            radius={10} 
            pathOptions={{ 
              color: "#ffffff", 
              weight: 3, 
              fillColor: "#2563eb", 
              fillOpacity: 1 
            }} 
          />
        )}
      </MapContainer>
    </div>
  )
}