"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../lib/AuthContext"


export default function LoginPage() {

  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  
  const [loading, setLoading] = useState(false)

  // Get the login function from our AuthContext
  const { login } = useAuth()

  // useRouter gives us the ability to redirect after successful login
  const router = useRouter()
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");
    setLoading(true);
    try {
       await login(email, password);
       router.push("/dashboard");

    }catch (error:any){ 
    switch (error.code){
      case "auth/user-not-found":
      setError("This email is not found, Please register first");
      break;
       case "auth/wrong-password":
      setError("Incorrect Password");
      break;
       case "auth/invalid-email":
       setError("Please enter a valid email address.");
      break;
      default:
        setError("Login failed. Please try again");
    }
    console.log(error);
    } finally{

      setLoading(false);
    }

 }


  return (
   
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

    
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Error message — only shows if error state is not empty */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* onSubmit — calls handleSubmit when form is submitted */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
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
                placeholder="abc@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

           
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* Forgot password link — placeholder for now */}
                <Link href="#" className="text-xs text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
            
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
            
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}