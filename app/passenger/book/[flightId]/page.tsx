"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { params: { flightId: string } }

export default function BookingPage({ params }: Props) {
  const { flightId } = params
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [flight, setFlight] = React.useState<any | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/flight/${flightId}`)
        if (!res.ok) return
        const j = await res.json()
        if (mounted) setFlight(j)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [flightId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Create or register passenger and attach to pilot via selectedHost
      const pilotId = flight?.pilotId
      const payload: any = { email, fullName }
      if (pilotId) payload.selectedHost = `pilot:${pilotId}`
      else payload.selectedHost = null

      const res = await fetch('/api/passenger/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.ok) {
        setMessage('Booking saved — check your email for details (dev).')
        // redirect to passenger dashboard
        router.push('/passenger/dashboard')
      } else {
        setMessage('Failed to book — please try again.')
      }
    } catch (err) {
      setMessage('Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Book Flight</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
        </div>

        <div>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Booking…' : 'Book'}</button>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
