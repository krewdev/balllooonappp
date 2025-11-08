"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Circle,
  CreditCard, 
  Calendar, 
  Bell, 
  QrCode,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react"
import Link from "next/link"

type Step = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  actionLabel: string
  actionHref: string
  completionCheck?: boolean
}

type OnboardingTutorialProps = {
  pilot: {
    stripeAccountId: string | null
  }
  stripeOnboarded: boolean
  onComplete: () => void
}

export function OnboardingTutorial({ pilot, stripeOnboarded, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const steps: Step[] = [
    {
      id: "welcome",
      title: "Welcome! You've Been Approved 🎉",
      description: "Congratulations! Your pilot application has been approved. Let's get you set up to start creating flights and earning revenue. This quick tutorial will guide you through the essential steps.",
      icon: CheckCircle2,
      actionLabel: "Get Started",
      actionHref: "#",
      completionCheck: true
    },
    {
      id: "stripe",
      title: "Step 1: Connect Your Stripe Account",
      description: "To receive payments from passenger bookings, you need to connect a Stripe account. This is where your earnings will be deposited. Click below to set up your Stripe account - it takes about 5 minutes.",
      icon: CreditCard,
      actionLabel: stripeOnboarded ? "✓ Stripe Connected" : "Connect Stripe Now",
      actionHref: "#stripe-section",
      completionCheck: stripeOnboarded
    },
    {
      id: "flight",
      title: "Step 2: Create Your First Flight",
      description: "Once Stripe is connected, you can create flight listings. Include the date, time, location, passenger capacity, and price. Passengers can then browse and book your flights.",
      icon: Calendar,
      actionLabel: "Create a Flight",
      actionHref: "/pilot/flights/new",
      completionCheck: stripeOnboarded
    },
    {
      id: "qr",
      title: "Step 3: Generate Your Pilot QR Code",
      description: "Your pilot QR code is used for passenger check-in on flight day. Passengers scan your QR code to verify their booking. You can download and print this QR code from your dashboard.",
      icon: QrCode,
      actionLabel: "View Dashboard",
      actionHref: "/pilot/dashboard",
      completionCheck: true
    },
    {
      id: "notify",
      title: "Step 4: Notify Your Passengers",
      description: "From each flight detail page, you can send SMS notifications to all booked passengers. Use this to send weather updates, reminders, or schedule changes.",
      icon: Bell,
      actionLabel: "View Flights",
      actionHref: "/pilot/flights",
      completionCheck: true
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      setDismissed(true)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    setDismissed(true)
  }

  if (dismissed) {
    return null
  }

  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">Step {currentStep + 1} of {steps.length}</Badge>
            {currentStepData.completionCheck && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Ready
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {currentStepData.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Dots */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className="transition-all"
              >
                {step.completionCheck ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Circle 
                    className={`h-3 w-3 ${
                      index === currentStep 
                        ? "fill-primary text-primary" 
                        : "text-muted-foreground"
                    }`} 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>

            <div className="flex gap-2">
              {currentStepData.id !== "welcome" && (
                <Button asChild variant="outline">
                  <Link 
                    href={currentStepData.actionHref}
                    onClick={() => {
                      if (currentStepData.actionHref.startsWith("#")) {
                        handleSkip()
                      }
                    }}
                  >
                    {currentStepData.actionLabel}
                  </Link>
                </Button>
              )}
              
              <Button onClick={handleNext}>
                {isLastStep ? "Complete Tutorial" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
