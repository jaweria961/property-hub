import Link from "next/link"
import { PROPERTY_TYPES,SAMPLE_PROPERTIES } from "../data/properties"
import PropertyCard from "./components/PropertyCard"

export default function Home() {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800 border border-blue-700 text-blue-200 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            UAE's Fastest Growing Property Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Find Your Perfect
            <span className="block text-blue-300">Property in UAE</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Browse thousands of apartments, villas, and offices across Abu Dhabi and Dubai. Your dream property is one search away.
          </p>
          <div className="bg-white rounded-2xl p-3 max-w-3xl mx-auto flex flex-col md:flex-row gap-3 shadow-2xl">
            <input
              type="text"
              placeholder="Search by location, community or property name..."
              className="flex-1 px-4 py-3 text-gray-700 text-sm outline-none rounded-xl placeholder-gray-400"
            />
            <select className="px-4 py-3 text-gray-600 text-sm outline-none rounded-xl bg-gray-50 border border-gray-100">
              <option>All Types</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Office</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap">
              Search Properties
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { number: "12,000+", label: "Properties Listed" },
              { number: "8,500+", label: "Happy Tenants" },
              { number: "200+", label: "Verified Agents" },
              { number: "15+", label: "Communities" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-blue-300 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* BROWSE BY TYPE */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Property Type</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Find exactly what you're looking for across our curated property categories</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROPERTY_TYPES.map((item) => (
            <Link key={item.type} href={item.href}>
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.type}</h3>
                <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                <span className="text-blue-600 text-sm font-semibold">{item.count} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
{/* FEATURED PROPERTIES */}
<section className="bg-gray-50 py-20">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between mb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Featured Properties
        </h2>
        <p className="text-gray-500">
          Hand-picked properties across UAE
        </p>
      </div>
      <Link
        href="/properties"
        className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
      >
        View All →
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SAMPLE_PROPERTIES.slice(0, 6).map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  </div>
</section>
      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Find and secure your perfect property in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search Properties", description: "Browse thousands of verified listings across UAE. Filter by location, price, type and more.", icon: "🔍" },
              { step: "02", title: "Connect with Agents", description: "Get in touch directly with verified agents. Schedule viewings at your convenience.", icon: "🤝" },
              { step: "03", title: "Move In", description: "Complete your paperwork online and get the keys to your new home hassle-free.", icon: "🔑" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg shadow-blue-100">
                  {item.icon}
                </div>
                <div className="text-blue-600 text-xs font-bold tracking-widest mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Join 200+ verified agents and reach thousands of potential tenants and buyers across UAE.</p>
          <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-lg inline-block">
            Get Started for Free →
          </Link>
        </div>
      </section>
    </main>
  )
}