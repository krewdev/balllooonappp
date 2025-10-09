import { MeisterRegistrationForm } from "@/components/meister/meister-registration-form"

export default function MeisterRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold">Festival Meister Registration</h1>
          <p className="text-pretty text-muted-foreground">
            Coordinate hot air balloon events at your festival with our premium services
          </p>
        </div>
        <MeisterRegistrationForm />
      </div>
    </div>
  )
}
