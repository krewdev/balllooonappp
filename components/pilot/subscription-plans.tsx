"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"

export function SubscriptionPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: "basic" | "premium") => {
    setIsLoading(tier)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pilot",
          tier,
          billingPeriod,
          userId: "user-123", // TODO: Get from auth session
          email: "pilot@example.com", // TODO: Get from auth session
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("[v0] Subscription error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const plans = [
    {
      name: "Basic",
      tier: "basic" as const,
      monthlyPrice: 29,
      yearlyPrice: 290,
      description: "Perfect for occasional pilots",
      features: [
        "Post unlimited availability",
        "Receive passenger notifications",
        "Basic QR code verification",
        "Email support",
        "Access to pilot dashboard",
      ],
    },
    {
      name: "Premium",
      tier: "premium" as const,
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: "For professional pilots",
      features: [
        "Everything in Basic",
        "Priority passenger matching",
        "Advanced analytics dashboard",
        "Custom QR code branding",
        "Priority email & phone support",
        "Featured pilot listing",
        "Automated booking management",
      ],
      popular: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={billingPeriod === "monthly" ? "default" : "outline"}
          onClick={() => setBillingPeriod("monthly")}
        >
          Monthly
        </Button>
        <Button variant={billingPeriod === "yearly" ? "default" : "outline"} onClick={() => setBillingPeriod("yearly")}>
          Yearly
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.tier} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary px-4 py-1">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.tier)}
                disabled={isLoading !== null}
              >
                {isLoading === plan.tier ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
