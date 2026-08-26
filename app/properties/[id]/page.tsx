import Image from "next/image"
import Link from "next/link"
import { ref, get } from "firebase/database"
import { db } from "@/app/lib/firebase"
import PropertyGallery from "@/app/components/PropertyGallery"
import PropertyMap from "@/app/components/PropertyMap"


export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
 
  const { id } = await params

const propertiesRef = ref(db, `properties/${id}`)
const snapshot = await get(propertiesRef)

if (!snapshot.exists()) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">
        Property not found
      </h1>
    </main>
  )
}

const property = snapshot.val()

console.log("Found property:", property)
console.log("Found property images:", property?.images)
  if (!property) {

    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] animate-fade-in">

      {/* Top Navigation Area */}
      <div className="max-w-7xl mx-auto px-6 pt-8">

        <Link
  href="/properties"
  className="
    group
    inline-flex
    items-center
    gap-2
    text-sm
    font-medium
    text-gray-500
    hover:text-blue-600
    transition-all
    duration-300
    animate-fade-up
  "
>
  <span className="transition-transform duration-300 group-hover:-translate-x-1">
    ←
  </span>

  Back to properties
</Link>

      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[520px]">

          {/* Main Image */}
          <div
  className="
    relative
    lg:col-span-2
    h-full
    overflow-hidden
    rounded-[2rem]
    group
    animate-scale-in
    shadow-xl
  "
>

            <Image

          src={
 property?.images?.[2] || property?.images?.[0]  ||

  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
}
    
          
          alt={property.title}
              fill
              priority
              className="
  object-cover
  transition-transform
  duration-1000
  ease-out
  group-hover:scale-110
"
            />

            {/* Dark Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Image Content */}
            <div className="absolute bottom-8 left-8 right-8 text-white">

              <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-sm font-medium capitalize">
                {property.type}
              </span>

              <h1 className="text-3xl md:text-5xl font-bold mt-4 max-w-2xl leading-tight">
                {property.title}
              </h1>

              <p className="mt-3 text-white/80">
                📍 {property.location}
              </p>

            </div>

          </div>

          {/* Side Images */}
          <div className="hidden lg:grid grid-rows-2 gap-4">

            <div className="relative overflow-hidden rounded-[2rem] group">
              <Image
                 src={property?.images?.[2] || property?.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
                alt={property.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="relative overflow-hidden rounded-[2rem] group">
              <Image
           src={property?.images?.[2] || property?.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}

                alt={property.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />

             <div className="absolute inset-0 bg-black/30 flex items-center justify-center">

  <PropertyGallery
  images={property?.images || []}
  title={property.title}
/>


</div>  

            </div>

          </div>

        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* Left Content */}
          <div className="lg:col-span-2">

            {/* Price Header */}
            <div
  className="
    flex
    flex-col
    md:flex-row
    md:items-center
    justify-between
    gap-4
    animate-fade-up
  "
>

              <div>
                <p className="text-sm text-gray-500">
                  Listed for rent
                </p>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-gray-900">
                    AED {property.price.toLocaleString()}
                  </span>

                  <span className="text-gray-500">
                    / year
                  </span>
                </div>
              </div>

              {/* Favorite Button */}
              <button className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 transition text-xl">
                ♡
              </button>

            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">

             <div
  className="
    group
    bg-white
    rounded-2xl
    p-5
    border
    border-gray-100
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-2
    hover:shadow-xl
    hover:border-blue-100
  "
>
                <div className="text-2xl">🛏</div>
                <p className="text-2xl font-bold mt-3">
                  {property.bedrooms}
                </p>
                <p className="text-sm text-gray-500">
                  Bedrooms
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl">🚿</div>
                <p className="text-2xl font-bold mt-3">
                  {property.bathrooms}
                </p>
                <p className="text-sm text-gray-500">
                  Bathrooms
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl">📐</div>
                <p className="text-2xl font-bold mt-3">
                  {property.size.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Sqft
                </p>
              </div>

            </div>

            {/* Description */}
            <section className="mt-10">

              <h2 className="text-2xl font-bold text-gray-900">
                About this property
              </h2>

              <p className="text-gray-600 leading-8 mt-4 text-lg">
                {property.description}
              </p>

            </section>

            {/* Location */}
            {/* Location */}
<section className="mt-12">

  <div className="flex items-center justify-between">

    <div>
      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
        Explore the area
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-1">
        Location
      </h2>
    </div>

    <div className="text-right">
      <p className="text-sm text-gray-500">
        📍 {property.location}
      </p>
{/* 
      <p className="text-xs text-gray-400 mt-1">
        {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
      </p> */}
    </div>

  </div>

  {/* Map Container */}
  <div className="mt-5 h-[450px] w-full overflow-hidden rounded-3xl shadow-lg border border-gray-200">

   <div className="mt-5 h-[200px] w-full overflow-hidden rounded-3xl shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
  <p className="text-gray-500">
    Map location will be available soon.
  </p>
</div>

  </div>

</section>

          </div>

          {/* Agent Card */}
          <aside>

            <div className="sticky top-8">

              <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-7 text-white shadow-xl">

                {/* Decorative Circle */}
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-500/20 blur-2xl" />

                <div className="relative">

                  <p className="text-white/60 text-sm">
                    Listed by
                  </p>

                  <div className="flex items-center gap-4 mt-5">

                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-xl font-bold">
                       {property.agentEmail?.charAt(0).toUpperCase() || "A"}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">
                       {property.agentEmail?.charAt(0).toUpperCase() || "A"}
                      </h3>

                      <p className="text-white/60 text-sm">
                        Property Agent
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-white/10 my-6" />

                  <p className="text-white/60 text-sm">
                    Interested in this property?
                  </p>

                  <div className="space-y-3 mt-5">
{/* 
                    <a
  href={`tel:${property.agentPhone}`}
  className="
    group
    block
    text-center
    bg-white
    text-gray-900
    py-3.5
    rounded-xl
    font-semibold
    transition-all
    duration-300
    hover:bg-blue-50
    hover:-translate-y-1
    hover:shadow-lg
    active:scale-95
  "
>
  📞 Call Agent
</a> */}
{/* 
                  <a
  href={`https://wa.me/${property.agentPhone.replace(/\+/g, "")}`}
  target="_blank"
  rel="noopener noreferrer"
  className="
    block
    text-center
    border
    border-white/20
    py-3.5
    rounded-xl
    font-semibold
    transition-all
    duration-300
    hover:bg-white
    hover:text-gray-900
    hover:-translate-y-1
    active:scale-95
  "
>
  💬 WhatsApp
</a> */}

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  )
}