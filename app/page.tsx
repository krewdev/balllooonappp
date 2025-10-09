import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Users, Calendar, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AeroConnect</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              The premier platform connecting hot air balloon pilots with passengers and festival organizers. Experience
              the sky like never before.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/pilot/register">Join as Pilot</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
                <Link href="/passenger/register">Find Flights</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">How AeroConnect Works</h2>
          <p className="text-pretty text-muted-foreground">
            Connecting the hot air balloon community with seamless technology
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>For Pilots</CardTitle>
              <CardDescription>
                Register, get verified, and connect with passengers eager for balloon rides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0">
                <Link href="/pilot/register">Learn More →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/20 transition-all hover:border-accent/40 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>For Passengers</CardTitle>
              <CardDescription>
                Get notified when pilots are available near you for unforgettable experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0">
                <Link href="/passenger/register">Sign Up →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 transition-all hover:border-secondary/40 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>For Organizers</CardTitle>
              <CardDescription>
                Festival Meisters can access premium services to coordinate balloon events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="p-0">
                <Link href="/meister/register">Get Started →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Verified & Safe</CardTitle>
              <CardDescription>All pilots are thoroughly verified with valid licenses and insurance</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">Ready to Take Flight?</h2>
          <p className="mb-8 text-pretty text-muted-foreground">
            Join the AeroConnect community today and experience the magic of hot air ballooning
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/pilot/register">Pilot Registration</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/passenger/register">Passenger Sign-Up</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
