import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  CheckCircle2, 
  Plane, 
  CreditCard, 
  Calendar, 
  Users, 
  Bell, 
  QrCode,
  DollarSign,
  Shield,
  ArrowRight
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <Badge className="mb-4" variant="secondary">
            <Plane className="mr-1 h-3 w-3" />
            For Pilots
          </Badge>
          <h1 className="mb-4 text-4xl font-bold">How It Works for Pilots</h1>
          <p className="text-lg text-muted-foreground">
            Join our platform to connect with passengers, manage bookings, and earn revenue from your hot air balloon flights.
          </p>
        </div>

        {/* Overview Steps */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <CardTitle>Apply & Get Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit your pilot credentials, license, and insurance information for admin review.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <CardTitle>Connect Stripe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up your Stripe account to receive payments directly from passenger bookings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <CardTitle>Create & Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule flights, manage bookings, notify passengers, and track your earnings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Features */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">What You Can Do</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Schedule Flights</CardTitle>
                    <CardDescription>
                      Create flight listings with date, time, location, capacity, and pricing. Flights are automatically listed for passengers to book.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Receive Payments</CardTitle>
                    <CardDescription>
                      Passengers pay upfront through Stripe. Funds are deposited directly to your connected Stripe account (minus a 5% platform fee).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Manage Bookings</CardTitle>
                    <CardDescription>
                      View all bookings for each flight, see passenger details, and track payment status in real-time.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Bell className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Notify Passengers</CardTitle>
                    <CardDescription>
                      Send SMS notifications to all booked passengers for weather updates, schedule changes, or important announcements.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                    <QrCode className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle>QR Code Check-In</CardTitle>
                    <CardDescription>
                      Generate a unique pilot QR code that passengers scan on the day of flight to verify their booking and grant flight access.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle>Track Earnings</CardTitle>
                    <CardDescription>
                      View transaction history, payouts, and revenue analytics. All payments are processed securely through Stripe.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* How Payments Work */}
        <Card className="mb-12 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              How Payments Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Passenger books and pays</p>
                <p className="text-sm text-muted-foreground">
                  Payment is processed immediately through Stripe Checkout
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Platform fee: 5%</p>
                <p className="text-sm text-muted-foreground">
                  A 5% fee is automatically deducted to support the platform
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Direct deposit to you</p>
                <p className="text-sm text-muted-foreground">
                  Remaining 95% goes directly to your Stripe account (following Stripe's standard payout schedule)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>What You Need to Apply</CardTitle>
            <CardDescription>
              Make sure you have the following information ready before registering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Valid pilot license number and expiry date</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Years of experience and total flight hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Insurance provider, policy number, and expiry date</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Hot air balloon registration and passenger capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Valid email address and phone number</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-600" />
                <span className="text-sm">Stripe account for payment processing (set up after approval)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-primary bg-primary/5 p-8 text-center">
          <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
          <p className="text-muted-foreground">
            Apply now and start connecting with passengers for your hot air balloon flights.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/pilot/register">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pilot/login">
                Already Applied? Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
