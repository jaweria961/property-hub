"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

interface PropertyMapProps {
  lat: number
  lng: number
  title: string
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  useEffect(() => {
    
    const L = require("leaflet")
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    })
  }, [])

  const MapComponent = dynamic(
    () => import("react-leaflet").then((mod) => {
      const { MapContainer, TileLayer, Marker, Popup } = mod
      return function Map() {
        return (
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ height: "450px", width: "100%", borderRadius: "16px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             
            />
            <Marker position={[lat, lng]}>
              <Popup>{title}</Popup>
            </Marker>
          </MapContainer>
        )
      }
    }),
    { ssr: false }
  )

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css"
      />
      <MapComponent />
    </>
  )
}