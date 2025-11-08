import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function MeisterSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Manage your contact details, organization info, and preferences.</p>
          <p className="text-sm text-muted-foreground">Coming soon.</p>
          <p className="text-sm"><Link className="underline" href="/meister/dashboard">Back to dashboard</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
