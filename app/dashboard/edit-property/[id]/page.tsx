"use client"

import { useState, useEffect } from "react"
import LocationPicker from "@/app/components/LocationPicker"
import { useRouter, useParams } from "next/navigation"
import { ref, get, update } from "firebase/database"
import { useAuth } from "@/app/lib/AuthContext"
import { db } from "@/app/lib/firebase"

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    type: "apartment",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    location: "",
    description: "",
    lat: null as number | null,
    lng: null as number | null,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Location suggestions states
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch initial property data from Firebase
  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId) return
      try {
        const propertyRef = ref(db, `properties/${propertyId}`)
        const snapshot = await get(propertyRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          
          // Populate form fields
          setFormData({
            title: data.title || "",
            type: data.type || "apartment",
            price: data.price ? String(data.price) : "",
            size: data.size ? String(data.size) : "",
            bedrooms: data.bedrooms ? String(data.bedrooms) : "",
            bathrooms: data.bathrooms ? String(data.bathrooms) : "",
            location: data.location || "",
            description: data.description || "",
            lat: data.lat ?? null,
            lng: data.lng ?? null,
          })

          if (data.images && Array.isArray(data.images)) {
            setExistingImageUrls(data.images)
          }
        } else {
          setError("Property not found.")
        }
      } catch (err) {
        console.error("Error fetching property:", err)
        setError("Failed to load property details.")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === "location") {
      fetchLocationSuggestions(value)
    }
  }

  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setSuggestions(data)
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err)
    }
  }

  const handleSelectSuggestion = (item: any) => {
    setFormData({
      ...formData,
      location: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    })
    setSuggestions([])
    setShowSuggestions(false)
  }

  const validateStep = () => {
    setError("")

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setError("Property title is required.")
        return false
      }
      if (!formData.price) {
        setError("Annual rent is required.")
        return false
      }
      if (!formData.size) {
        setError("Property size is required.")
        return false
      }
    }

    if (currentStep === 2) {
      if (existingImageUrls.length === 0 && newImages.length === 0) {
        setError("Please keep or upload at least one property image.")
        return false
      }
    }

    if (currentStep === 3) {
      if (!formData.bedrooms) {
        setError("Number of bedrooms is required.")
        return false
      }
      if (!formData.bathrooms) {
        setError("Number of bathrooms is required.")
        return false
      }
      if (!formData.description.trim()) {
        setError("Property description is required.")
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setError("")
    setSaving(true)

    try {
      if (!user) {
        setError("You must be logged in")
        return
      }

      // Upload any new images to Cloudinary alongside existing ones
      const newlyUploadedUrls: string[] = []
      for (const image of newImages) {
        const uploadData = new FormData()
        uploadData.append("file", image)
        uploadData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: uploadData }
        )

        if (!response.ok) throw new Error("Failed to upload new image")
        const data = await response.json()
        newlyUploadedUrls.push(data.secure_url)
      }

      const combinedImages = [...existingImageUrls, ...newlyUploadedUrls]

      const propertyRef = ref(db, `properties/${propertyId}`)
      await update(propertyRef, {
        ...formData,
        images: combinedImages,
        updatedAt: new Date().toISOString(),
        price: Number(formData.price),
        size: Number(formData.size),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      })

      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      console.log(err)
      setError("Failed to update property. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading property data...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-500 text-sm mt-1">Step {currentStep} of 4</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {["Basic Info", "Location", "Details", "Review"].map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-sm font-medium ${
                  index + 1 <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    index + 1 <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index + 1 < currentStep ? "✓" : index + 1}
                </div>
                <span className="hidden md:block">{step}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            ✅ Property updated successfully! Redirecting...
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* STEP 1 — Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all bg-white"
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="office">Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Rent (AED)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (sqft)</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Location & Images */}
          {currentStep === 2 && (
            <div className="space-y-6 relative">
              <h2 className="text-lg font-bold text-gray-900">Location & Media</h2>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location / Community
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  autoComplete="off"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none"
                      >
                        📍 {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property Location on Map
                </label>
                <LocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  searchQuery={formData.location}
                  onLocationSelect={(lat, lng) => {
                    setFormData({ ...formData, lat, lng })
                  }}
                />
              </div>

              {/* Image Management */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {existingImageUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="Property" className="w-20 h-20 object-cover rounded-xl border" />
                      <button
                        type="button"
                        onClick={() => setExistingImageUrls(existingImageUrls.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {existingImageUrls.length === 0 && (
                    <p className="text-xs text-gray-400">No existing images left.</p>
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Additional Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setNewImages(Array.from(e.target.files))
                      setError("")
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Review Changes</h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                {[
                  { label: "Title", value: formData.title },
                  { label: "Type", value: formData.type },
                  { label: "Price", value: formData.price ? `AED ${Number(formData.price).toLocaleString()}/year` : "" },
                  { label: "Size", value: formData.size ? `${formData.size} sqft` : "" },
                  { label: "Location", value: formData.location },
                  { label: "Bedrooms", value: formData.bedrooms },
                  { label: "Bathrooms", value: formData.bathrooms },
                  { label: "Description", value: formData.description },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <span className="text-sm font-medium text-gray-500 w-24 shrink-0">{item.label}</span>
                    <span className="text-sm text-gray-900">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {saving ? "Saving Changes..." : "Update Property ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}