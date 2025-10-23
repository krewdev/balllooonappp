import * as React from "react"

export interface QrScannerProps {
  onScan: (data: string) => void
}

// Placeholder for a real QR scanner. Replace with a real library for production.
export function QrScanner({ onScan }: QrScannerProps) {
  const [value, setValue] = React.useState("")

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Scan QR Code (dev mock)</label>
      <input
        type="text"
        placeholder="Paste QR code value here"
        value={value}
        onChange={e => {
          setValue(e.target.value)
          onScan(e.target.value)
        }}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
      />
      <p className="text-xs text-muted-foreground">(In production, use a camera-based QR scanner)</p>
    </div>
  )
}
