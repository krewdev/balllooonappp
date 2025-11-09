"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pilot {
  id: string;
  fullName: string;
}

export function PassengerRegistrationForm({
  pilotId: initialPilotId,
}: {
  pilotId?: string;
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pilots, setPilots] = useState<Pilot[]>([])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    weightLbs: "",
    phone: "",
    zipCode: "",
    pilotId: initialPilotId || "",
  })

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        const response = await fetch("/api/pilots/list")
        if (!response.ok) throw new Error("Failed to fetch pilots")
        const data = await response.json()
        setPilots(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchPilots()
  }, [])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePilotChange = (pilotId: string) => {
    updateFormData("pilotId", pilotId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/passenger/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred");
      }

      setIsComplete(true);
      // Redirect to consent page after a short delay
      setTimeout(() => {
        router.push(`/passenger/consent?passengerId=${data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center text-card-foreground shadow-sm">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h3 className="text-2xl font-bold">Registration Successful!</h3>
        <p className="mt-2 text-muted-foreground">
          You will be redirected to the SMS consent page shortly.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Join us to start booking your next adventure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pilot">Preferred Pilot</Label>
            <Select onValueChange={handlePilotChange} value={formData.pilotId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pilot..." />
              </SelectTrigger>
              <SelectContent>
                {pilots.map((pilot) => (
                  <SelectItem key={pilot.id} value={pilot.id}>
                    {pilot.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => updateFormData("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 555-5555"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weightLbs">Weight (lbs)</Label>
              <Input
                id="weightLbs"
                type="number"
                placeholder="165"
                value={formData.weightLbs}
                onChange={(e) => updateFormData("weightLbs", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="94102"
                maxLength={5}
                pattern="[0-9]{5}"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

