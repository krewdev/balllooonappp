import { PilotRegistrationForm } from "@/components/pilot/pilot-registration-form"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Link from "next/link"

export default function PilotRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold">Pilot Registration</h1>
          <p className="text-pretty text-muted-foreground">
            Join FLY HOT AIR! and start connecting with passengers. Complete the registration form below to get started.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/pilot/how-it-works">
                <Info className="mr-2 h-4 w-4" />
                Learn How It Works
              </Link>
            </Button>
          </div>
        </div>
        <PilotRegistrationForm />
      </div>
    </div>
  )
}
