"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ref, onValue } from "firebase/database"
import PropertyCard from "../components/PropertyCard"
import { Property } from "../types/property"
import { db } from "../lib/firebase"

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const urlType = searchParams.get("type") // e.g., "apartment", "villa", "office"

  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState("newest")

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Sync state if the user clicks a different navbar link while already on the page
  useEffect(() => {
    if (urlType) {
      setType(urlType.toLowerCase())
    } else {
      setType("all")
    }
  }, [urlType])

  // Fetch real-time data from Firebase
  useEffect(() => {
    const propertiesRef = ref(db, "properties")

    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        const propertiesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as object),
        })) as Property[]
        setProperties(propertiesArray)
      } else {
        setProperties([])
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter and sort logic
  const filtered = properties.filter((p: Property) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
    const matchType = type === "all" || p.type?.toLowerCase() === type.toLowerCase()
    const matchMin = minPrice === "" || p.price >= Number(minPrice)
    const matchMax = maxPrice === "" || p.price <= Number(maxPrice)
    return matchSearch && matchType && matchMin && matchMax
  }).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price
    if (sort === "price-high") return b.price - a.price
    return 0
  })

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {type === "all" ? "Properties in UAE" : `${type}s in UAE`}
          </h1>
          <p className="text-gray-500">
            {loading ? "Loading..." : `${filtered.length} properties found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* FILTER SIDEBAR (Kept Intact) */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6">Filters</h3>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Location or property name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Property Type
                </label>
                <div className="flex flex-col gap-2">
                  {["all", "apartment", "villa", "office"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium text-left capitalize transition-all ${
                        type === t
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {t === "all" ? "All Types" : t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Price Range (AED/year)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSearch("")
                  setType("all")
                  setMinPrice("")
                  setMaxPrice("")
                  setSort("newest")
                }}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* PROPERTY GRID */}
          <div className="flex-1">

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filtered.length}</span> properties
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-52 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500 text-sm">There are no properties matching this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}