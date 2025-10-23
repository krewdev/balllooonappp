"use client"

import React from 'react'

export function DownloadQR({ pilotId }: { pilotId: string }) {
  const base = `/api/pilot/qr/${encodeURIComponent(pilotId)}`

  return (
    <div className="flex flex-col items-center gap-3">
      <img src={`${base}`} alt="Pilot QR" className="h-48 w-48" />
      <div className="flex gap-2">
        <a href={`${base}?format=svg`} className="btn" download>
          Download SVG
        </a>
        <a href={`${base}?format=png`} className="btn">
          Download PNG
        </a>
      </div>
    </div>
  )
}
