"use client"

import React from "react"

export function AnimatedBalloons() {
  return (
    <div aria-hidden className="relative h-72 w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 animate-blob opacity-25 bg-gradient-to-tr from-sky-200 via-rose-200 to-amber-200 blur-3xl"></div>

      {/* Left cluster */}
      <div className="absolute left-6 bottom-6 flex flex-col items-center gap-2 animate-floating">
        <svg className="h-28 w-28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="20" fill="#FF7AB6" />
          <rect x="30" y="44" width="4" height="12" fill="#7c3aed" />
        </svg>
        <svg className="h-14 w-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="12" fill="#FFD166" />
          <rect x="30" y="36" width="4" height="8" fill="#F97316" />
        </svg>
      </div>

      {/* Center cluster */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2 flex flex-col items-center gap-4 animate-floating delay-1000">
        <svg className="h-36 w-36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="22" fill="#60A5FA" />
          <rect x="30" y="46" width="4" height="12" fill="#1E3A8A" />
        </svg>
      </div>

      {/* Right cluster */}
      <div className="absolute right-8 top-14 flex flex-col items-center gap-2 animate-floating delay-2000">
        <svg className="h-22 w-22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="16" fill="#A78BFA" />
          <rect x="30" y="40" width="4" height="10" fill="#6D28D9" />
        </svg>
        <svg className="h-10 w-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="8" fill="#FDBA74" />
          <rect x="30" y="32" width="4" height="6" fill="#EA580C" />
        </svg>
      </div>
    </div>
  )
}
