"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Flight } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, AlertCircle, Eye, Edit } from 'lucide-react'

export default function PilotFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/pilot/flights')
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Access denied. You must be signed in as a pilot to view flights.')
          }
          throw new Error('Failed to fetch flights.')
        }
        const data = await res.json()
        setFlights(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlights()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Flights</h1>
        <Button asChild>
          <Link href="/pilot/flights/new">Create New Flight</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border p-12">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Loading your flights...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive p-12 text-destructive">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p>{error}</p>
        </div>
      ) : flights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <h3 className="text-xl font-semibold">No flights scheduled yet.</h3>
            <p className="text-muted-foreground mt-2 mb-6">Ready to take to the skies?</p>
            <Button asChild>
              <Link href="/pilot/flights/new">Create Your First Flight</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flights.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle className="truncate">{f.title}</CardTitle>
                <CardDescription>{new Date(f.date).toLocaleDateString()} • {f.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-lg">
                    ${(f.priceCents / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {f.maxPassengers} passengers
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/pilot/flights/${f.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild className="w-full">
                    <Link href={`/pilot/flights/${f.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
