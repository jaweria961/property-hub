export interface Property {
  id: string
  title: string
  type: "apartment" | "villa" | "office"
  price: number
  size: number
  bedrooms: number
  bathrooms: number
  location: string
  lat: number
  lng: number
  description: string
  images: string[]
  agentId: string
  agentName: string
  agentPhone: string
  createdAt: Date
}

export interface PropertyGalleryProps {
  images: string[]
  title: string
}