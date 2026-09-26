"use client"

import { useState, useEffect } from "react"
import LocationPicker from "@/app/components/LocationPicker"
import { useRouter } from "next/navigation"
import { ref, push } from "firebase/database"
import { useAuth } from "@/app/lib/AuthContext"
import { db } from "@/app/lib/firebase"

import { GoogleGenerativeAI } from "@google/generative-ai"

const initialFormData = {
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
}

export default function AddPropertyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

const [generating, setGenerating] = useState(false)
 
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

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
const generateDescription = async () => {
  if (!formData.type || !formData.location) {
    setError("Please fill in at least property type and location first.");
    return;
  }

  setGenerating(true);
  setError("");

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
    });

    const prompt = `
      Write a professional real estate property description for a listing in UAE.

      Property Details:
      - Title: ${formData.title || "Property"}
      - Type: ${formData.type}
      - Location: ${formData.location}
      - Price: AED ${
        formData.price
          ? Number(formData.price).toLocaleString()
          : "Price on request"
      }/year
      - Bedrooms: ${formData.bedrooms || "Not specified"}
      - Bathrooms: ${formData.bathrooms || "Not specified"}
      - Size: ${formData.size ? `${formData.size} sqft` : "Not specified"}

      Instructions:
      - Write 2-3 engaging paragraphs
      - Highlight key features and benefits
      - Mention the UAE/Abu Dhabi lifestyle
      - Professional and appealing tone
      - Do not include price in the description
      - Maximum 150 words
    `;

    const maxRetries = 4;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);

        const text = result.response.text();

        setFormData((prev) => ({
          ...prev,
          description: text,
        }));

        return;
      } catch (error: any) {
        console.error(`Gemini attempt ${attempt + 1} failed:`, error);

        const status = error?.status;

        // Retry temporary overload/rate-limit errors
        if (status === 503 || status === 429) {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;

            await new Promise((resolve) =>
              setTimeout(resolve, delay)
            );

            continue;
          }
        }

        throw error;
      }
    }
  } catch (err) {
    console.error("Gemini error:", err);

    setError(
      "AI is temporarily busy. Please try again in a few seconds."
    );
  } finally {
    setGenerating(false);
  }
};

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
  // 👇 Handle picking a suggestion from the dropdown
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

  // 👇 Require at least one image in Step 2
  if (currentStep === 2) {
    if (images.length === 0) {
      setError("Please upload at least one property image.")
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
    setLoading(true)

    try {
      if (!user) {
        setError("You must be logged in")
        return
      }

      const imageUrls: string[] = []
      for (const image of images) {
        const uploadData = new FormData()
        uploadData.append("file", image)
        uploadData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: uploadData }
        )

        if (!response.ok) throw new Error("Failed to upload image")
        const data = await response.json()
        imageUrls.push(data.secure_url)
      }

      const propertiesRef = ref(db, "properties")
      await push(propertiesRef, {
        ...formData,
        images: imageUrls,
        agentId: user.uid,
        agentEmail: user.email,
        createdAt: new Date().toISOString(),
        price: Number(formData.price),
        size: Number(formData.size),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      })

      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      console.log(err)
      setError("Failed to save property. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
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
            ✅ Property listed successfully! Redirecting...
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
                  placeholder="e.g. Modern 2BR Apartment in Downtown Abu Dhabi"
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
                  placeholder="e.g. 85000"
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
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {currentStep === 2 && (
            <div className="space-y-6 relative">
              <h2 className="text-lg font-bold text-gray-900">Location</h2>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location / Community
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Downtown Abu Dhabi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                  autoComplete="off"
                />

                {/* 👇 Suggestions Dropdown Box */}
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

              {/* MAP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property Location
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select a suggestion above or click directly on the map.
                </p>

              <LocationPicker
  lat={formData.lat}
  lng={formData.lng}
  searchQuery={formData.location} 
  onLocationSelect={(lat, lng) => {
    setFormData({
      ...formData,
      lat,
      lng,
    })
  }}
/>

                {formData.lat !== null && formData.lng !== null && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-700">📍 Location selected</p>
                    <p className="text-xs text-green-600 mt-1">Latitude: {formData.lat.toFixed(6)}</p>
                    <p className="text-xs text-green-600">Longitude: {formData.lng.toFixed(6)}</p>
                  </div>
                )}
              </div>
              {/* Property Images Upload */}
<div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Property Images (At least 1 required)
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
      if (e.target.files) {
        setImages(Array.from(e.target.files))
        setError("") // clear error if they select files
      }
    }}
    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
  />

  {/* Preview selected images */}
  {images.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((img, idx) => (
        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-200">
          📷 {img.name}
        </span>
      ))}
    </div>
  )}
</div>
            </div>
          )}

          {/* STEP 3 — Details */}
        {/* STEP 3 — Details */}
{currentStep === 3 && (
  <div className="space-y-6">
    <h2 className="text-lg font-bold text-gray-900">Property Details</h2>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bedrooms
        </label>
        <input
          type="number"
          name="bedrooms"
          value={formData.bedrooms}
          onChange={handleChange}
          placeholder="e.g. 2"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bathrooms
        </label>
        <input
          type="number"
          name="bathrooms"
          value={formData.bathrooms}
          onChange={handleChange}
          placeholder="e.g. 2"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
        />
      </div>
    </div>

    {/* Description with AI button */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>

        {/* AI Generate button */}
        <button
          type="button"
          onClick={generateDescription}
          disabled={generating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          {generating ? (
            <>
              {/* Loading spinner */}
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              ✨ Generate with AI
            </>
          )}
        </button>
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={5}
        placeholder="Write a description or click 'Generate with AI' to create one automatically..."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all resize-none"
      />

      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-1">
        💡 Fill in title, type, location and price first for better AI results
      </p>
    </div>
  </div>
)}
          {/* STEP 4 — Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Review Your Listing</h2>
              <p className="text-gray-500 text-sm">Please review before submitting.</p>

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
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {loading ? "Saving..." : "List Property ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}