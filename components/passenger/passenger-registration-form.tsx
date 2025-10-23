"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Loader2, CheckCircle2, MapPin } from "lucide-react"

export function PassengerRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    // optional body weight in kg
    weightKg: "",
    emailNotifications: true,
    smsNotifications: true,
    location: "",
    maxDistance: "50",
    // selection from dropdown: could be pilot:<id> or event:<id>
    selectedHost: "",
  })

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    let mounted = true

    async function loadHosts() {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch('/api/pilot/list'),
          fetch('/api/meister/list'),
        ])

        const pilots = pRes.ok ? await pRes.json() : []
        const meisters = mRes.ok ? await mRes.json() : []

        if (!mounted) return

        const opts = [] as { value: string; label: string }[]

        for (const p of pilots) {
          opts.push({ value: `pilot:${p.id}`, label: `Pilot — ${p.name}` })
        }
        for (const m of meisters) {
          opts.push({ value: `event:${m.id}`, label: `Event — ${m.festival_name}` })
        }

        setOptions(opts)
      } catch (err) {
        console.error('Failed to load hosts', err)
      }
    }

    loadHosts()

    return () => {
      mounted = false
    }
  }, [])

  const handleQrScan = (data: string) => {
    // Expect QR payload like "pilot:<id>" or a JSON string { type: 'pilot', id: '...' }
    if (!data) return

    let pilotId: string | null = null

    if (data.startsWith('pilot:')) {
      pilotId = data.split(':')[1]
    } else {
      try {
        const parsed = JSON.parse(data)
        if (parsed?.type === 'pilot' && parsed?.id) pilotId = parsed.id
      } catch (e) {
        // not json, ignore
      }
    }

    if (pilotId) {
      const value = `pilot:${pilotId}`
      // only set if option exists; otherwise still set so backend can resolve
      setFormData((prev) => ({ ...prev, selectedHost: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    // Submit formData along with selectedHost to backend to associate this passenger with a pilot/event
    try {
      await fetch('/api/passenger/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
    } catch (err) {
      console.error('Registration submit failed', err)
    }

    setIsSubmitting(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-4 h-16 w-16 text-primary" />
          <h2 className="mb-2 text-2xl font-bold">You're All Set!</h2>
          <p className="mb-6 text-center text-muted-foreground">
            We'll notify you via {formData.emailNotifications && "email"}
            {formData.emailNotifications && formData.smsNotifications && " and "}
            {formData.smsNotifications && "SMS"} when pilots are available near you.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Sign up to receive notifications about hot air balloon rides near you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Smith"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Body Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                placeholder="70"
                value={formData.weightKg}
                onChange={(e) => updateFormData("weightKg", e.target.value)}
                min="20"
                max="250"
              />
              <p className="text-sm text-muted-foreground">Optional — helps pilots plan load and safety</p>
            </div>
          </div>

          {/* Location Preferences */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Your Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City, State or ZIP Code"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">We'll use this to find pilots near you</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
              <Input
                id="maxDistance"
                type="number"
                placeholder="50"
                value={formData.maxDistance}
                onChange={(e) => updateFormData("maxDistance", e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">How far are you willing to travel for a balloon ride?</p>
            </div>
          </div>

          {/* Host selection */}
          <div className="space-y-4">
            <Label className="text-base">Connect to a Pilot or Event</Label>
            <SimpleSelect
              label="Select pilot or event"
              options={options}
              value={formData.selectedHost}
              onChange={(v) => updateFormData('selectedHost', v)}
              id="selectedHost"
              required={false}
            />
            <p className="text-sm text-muted-foreground">Choose a pilot or event to associate your account with.</p>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <Label className="text-base">Notification Preferences</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => updateFormData("emailNotifications", checked as boolean)}
                />
                <Label
                  htmlFor="emailNotifications"
                  className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => updateFormData("smsNotifications", checked as boolean)}
                />
                <Label
                  htmlFor="smsNotifications"
                  className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  SMS notifications
                </Label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to be notified when pilots are available
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up for Notifications"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

// --- NEW: helper hook + effects to load pilots/events and handle QR prefill ---

