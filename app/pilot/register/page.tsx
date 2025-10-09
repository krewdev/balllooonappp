import { PilotRegistrationForm } from "@/components/pilot/pilot-registration-form"

export default function PilotRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold">Pilot Registration</h1>
          <p className="text-pretty text-muted-foreground">
            Join AeroConnect and start connecting with passengers. Complete the registration form below to get started.
          </p>
        </div>
        <PilotRegistrationForm />
      </div>
    </div>
  )
}
