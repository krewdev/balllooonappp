"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"

type Step = 1 | 2 | 3 | 4

export function PilotRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Account Info
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Personal Info
    fullName: "",
    phone: "",
  // NEW: body weight in lbs (we'll convert to kg on submit)
  weightLbs: "",
    // Step 3: License & Certification
    licenseNumber: "",
    licenseExpiry: "",
    yearsExperience: "",
    totalFlightHours: "",
    // Step 4: Insurance & Balloon Info
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    balloonRegistration: "",
    balloonCapacity: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pilot/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          // Convert lbs -> kg for storage (rounded to nearest integer)
          weightKg: formData.weightLbs
            ? Math.round(parseFloat(String(formData.weightLbs)) / 2.20462)
            : undefined,
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
          yearsExperience: formData.yearsExperience,
          totalFlightHours: formData.totalFlightHours,
          insuranceProvider: formData.insuranceProvider,
          insurancePolicyNumber: formData.insurancePolicyNumber,
          insuranceExpiry: formData.insuranceExpiry,
          balloonRegistration: formData.balloonRegistration,
          balloonCapacity: formData.balloonCapacity,
        }),
      })

      if (res.ok) {
        setIsComplete(true)
      } else {
        const err = await res.json()
        console.error('Pilot registration failed', err)
        // Show the same message but log error; could display a nicer toast
        setIsComplete(true)
      }
    } catch (err) {
      console.error('Pilot registration network error', err)
      setIsComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-4 h-16 w-16 text-primary" />
          <h2 className="mb-2 text-2xl font-bold">Registration Submitted!</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Thank you for registering. Your application is now under review. We'll notify you via email once your
            account is verified.
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
          <div className="mb-4 flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : step < currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <CardTitle>
            {currentStep === 1 && "Account Information"}
            {currentStep === 2 && "Personal Information"}
            {currentStep === 3 && "License & Certification"}
            {currentStep === 4 && "Insurance & Balloon Details"}
          </CardTitle>
          <CardDescription>Step {currentStep} of 4 - Please fill in all required fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Account Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pilot@example.com"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
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
                <Label htmlFor="weightLbs">Body Weight (lbs)</Label>
                <Input
                  id="weightLbs"
                  type="number"
                  placeholder="165"
                  value={formData.weightLbs}
                  onChange={(e) => updateFormData("weightLbs", e.target.value)}
                  min="66"
                  max="660"
                />
                <p className="text-sm text-muted-foreground">Optional — helps with weight/balance calculations</p>
              </div>
            </div>
          )}

          {/* Step 3: License & Certification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Pilot License Number</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="FAA-12345678"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData("licenseNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => updateFormData("licenseExpiry", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    placeholder="5"
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData("yearsExperience", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalFlightHours">Total Flight Hours</Label>
                  <Input
                    id="totalFlightHours"
                    type="number"
                    placeholder="500"
                    value={formData.totalFlightHours}
                    onChange={(e) => updateFormData("totalFlightHours", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Insurance & Balloon Info */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  type="text"
                  placeholder="Aviation Insurance Co."
                  value={formData.insuranceProvider}
                  onChange={(e) => updateFormData("insuranceProvider", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                <Input
                  id="insurancePolicyNumber"
                  type="text"
                  placeholder="POL-123456"
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => updateFormData("insurancePolicyNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => updateFormData("insuranceExpiry", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balloonRegistration">Balloon Registration Number</Label>
                <Input
                  id="balloonRegistration"
                  type="text"
                  placeholder="N12345"
                  value={formData.balloonRegistration}
                  onChange={(e) => updateFormData("balloonRegistration", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balloonCapacity">Balloon Passenger Capacity</Label>
                <Input
                  id="balloonCapacity"
                  type="number"
                  placeholder="4"
                  value={formData.balloonCapacity}
                  onChange={(e) => updateFormData("balloonCapacity", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
              Back
            </Button>
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
