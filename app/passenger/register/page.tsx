import { PassengerRegistrationForm } from "@/components/passenger/passenger-registration-form"

export default function PassengerRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold">Passenger Sign-Up</h1>
          <p className="text-pretty text-muted-foreground">
            Get notified when hot air balloon pilots are available near you. Never miss an opportunity to experience the
            sky!
          </p>
        </div>
        <PassengerRegistrationForm />
      </div>
    </div>
  )
}
