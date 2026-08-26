"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../lib/AuthContext"

export default function RegisterPage() {

  // Four pieces of state for the form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("buyer")
  
  // Error and loading states
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Get signup function from AuthContext
  const { signup } = useAuth()
  const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")

  if (password.length < 6) {
    setError("Password must be at least 6 characters.")
    return
  }

  setLoading(true)

  try {
    // Send name also
    await signup(name, email, password)

    if (role === "agent") {
      router.push("/dashboard")
    } else {
      router.push("/properties")
    }

  } catch (error: any) {
    switch (error.code) {
      case "auth/email-already-in-use":
        setError("An account with this email already exists.")
        break

      case "auth/invalid-email":
        setError("Please enter a valid email address.")
        break

      case "auth/weak-password":
        setError("Password must be stronger.")
        break

      default:
        setError("Registration failed. Please try again.")
    }

    console.log(error)

  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo and heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Property<span className="text-blue-600">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm">Join thousands of property seekers across UAE</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Buyer option */}
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    role === "buyer"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  🏠 Property Buyer
                </button>

                {/* Agent option */}
                <button
                  type="button"
                  onClick={() => setRole("agent")}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    role === "agent"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  🏢 Property Agent
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}