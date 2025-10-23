import * as React from "react"

export interface SimpleSelectProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
}

export function SimpleSelect({ label, options, value, onChange, id, required }: SimpleSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
