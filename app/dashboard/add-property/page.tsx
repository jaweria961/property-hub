"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"

// import { 
//   ref as storageRef, 
//   uploadBytes, 
//   getDownloadURL 
// } from "firebase/storage"
// ref — creates a reference to a location in the database
// like saying "I want to work with data at this path"
// push — adds new data with an auto generated unique ID
// like inserting a new row in a table
import { ref, push } from "firebase/database"
import { useAuth } from "@/app/lib/AuthContext"
import { db} from "@/app/lib/firebase"

// db — our database instance from firebase.ts

// useAuth — checks if user is logged in


// This is the shape of our form data
// Every field starts empty
const initialFormData = {
  title: "",
  type: "apartment",
  price: "",
  size: "",
  bedrooms: "",
  bathrooms: "",
  location: "",
  description: "",
}

export default function AddPropertyPage() {

  // currentStep — which step we're on
  // starts at 1
  const [currentStep, setCurrentStep] = useState(1)
const [images, setImages] = useState<File[]>([])
  // formData — holds ALL data across ALL steps
  // starts with empty values from initialFormData
  const [formData, setFormData] = useState(initialFormData)

  // loading — true while saving to Firebase
  // used to disable button and show spinner
  const [loading, setLoading] = useState(false)

  // error — shows error message if something goes wrong
  const [error, setError] = useState("")

  // success — shows success message after saving
  const [success, setSuccess] = useState(false)

  // user — the logged in agent
  const { user } = useAuth()

  // router — for redirecting after submission
  const router = useRouter()

  // ONE function handles ALL input changes
  // e.target.name — which field changed
  // e.target.value — what the user typed
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,           // keep all existing data
      [e.target.name]: e.target.value  // update only the changed field
    })
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
    if (!formData.location.trim()) {
      setError("Property location is required.")
      return false
    }

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
  // Move to next step
const nextStep = () => {

  const valid = validateStep()

  if (!valid) {
    return
  }

  setCurrentStep(currentStep + 1)

}

  // Move to previous step
const prevStep = () => {
  setError("")
  setCurrentStep(currentStep - 1)
}

  // Final submission
const handleSubmit = async () => {
  setError("")
  setLoading(true)

  try {

    if (!user) {
      setError("You must be logged in")
      return
    }

 // Upload images to Cloudinary
const imageUrls: string[] = []

for (const image of images) {
  const uploadData = new FormData()

  uploadData.append("file", image)

  uploadData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  )

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: uploadData,
    }
  )

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary")
  }

  const data = await response.json()

  imageUrls.push(data.secure_url)
}
    // Save property data
    const propertiesRef = ref(db, "properties")

    await push(propertiesRef, {

      ...formData,

      // store image URLs
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

    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)


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
          <p className="text-gray-500 text-sm mt-1">
            Step {currentStep} of 4
          </p>
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
                {/* Circle — shows tick if completed, number if not */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index + 1 < currentStep
                    ? "bg-blue-600 text-white"
                    : index + 1 === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}>
                  {index + 1 < currentStep ? "✓" : index + 1}
                </div>
                <span className="hidden md:block">{step}</span>
              </div>
            ))}
          </div>

          {/* Progress line fills based on current step */}
          {/* (currentStep - 1) / 3 * 100 = percentage */}
          {/* step 1 = 0%, step 2 = 33%, step 3 = 66%, step 4 = 100% */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            ✅ Property listed successfully! Redirecting...
          </div>
        )}

       
        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
 {/* Error message */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title
                </label>
                {/* name="title" must match formData key exactly */}
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern 2BR Apartment in Downtown Abu Dhabi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all"
                required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Rent (AED)
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size (sqft)
                </label>
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
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Location</h2>

              <div>
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
                />
              </div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Property Images
  </label>

  {/* Hidden file input */}
  <input
    id="property-images"
    type="file"
    accept="image/*"
    multiple
    hidden
    onChange={(e) => {
      if (e.target.files) {
        setImages(Array.from(e.target.files))
      }
    }}
  />

  {/* Custom upload button */}
  <label
    htmlFor="property-images"
    className="cursor-pointer inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
  >
    Choose Images
  </label>


  {/* Show selected filenames */}
  {images.length > 0 && (
    <div className="mt-4 space-y-2">

      <p className="text-sm font-medium text-gray-700">
        Selected Images:
      </p>

      {images.map((image, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
        >
          <span className="text-sm text-gray-600 truncate">
            {image.name}
          </span>

          <button
            type="button"
            onClick={() => {
              setImages(
                images.filter((_, i) => i !== index)
              )
            }}
            className="text-red-500 text-xs hover:text-red-700"
          >
            Remove
          </button>

        </div>
      ))}

    </div>
  )}
</div>
            </div>
          )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your property..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Review Your Listing</h2>
              <p className="text-gray-500 text-sm">
                Please review before submitting.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                {[
                  { label: "Title", value: formData.title },
                  { label: "Type", value: formData.type },
                  { label: "Price", value: `AED ${Number(formData.price).toLocaleString()}/year` },
                  { label: "Size", value: `${formData.size} sqft` },
                  { label: "Location", value: formData.location },
                  { label: "Bedrooms", value: formData.bedrooms },
                  { label: "Bathrooms", value: formData.bathrooms },
                  { label: "Description", value: formData.description },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <span className="text-sm font-medium text-gray-500 w-24 shrink-0">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-900">
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">

            {/* Back button — hidden on step 1 */}
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

            {/* Next or Submit */}
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