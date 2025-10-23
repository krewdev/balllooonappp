"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewFlightPage() {
  const [form, setForm] = useState({ title: '', date: '', location: '', price: '', maxPassengers: '4', description: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/pilot/flights/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-token-pilot-123' },
      body: JSON.stringify({
        title: form.title,
        date: form.date,
        location: form.location,
        priceCents: Math.round(parseFloat(form.price || '0') * 100),
        maxPassengers: parseInt(form.maxPassengers || '4', 10),
        description: form.description,
      }),
    })
    const data = await res.json()
    setLoading(false)
    setResult(data)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Flight</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => update('location', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="maxPassengers">Max Passengers</Label>
              <Input id="maxPassengers" type="number" value={form.maxPassengers} onChange={(e) => update('maxPassengers', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>

            <div>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Flight & Generate Pay Link'}</Button>
            </div>
          </form>

          {result && (
            <div className="mt-4 rounded-md border p-4">
              <h3 className="font-medium">Flight created</h3>
              <p className="text-sm text-muted-foreground">Flight ID: {result.flight?.id}</p>
              {result.payLink && (
                <p className="text-sm mt-2">Payment Link: <a className="text-primary underline" href={result.payLink} target="_blank">Open Pay Link</a></p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
