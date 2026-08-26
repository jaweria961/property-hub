"use client"

import Link from "next/link"
import { useState } from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "../lib/AuthContext"
import {

  LogOut,

} from "lucide-react"
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Get user and logout from AuthContext

  const { user, logout } = useAuth()
  console.log(user?.email)
  const router = useRouter()

  // Handle logout click
  const handleLogout = async () => {
    await logout()
    // After logout redirect to homepage
    router.push("/")
  }

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Property<span className="text-blue-600">Hub</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/properties" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Browse
          </Link>
          <Link href="/properties?type=apartment" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Apartments
          </Link>
          <Link href="/properties?type=villa" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Villas
          </Link>
          <Link href="/properties?type=office" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Offices
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Show different buttons based on login state */}
          {user ? (
            // User IS logged in — show email and logout
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            // User is NOT logged in — show sign in and list property
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                List  Property
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition-all"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"}`}>
        <div className="px-6 py-4 flex flex-col gap-1">
          <Link href="/properties" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">Browse</Link>
          <Link href="/properties?type=apartment" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">Apartments</Link>
          <Link href="/properties?type=villa" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">Villas</Link>
          <Link href="/properties?type=office" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">Offices</Link>
          
          <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all"
                >
                    <LogOut size={18} />
           
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-semibold text-center hover:bg-blue-700 transition-all">
                  List Property
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}