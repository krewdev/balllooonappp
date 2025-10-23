"use client"

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Pilot = { id: string; email: string; fullName?: string; phone?: string; createdAt: string }

export default function PilotApprovalsPage() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pilots/pending')
      const data = await res.json()
      setPilots(data || [])
    } catch (err) {
      console.error('Failed to load pending pilots', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const approve = async (id: string) => {
    try {
      const res = await fetch('/api/admin/pilots/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setPilots((prev) => prev.filter((p) => p.id !== id))
      } else {
        console.error('Approve failed')
      }
    } catch (err) {
      console.error('Approve error', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Pilot Approvals</h1>
      <p className="mb-6 text-muted-foreground">Approve new pilot accounts so they can access the pilot dashboard.</p>

      <div className="space-y-4">
        {loading && <div>Loading…</div>}
        {!loading && pilots.length === 0 && <div>No pending pilots found.</div>}

        {pilots.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.fullName || p.email}</span>
                <Badge>Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{p.email}</div>
                <div className="text-xs text-muted-foreground">Registered {new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <Button onClick={() => approve(p.id)}>Approve</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
