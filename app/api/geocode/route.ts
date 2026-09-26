import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          // Nominatim requires a User-Agent header to prevent blocking
          "User-Agent": "RealEstateApp/1.0",
        },
      }
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 })
  }
}