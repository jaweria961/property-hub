"use client"

import Image from "next/image"
import { useState } from "react"

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
    

  const [isOpen, setIsOpen] = useState(false)

  const [selectedImage, setSelectedImage] = useState(0)

  function openGallery(index: number = 0) {
    debugger;
    setSelectedImage(index)
    setIsOpen(true)
  }

  function closeGallery() {
    setIsOpen(false)
  }

  function nextImage() {
    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    )
  }

  function previousImage() {
    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    )
  }

  return (
    <>
     
      <button
        onClick={() => openGallery(0)}
        className="bg-white/90 text-gray-900 px-5 py-3 rounded-full font-semibold hover:bg-white transition"
      >
        View Gallery
      </button>


      {/* POPUP */}
      {isOpen && (

        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-6 right-8 text-white text-4xl z-50 hover:text-gray-300"
          >
            ×
          </button>


          {/* Previous Button */}
          <button
            onClick={previousImage}
            className="absolute left-6 text-white text-6xl z-50 hover:text-gray-300"
          >
            ‹
          </button>


          {/* Main Popup Image */}
          <div className="relative w-[90vw] h-[80vh]">

            <Image
              src={images[selectedImage]}
              alt={`${title} image ${selectedImage + 1}`}
              fill
              className="object-contain"
            />

          </div>


          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-6 text-white text-6xl z-50 hover:text-gray-300"
          >
            ›
          </button>


          {/* Image Counter */}
          <div className="absolute bottom-6 text-white bg-black/50 px-5 py-2 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>

        </div>

      )}

    </>
  )
}