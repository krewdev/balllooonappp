"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Loader2, Save, Lock, User, CreditCard, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

type PilotProfile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  weightLbs: number | null
  licenseNumber: string | null
  licenseExpiry: string | null
  yearsExperience: number | null
  totalFlightHours: number | null
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
  insuranceExpiry: string | null
  balloonRegistration: string | null
  balloonCapacity: number | null
}

export default function PilotSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<PilotProfile | null>(null)
  const [formData, setFormData] = useState<Partial<PilotProfile>>({})

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Stripe settings state
  const [stripeStatus, setStripeStatus] = useState<{
    hasAccount: boolean
    onboarded: boolean
    loading: boolean
  }>({ hasAccount: false, onboarded: false, loading: true })
  const [stripeLoading, setStripeLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchStripeStatus()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/pilot/profile", { credentials: "include" })
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/pilot/login")
          return
        }
        throw new Error("Failed to fetch profile")
      }
      const data = await res.json()
      setProfile(data)
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        licenseNumber: data.licenseNumber || "",
        licenseExpiry: data.licenseExpiry ? data.licenseExpiry.split("T")[0] : "",
        yearsExperience: data.yearsExperience || "",
        totalFlightHours: data.totalFlightHours || "",
        insuranceProvider: data.insuranceProvider || "",
        insurancePolicyNumber: data.insurancePolicyNumber || "",
        insuranceExpiry: data.insuranceExpiry ? data.insuranceExpiry.split("T")[0] : "",
        balloonRegistration: data.balloonRegistration || "",
        balloonCapacity: data.balloonCapacity || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch("/api/pilot/stripe/account", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setStripeStatus({
          hasAccount: data.hasAccount || false,
          onboarded: data.onboarded || false,
          loading: false,
        })
      } else {
        setStripeStatus({ hasAccount: false, onboarded: false, loading: false })
      }
    } catch (err) {
      setStripeStatus({ hasAccount: false, onboarded: false, loading: false })
    }
  }

  const handleStripeOnboarding = async () => {
    setStripeLoading(true)
    try {
      const res = await fetch("/api/pilot/stripe/onboarding", {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to create Stripe onboarding link")
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start Stripe onboarding")
    } finally {
      setStripeLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/pilot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      // Update profile with returned data (API returns { pilot, message })
      if (data.pilot) {
        setProfile(data.pilot)
        setFormData({
          fullName: data.pilot.fullName || "",
          phone: data.pilot.phone || "",
          licenseNumber: data.pilot.licenseNumber || "",
          licenseExpiry: data.pilot.licenseExpiry ? data.pilot.licenseExpiry.split("T")[0] : "",
          yearsExperience: data.pilot.yearsExperience || "",
          totalFlightHours: data.pilot.totalFlightHours || "",
          insuranceProvider: data.pilot.insuranceProvider || "",
          insurancePolicyNumber: data.pilot.insurancePolicyNumber || "",
          insuranceExpiry: data.pilot.insuranceExpiry ? data.pilot.insuranceExpiry.split("T")[0] : "",
          balloonRegistration: data.pilot.balloonRegistration || "",
          balloonCapacity: data.pilot.balloonCapacity || "",
        })
      }
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setChangingPassword(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/pilot/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Settings</h1>
        <BackButton />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500 bg-green-50 p-4 text-green-800">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal and professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">License Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber || ""}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">License Expiry</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry || ""}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={formData.yearsExperience || ""}
                      onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value ? parseInt(e.target.value) : "" })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalFlightHours">Total Flight Hours</Label>
                    <Input
                      id="totalFlightHours"
                      type="number"
                      value={formData.totalFlightHours || ""}
                      onChange={(e) => setFormData({ ...formData, totalFlightHours: e.target.value ? parseInt(e.target.value) : "" })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider || ""}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                    <Input
                      id="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber || ""}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry || ""}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Balloon Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="balloonRegistration">Balloon Registration</Label>
                    <Input
                      id="balloonRegistration"
                      value={formData.balloonRegistration || ""}
                      onChange={(e) => setFormData({ ...formData, balloonRegistration: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balloonCapacity">Balloon Capacity</Label>
                    <Input
                      id="balloonCapacity"
                      type="number"
                      value={formData.balloonCapacity || ""}
                      onChange={(e) => setFormData({ ...formData, balloonCapacity: e.target.value ? parseInt(e.target.value) : "" })}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Payment Settings
            </CardTitle>
            <CardDescription>Manage your Stripe account for receiving payments</CardDescription>
          </CardHeader>
          <CardContent>
            {stripeStatus.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading Stripe status...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {stripeStatus.onboarded ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {stripeStatus.onboarded
                          ? "Stripe Account Connected"
                          : stripeStatus.hasAccount
                          ? "Stripe Account Pending"
                          : "Stripe Account Not Set Up"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stripeStatus.onboarded
                          ? "Your account is fully set up and ready to receive payments"
                          : stripeStatus.hasAccount
                          ? "Complete your Stripe onboarding to start receiving payments"
                          : "Connect your Stripe account to receive payments from passengers"}
                      </p>
                    </div>
                  </div>
                </div>

                {!stripeStatus.onboarded && (
                  <Button
                    onClick={handleStripeOnboarding}
                    disabled={stripeLoading}
                    className="w-full"
                  >
                    {stripeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        {stripeStatus.hasAccount ? "Complete Stripe Setup" : "Connect Stripe Account"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}

                {stripeStatus.onboarded && (
                  <p className="text-sm text-muted-foreground">
                    You can manage your Stripe account settings directly in the{" "}
                    <a
                      href="https://dashboard.stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Stripe Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </Button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and a number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

