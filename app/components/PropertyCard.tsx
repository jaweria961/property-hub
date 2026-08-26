import Link from "next/link"
import Image from "next/image"
import { Property } from "../types/property"


interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
debugger;
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">

        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
          
          src={property.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-sm">
              {property.type}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5">

          {/* Price */}
          <div className="text-blue-600 font-bold text-xl mb-2">
            AED {property.price.toLocaleString()}
            <span className="text-gray-400 text-sm font-normal">/year</span>
          </div>

          {/* Title */}
          <h3 className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2 leading-snug">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-gray-400 text-xs mb-4 flex items-center gap-1">
            <span>📍</span>
            {property.location}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                🛏 {property.bedrooms} Beds
              </span>
            )}
            <span className="flex items-center gap-1">
              🚿 {property.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1">
              📐 {property.size.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}