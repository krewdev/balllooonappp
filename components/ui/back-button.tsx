"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import React from "react"

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter()

  return (
    <Button variant="ghost" onClick={() => (typeof window !== "undefined" ? router.back() : router.push(fallback))}>
      ← Back
    </Button>
  )
}
