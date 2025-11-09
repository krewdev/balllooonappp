"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Zap,
  ArrowLeft,
  LogIn
} from "lucide-react"

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Navigation */}
        <div className="mb-12 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white">
            <Link href="/pilot/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>

        {/* Hero */}
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
            <Plane className="mr-2 h-3 w-3" />
            For Pilots
          </Badge>
          <h1 className="mb-4 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            How It Works
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your complete guide to managing a hot air balloon business
          </p>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Sparkles, title: "Build Your List", desc: "One QR code, unlimited passengers", gradient: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/50" },
            { icon: Zap, title: "You Control Access", desc: "Notification-only bookings", gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/50" },
            { icon: TrendingUp, title: "Get Paid Fast", desc: "90% goes straight to you", gradient: "from-green-500 to-emerald-500", shadow: "shadow-green-500/50" }
          ].map((item, i) => (
            <Card key={i} className="border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 hover:scale-105 transition-all hover:shadow-2xl">
              <CardContent className="pt-8 pb-6">
                <div className={`bg-gradient-to-br ${item.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${item.shadow}`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
                <p className="text-blue-200">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Steps */}
        <Card className="mb-16 border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8">
            <CardTitle className="text-3xl font-black text-white">7 Steps to Success</CardTitle>
            <CardDescription className="text-cyan-100 text-lg">From signup to your first payout</CardDescription>
          </div>
          <CardContent className="p-8 space-y-6">
            {[
              { num: 1, title: "Register & Get Approved", desc: "Submit your pilot credentials. Approval in 24-48hrs.", color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/50" },
              { num: 2, title: "Connect Stripe", desc: "Set up payments to receive money directly.", color: "from-green-500 to-emerald-500", shadow: "shadow-green-500/50" },
              { num: 3, title: "Create Flights", desc: "Add flight details. Payment links auto-generated.", color: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/50" },
              { num: 4, title: "Notify Passengers", desc: "Select who gets booking links via SMS.", color: "from-orange-500 to-red-500", shadow: "shadow-orange-500/50" },
              { num: 5, title: "They Book & Pay", desc: "Passengers pay via Stripe. You get 90% instantly.", color: "from-yellow-500 to-amber-500", shadow: "shadow-yellow-500/50" },
              { num: 6, title: "QR Check-In", desc: "Passengers scan your QR on flight day.", color: "from-teal-500 to-cyan-500", shadow: "shadow-teal-500/50" },
              { num: 7, title: "Get Paid", desc: "Money hits your bank in 2-7 days.", color: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/50" }
            ].map((step) => (
              <div key={step.num} className="flex gap-6 hover:bg-white/5 p-4 rounded-xl transition-all group border-t border-white/10 first:border-0 pt-6 first:pt-0">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white font-black text-xl shadow-lg ${step.shadow}`}>
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-white">{step.title}</h3>
                  <p className="text-lg text-blue-100">{step.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="rounded-3xl p-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[22px] p-12 text-center">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/50">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Ready to Start?
            </h3>
            <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
              Join pilots building thriving businesses. Get approved in days.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg px-8 py-6 shadow-xl shadow-cyan-500/50">
                <Link href="/pilot/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Apply Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold text-lg px-8 py-6">
                <Link href="/pilot/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
