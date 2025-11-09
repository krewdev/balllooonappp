"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, DollarSign, CreditCard, Save } from "lucide-react"
import { useEffect, useState } from "react"

export default function PlatformSettingsPage() {
  const [platformFee, setPlatformFee] = useState("1000")
  const [stripeAccount, setStripeAccount] = useState(process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.PLATFORM_FEE_BPS) {
          setPlatformFee(data.PLATFORM_FEE_BPS.value)
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    }
  }

  const handleSaveFee = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "PLATFORM_FEE_BPS",
          value: platformFee,
        }),
      })

      if (response.ok) {
        setMessage("Platform fee updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError("Failed to update platform fee")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const feePercentage = (parseInt(platformFee) / 100).toFixed(2)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold flex items-center gap-3">
          <Settings className="h-10 w-10" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground">Manage platform fees, Stripe integration, and payout settings</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Platform Fee Settings */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Platform Fee Configuration
            </CardTitle>
            <CardDescription>
              Set the platform fee charged on all transactions (in basis points: 1000 = 10%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (Basis Points)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  placeholder="1000"
                  min="0"
                  max="10000"
                />
                <p className="text-xs text-muted-foreground">
                  Current: <strong>{feePercentage}%</strong> fee per transaction
                </p>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveFee} disabled={loading} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Fee Settings"}
                </Button>
              </div>
            </div>

            {message && (
              <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">Fee Calculation Example</h4>
              <p className="text-sm text-blue-800">
                For a $100 booking with {feePercentage}% fee:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Passenger pays: <strong>$100.00</strong></li>
                <li>• Platform fee ({feePercentage}%): <strong>${(100 * parseFloat(feePercentage) / 100).toFixed(2)}</strong></li>
                <li>• Pilot receives: <strong>${(100 - (100 * parseFloat(feePercentage) / 100)).toFixed(2)}</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Account Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Integration
            </CardTitle>
            <CardDescription>
              Platform Stripe account and payout information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stripe Secret Key</Label>
              <Input
                type="password"
                value={process.env.STRIPE_SECRET_KEY ? "••••••••••••••••" : "Not set"}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configured via environment variable STRIPE_SECRET_KEY
              </p>
            </div>

            <div className="space-y-2">
              <Label>Platform Stripe Account ID</Label>
              <Input
                type="text"
                value={stripeAccount || "Not configured"}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                This is your main platform Stripe account that collects fees
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h4>
              <p className="text-sm text-yellow-800">
                Stripe keys are set via environment variables for security. 
                To update Stripe configuration, modify your <code className="bg-yellow-200 px-1 rounded">.env</code> file 
                and restart the application.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Payout Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Processor:</span>
                  <span className="font-medium">Stripe Connect</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout Method:</span>
                  <span className="font-medium">Destination Charges</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee Collection:</span>
                  <span className="font-medium">Automatic (via application_fee_amount)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pilot Payout Schedule:</span>
                  <span className="font-medium">Stripe Default (2-7 business days)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
