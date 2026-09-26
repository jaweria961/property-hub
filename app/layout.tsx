import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./lib/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"


const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Find Your Perfect Property in UAE",
  description: "Browse apartments, villas and offices across Abu Dhabi and Dubai",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}