"use client"

// import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

// ref — points to location in Firebase
// onValue — listens for real time changes
// remove — deletes data from Firebase
import { ref, onValue, remove } from "firebase/database"
import { useAuth } from "../lib/AuthContext"
import { db } from "../lib/firebase"
import { Property } from "../types/property"
// import { db } from "@/lib/firebase"
// import { Property } from "@/types/property"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // properties — real data from Firebase
  const [properties, setProperties] = useState<Property[]>([])

  // loading — true while fetching data
  const [loading, setLoading] = useState(true)

  // deletingId — stores ID of property agent wants to delete
  // null means no deletion in progress
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // deleting — true while waiting for Firebase to delete
  const [deleting, setDeleting] = useState(false)

  // Protected route — redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Fetch agent's properties from Firebase
  useEffect(() => {
    if (!user) return

    // point to properties in Firebase
    const propertiesRef = ref(db, "properties")

    // listen for real time changes
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        // convert Firebase object to array
        const allProperties = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as object)
        })) as Property[]

        // filter — only show THIS agent's properties
        // agentId was saved when property was created
        const agentProperties = allProperties.filter(
          (p) => p.agentId === user.uid
        )

        setProperties(agentProperties)
      } else {
        setProperties([])
      }

      setLoading(false)
    })

    // cleanup — stop listening when component unmounts
    return () => unsubscribe()

  }, [user])

  // Delete function
  const handleDelete = async () => {
    // safety check — if no ID stored, do nothing
    if (!deletingId) return

    setDeleting(true)

    try {
      // point to this specific property in Firebase
      // `properties/${deletingId}` = properties/-abc123
      const propertyRef = ref(db, `properties/${deletingId}`)

      // remove() deletes this property completely
      await remove(propertyRef)

      // close confirmation dialog
      setDeletingId(null)

    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back, {user.email}</p>
            </div>
            <Link
              href="/dashboard/add-property"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              + Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Listings", value: properties.length },
            { label: "Active Listings", value: properties.length },
            { label: "Total Views", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">My Listings</h2>
            <span className="text-sm text-gray-500">{properties.length} properties</span>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">

                    {/* Property image thumbnail */}
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {property.images?.[0] ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🏠
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 text-sm">{property.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{property.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">

                    {/* Price */}
                    <p className="text-blue-600 font-semibold text-sm">
                      AED {Number(property.price).toLocaleString()}
                    </p>

                    {/* Type badge */}
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {property.type}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors"
                      >
                        View
                      </Link>

                      {/* Edit — navigates to edit page with property ID */}
                      <Link
                        href={`/dashboard/edit-property/${property.id}`}
                        className="text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors"
                      >
                        Edit
                      </Link>

                      {/* Delete — stores ID and shows confirmation */}
                      <button
                        onClick={() => setDeletingId(property.id!)}
                        className="text-gray-500 hover:text-red-600 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 text-sm mb-6">Add your first property to get started</p>
              <Link
                href="/dashboard/add-property"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
              >
                Add Property
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {/* Only shows when deletingId is not null */}
      {deletingId && (
        // Dark overlay behind dialog
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          {/* Dialog box */}
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Property?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The property will be permanently removed from your listings.
            </p>

            <div className="flex gap-3">

              {/* Cancel — clears deletingId, closes dialog */}
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>

              {/* Confirm delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}