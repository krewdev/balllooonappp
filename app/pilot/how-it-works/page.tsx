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
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <Badge className="mb-6 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <Plane className="mr-2 h-4 w-4" />
              For Pilots
            </Badge>
            <h1 className="mb-6 text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your complete guide to managing a thriving hot air balloon business - 
              from first approval to receiving payments. Simple, powerful, profitable.
            </p>
          </div>

          {/* Value Props - New Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <Sparkles className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Build Your List</h3>
                <p className="text-blue-100 text-sm">
                  Share one QR code, build a loyal passenger database that's yours forever
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <Zap className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">You Control Access</h3>
                <p className="text-purple-100 text-sm">
                  No public bookings. You decide who gets notified about each flight
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 mb-4" />
                <h3 className="font-bold text-lg mb-2">Get Paid Fast</h3>
                <p className="text-pink-100 text-sm">
                  90% of every booking goes straight to your bank. No waiting, no hassle
                </p>
              </CardContent>
            </Card>
          </div>

          {/* The Complete Workflow */}
          <Card className="mb-16 border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <CardTitle className="text-3xl mb-3 font-bold">Your Journey to Success</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Follow these 7 simple steps from signup to your first payout
              </CardDescription>
            </div>
            <CardContent className="space-y-8 p-8 bg-white">
            {/* Step 1 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">📝 Registration & Approval</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  Create your pilot account by providing your credentials (license, insurance, balloon registration). 
                  An admin reviews and approves your application, typically within 24-48 hours.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-blue-400">
                  <code className="text-blue-600">/pilot/register</code> → Admin review at <code className="text-blue-600">/admin/pilot-approvals</code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">💳 Stripe Onboarding</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  After approval, you'll be prompted to connect your Stripe account. This is required to receive payments. 
                  You'll complete Stripe's onboarding form (identity verification, bank account details, tax info).
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-green-400">
                  Onboarding prompt appears in <code className="text-green-600">/pilot/dashboard</code>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">✈️ Create Flight Listings</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  Create flight listings with details: title, date/time, location, price, max passengers, and description. 
                  The platform automatically creates a Stripe product and payment link for your flight.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-purple-400">
                  <code className="text-purple-600">/pilot/flights/new</code> → View all at <code className="text-purple-600">/pilot/flights</code>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">🔒 Passengers Book & Pay (Notification-Only)</h3>
                <div className="bg-pink-50 border-l-4 border-pink-500 p-3 mb-3 rounded">
                  <p className="text-sm font-semibold text-pink-900 mb-1">🔔 Important: You Control Access!</p>
                  <p className="text-sm text-pink-800">
                    Flights can ONLY be booked through SMS notifications you send. 
                    There's no public flight browsing.
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  Passengers receive your SMS notification with a unique booking link, 
                  click it, fill out their details (including consent forms), and pay via Stripe Checkout. 
                  Payment is processed immediately and you receive 90% (10% platform fee is deducted automatically).
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-pink-400">
                  Your SMS notification → Unique booking link → <code className="text-pink-600">/passenger/book/[flightId]</code> → Payment via Stripe
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg shadow-lg">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">📊 Manage Bookings</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  View all passengers who booked your flight in the flight details page. You can see their contact info, 
                  payment status, and consent signatures. Send additional SMS updates about weather, timing, or cancellations.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-orange-400">
                  <code className="text-orange-600">/pilot/flights/[id]</code> → "Notify All Passengers" button sends bulk SMS
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-lg shadow-lg">
                6
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">📱 Day of Flight: QR Code Check-In</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  On flight day, download your unique pilot QR code from the dashboard. Passengers scan this QR code 
                  with their phones to verify their booking and "check in" for the flight. This grants them access and confirms attendance.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-teal-400">
                  Download QR from <code className="text-teal-600">/pilot/dashboard</code> → Passengers scan via their booking page
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4 group hover:translate-x-2 transition-transform duration-200">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-lg">
                7
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-800">💰 Get Paid</h3>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  Stripe automatically transfers funds to your connected bank account according to their payout schedule 
                  (typically 2-7 business days after the booking). View all transactions and earnings in the Transactions page.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md p-2 border-l-2 border-emerald-400">
                  <code className="text-emerald-600">/pilot/transactions</code> → Shows all charges via Stripe API
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code System Explained */}
        <Card className="mb-12 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code System: Registration & Check-In
            </CardTitle>
            <CardDescription>
              Your QR code serves two critical purposes in the workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passenger Registration Use */}
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                1. Building Your Passenger List
              </h4>
              <div className="space-y-3 ml-7">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Download your unique QR code</p>
                    <p className="text-sm text-muted-foreground">
                      Each pilot gets a unique QR code from the dashboard. This code links directly to your pilot ID.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Share it everywhere</p>
                    <p className="text-sm text-muted-foreground">
                      Print on business cards, display at events, post on social media, add to emails. The more you share, the bigger your passenger pool!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Passengers scan and register under YOU</p>
                    <p className="text-sm text-muted-foreground">
                      When someone scans your QR code, they're taken to <code>/passenger/register?pilotId={'{yourId}'}</code> with your name pre-filled. 
                      They enter their details: name, email, phone, weight (in lbs), and ZIP code.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">They become YOUR registered passengers</p>
                    <p className="text-sm text-muted-foreground">
                      Once registered, they appear in your "My Passengers" list at <code>/pilot/passengers</code>. 
                      You can now send them SMS notifications about upcoming flights!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-In Use */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                2. Day-of-Flight Check-In
              </h4>
              <div className="space-y-3 ml-7">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">Verify passenger attendance</p>
                    <p className="text-sm text-muted-foreground">
                      On flight day, passengers who have booked and paid can scan your QR code again to check in. 
                      This confirms their attendance and creates a record of who showed up.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">Contactless verification</p>
                    <p className="text-sm text-muted-foreground">
                      No need for paper tickets or manual check-ins. Passengers scan, system verifies their booking, done!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification-Based Booking Flow */}
        <Card className="mb-12 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              How Flight Bookings Work (Notification-Only Model)
            </CardTitle>
            <CardDescription>
              Important: There's NO public flight browsing. All bookings come through YOUR notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-purple-100 border-2 border-purple-300 p-4 mb-4">
              <p className="font-semibold text-purple-900 mb-2">🔒 You Control Who Can Book</p>
              <p className="text-sm text-purple-800">
                Unlike traditional booking platforms, passengers can't browse and book flights on their own. 
                YOU decide who gets the booking link by sending SMS notifications to your registered passengers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">Build your passenger list via QR code</p>
                  <p className="text-sm text-muted-foreground">
                    People scan your QR code and register. This creates YOUR private passenger database.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">Create a flight listing</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your flight details, pricing, capacity. The system generates a Stripe payment link.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">Select passengers to notify</p>
                  <p className="text-sm text-muted-foreground">
                    Go to the flight page, choose which registered passengers to notify (checkboxes), and send SMS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">4</div>
                <div>
                  <p className="font-medium">Passengers receive unique booking links</p>
                  <p className="text-sm text-muted-foreground">
                    Each SMS contains a link to <code>/passenger/book/[flightId]</code> where they can book and pay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">5</div>
                <div>
                  <p className="font-medium">They book and pay instantly</p>
                  <p className="text-sm text-muted-foreground">
                    Passenger fills consent forms and pays via Stripe. You get paid immediately (minus 10% platform fee).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features Quick Reference */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Platform Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Flight Management</CardTitle>
                    <CardDescription className="text-sm">
                      Create unlimited flights, set pricing, manage capacity, and track bookings in real-time.
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
                    <CardTitle className="text-base">Secure Payments via Stripe</CardTitle>
                    <CardDescription className="text-sm">
                      Stripe Connect handles all payment processing. You keep 90%, platform takes 10%.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">SMS Notifications (Booking Links)</CardTitle>
                    <CardDescription className="text-sm">
                      Send booking links to your registered passengers. This is the ONLY way they can book flights.
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
                    <CardTitle className="text-base">QR Code: Registration & Check-In</CardTitle>
                    <CardDescription className="text-sm">
                      Build your passenger list (registration) and verify attendance on flight day (check-in).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Passenger Management</CardTitle>
                    <CardDescription className="text-sm">
                      View passenger details, consent forms, emergency contacts, and booking history.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Revenue Tracking</CardTitle>
                    <CardDescription className="text-sm">
                      View transaction history, earnings, and payout schedules from your dashboard.
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
              Payment Processing Details
            </CardTitle>
            <CardDescription>
              Understanding the money flow from booking to your bank account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">Passenger pays upfront via Stripe Checkout</p>
                <p className="text-sm text-muted-foreground">
                  When a passenger books, they complete payment immediately through Stripe's secure checkout.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">Platform fee: 10% (configurable)</p>
                <p className="text-sm text-muted-foreground">
                  The platform automatically deducts a 10% application fee (set by PLATFORM_FEE_BPS environment variable, default 1000 basis points = 10%).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">Direct deposit to your Stripe account</p>
                <p className="text-sm text-muted-foreground">
                  The remaining 90% goes directly to your connected Stripe account. Stripe then transfers to your bank account per their payout schedule (typically 2-7 business days).
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4 mt-4">
              <p className="text-sm font-medium mb-2">Example: $100 flight booking</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Passenger pays: <strong>$100.00</strong></li>
                <li>• Platform fee (10%): <strong>-$10.00</strong></li>
                <li>• You receive: <strong>$90.00</strong></li>
                <li>• Stripe processing fee: <strong>~$3.20</strong> (deducted by Stripe separately)</li>
                <li>• Net to your bank: <strong>~$86.80</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="mb-12 bg-slate-50">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              For developers: How the system works under the hood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Payment Architecture</p>
              <p className="text-muted-foreground">
                Uses Stripe Connect with "destination charges" model. Each booking creates a Payment Intent with application_fee_amount 
                and transfer_data pointing to the pilot's connected Stripe account.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Onboarding Flow</p>
              <p className="text-muted-foreground">
                Stripe Connect Express accounts are created via API. AccountLinks provide hosted onboarding forms for KYC/identity verification.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">QR Code System</p>
              <p className="text-muted-foreground">
                Each pilot gets a unique ID-based QR code. Passengers scan it, triggering API verification (POST /api/pilot/qr/verify) 
                that checks booking status and grants flight access.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">SMS Notifications</p>
              <p className="text-muted-foreground">
                Powered by Twilio API. Bulk SMS sent via POST /api/pilot/flights/notify, which fetches all bookings for a flight 
                and sends messages in parallel.
              </p>
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
          <div className="bg-white rounded-xl p-10 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Transform Your Business?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join pilots who are already building thriving balloon businesses with our platform. 
              Get approved, start collecting passengers, and receive your first payment within days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                <Link href="/pilot/register">
                  <Plane className="mr-2 h-5 w-5" />
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                <Link href="/pilot/login">
                  Already Applied? Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
