import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-white font-bold text-lg">PropertyHub</span>
            </div>
            <p className="text-sm leading-relaxed">
              UAE's fastest growing property platform. Find your perfect home in Abu Dhabi and Dubai.
            </p>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-white font-semibold mb-4">Properties</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties?type=apartment" className="hover:text-white transition-colors">Apartments</Link></li>
              <li><Link href="/properties?type=villa" className="hover:text-white transition-colors">Villas</Link></li>
              <li><Link href="/properties?type=office" className="hover:text-white transition-colors">Offices</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Agents */}
          <div>
            <h4 className="text-white font-semibold mb-4">Agents</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">List Property</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Agent Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-sm text-center">
          © 2026 PropertyHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}