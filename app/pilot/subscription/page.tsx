import { SubscriptionPlans } from "@/components/pilot/subscription-plans"

export default function PilotSubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-pretty text-muted-foreground">
          Select the subscription that best fits your needs as a pilot
        </p>
      </div>
      <SubscriptionPlans />
    </div>
  )
}
