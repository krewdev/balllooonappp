"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export function MeisterRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTier, setSelectedTier] = useState<"basic" | "premium" | "vip">("basic")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    organizationName: "",
    contactName: "",
    phone: "",
    festivalName: "",
    festivalLocation: "",
    festivalDate: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create checkout session for Meister payment
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "meister",
          tier: selectedTier,
          userId: "meister-123", // TODO: Get from auth session
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("[v0] Meister registration error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tiers = [
    {
      id: "basic",
      name: "Basic Package",
      price: 499,
      features: [
        "Access to verified pilot network",
        "Basic event coordination",
        "Email support",
        "Standard pilot matching",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      price: 999,
      features: [
        "Everything in Basic",
        "Priority pilot matching",
        "Dedicated event coordinator",
        "Phone & email support",
        "Custom scheduling tools",
        "Event promotion on platform",
      ],
    },
    {
      id: "vip",
      name: "VIP Package",
      price: 1999,
      features: [
        "Everything in Premium",
        "White-glove service",
        "24/7 priority support",
        "Custom branding options",
        "Advanced analytics",
        "On-site coordinator available",
        "Exclusive pilot network access",
      ],
    },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {/* Account & Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account & Organization Information</CardTitle>
            <CardDescription>Tell us about your organization and festival</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="organizer@festival.com"
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Festival Productions Inc."
                  value={formData.organizationName}
                  onChange={(e) => updateFormData("organizationName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  type="text"
                  placeholder="John Smith"
                  value={formData.contactName}
                  onChange={(e) => updateFormData("contactName", e.target.value)}
                  required
                />
              </div>
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
          </CardContent>
        </Card>

        {/* Festival Details */}
        <Card>
          <CardHeader>
            <CardTitle>Festival Details</CardTitle>
            <CardDescription>Information about your upcoming festival</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="festivalName">Festival Name</Label>
              <Input
                id="festivalName"
                type="text"
                placeholder="Annual Hot Air Balloon Festival"
                value={formData.festivalName}
                onChange={(e) => updateFormData("festivalName", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="festivalLocation">Festival Location</Label>
                <Input
                  id="festivalLocation"
                  type="text"
                  placeholder="Albuquerque, NM"
                  value={formData.festivalLocation}
                  onChange={(e) => updateFormData("festivalLocation", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="festivalDate">Festival Date</Label>
                <Input
                  id="festivalDate"
                  type="date"
                  value={formData.festivalDate}
                  onChange={(e) => updateFormData("festivalDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Tier Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Service Package</CardTitle>
            <CardDescription>Choose the package that best fits your festival needs</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTier} onValueChange={(value) => setSelectedTier(value as any)}>
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`cursor-pointer transition-all ${
                      selectedTier === tier.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTier(tier.id as any)}
                  >
                    <CardContent className="flex items-start gap-4 p-6">
                      <RadioGroupItem value={tier.id} id={tier.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <Label htmlFor={tier.id} className="cursor-pointer text-lg font-semibold">
                            {tier.name}
                          </Label>
                          <span className="text-2xl font-bold">${tier.price}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {tier.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Proceed to Payment ($${tiers.find((t) => t.id === selectedTier)?.price})`
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
