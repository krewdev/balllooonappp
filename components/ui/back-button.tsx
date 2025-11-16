"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import React from "react"

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined") {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push(fallback)
      }
    } else {
      router.push(fallback)
    }
  }

  return (
    <Button variant="ghost" onClick={handleBack}>
      ← Back
    </Button>
  )
}
