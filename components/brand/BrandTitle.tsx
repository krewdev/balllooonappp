"use client"

import React from "react"

// Simple brand logo component — uses public/logo1.png
export function BrandTitle() {
  return (
    <div className="flex flex-col items-center">
      <img
        src="/logo1.png"
        alt="Flying Hot Air"
        className="brand-image mb-6 h-40 w-auto md:h-56 lg:h-64"
      />
    </div>
  )
}
