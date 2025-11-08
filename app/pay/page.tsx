"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function PayRedirectContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const bookingId = params.get("bookingId")
    if (!bookingId) {
      setError("Missing bookingId")
      return
    }
    ;(async () => {
      try {
        const res = await fetch("/api/bookings/pay/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          setError(data.error || "Failed to start payment")
          return
        }
        if (data.url) {
          window.location.href = data.url
        } else {
          // Fallback to status page if already paid
          router.replace(`/success`)
        }
      } catch (e: any) {
        setError(e?.message || "Unexpected error")
      }
    })()
  }, [params, router])

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Redirecting to payment…</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-muted-foreground">Please wait while we start your secure checkout.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PayRedirectPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PayRedirectContent />
    </Suspense>
  )
}
