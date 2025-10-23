"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react'

export function StripeOnboarding() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createAccount = async () => {
    setLoading(true)
    const res = await fetch('/api/pilot/stripe/create-account', { method: 'POST', headers: { Authorization: 'Bearer dev-token-pilot-123' } })
    const data = await res.json()
    setLoading(false)
    if (data?.accountId) {
      setAccountId(data.accountId)
    }
  }

  const startOnboarding = async () => {
    if (!accountId) return
    setLoading(true)
    const res = await fetch('/api/pilot/stripe/create-onboarding-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-token-pilot-123' },
      body: JSON.stringify({ accountId }),
    })
    const data = await res.json()
    setLoading(false)
    if (data?.url) {
      setOnboardingUrl(data.url)
      // open onboarding in a new tab for the pilot to complete
      window.open(data.url, '_blank')
    }
  }

  const checkStatus = async () => {
    if (!accountId) return
    setLoading(true)
    const res = await fetch(`/api/pilot/stripe/account-status?accountId=${accountId}`, { headers: { Authorization: 'Bearer dev-token-pilot-123' } })
    const data = await res.json()
    setLoading(false)
    setStatus(data)
  }

  useEffect(() => {
    // Try to load any existing account status (server will read persisted stripeAccountId)
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/pilot/stripe/account-status', { headers: { Authorization: 'Bearer dev-token-pilot-123' } })
      setLoading(false)
      if (res.ok) {
        const data = await res.json()
        if (data?.id) setAccountId(data.id)
        setStatus(data)
      }
    }
    load()
  }, [])

  const stepStatus = (step: number) => {
    // 1: account created, 2: onboarding started (we don't track url persisted here), 3: verified (charges_enabled)
    if (step === 1) return accountId ? 'done' : 'pending'
    if (step === 2) return accountId && !status?.charges_enabled ? 'action' : 'pending'
    if (step === 3) return status?.charges_enabled ? 'done' : status ? 'action' : 'pending'
    return 'pending'
  }

  const renderStatusBadge = (s: string) => {
    if (s === 'done') return <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"><Check className="h-4 w-4"/> Done</span>
    if (s === 'action') return <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700"><AlertCircle className="h-4 w-4"/> Action Needed</span>
    return <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Pending</span>
  }

  const missingRequirements = () => {
    if (!status || !status.requirements) return []
    const reqs = status.requirements.currently_due || []
    return reqs
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Onboarding</CardTitle>
        <CardDescription>An easy, guided Connect onboarding for pilots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Step 1 — Create your Stripe Connect account</p>
            {renderStatusBadge(stepStatus(1))}
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={createAccount} disabled={!!accountId || loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : accountId ? 'Account Created' : 'Create Account'}
            </Button>
            {accountId && <div className="flex items-center gap-2 text-sm"> <CheckCircle2 className="text-green-500"/> <span className="font-medium">{accountId}</span></div>}
          </div>
          <p className="text-sm text-muted-foreground">We will create a Stripe Connect account for you. This links your payouts and payments to your account.</p>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Step 2 — Complete onboarding in Stripe</p>
            {renderStatusBadge(stepStatus(2))}
          </div>
          <div className="flex gap-2">
            <Button onClick={startOnboarding} disabled={!accountId || loading} variant={accountId ? 'default' : 'outline'}>
              {onboardingUrl ? 'Re-open Onboarding' : 'Start Onboarding'}
            </Button>
            <Button onClick={() => window.open('/pilot/dashboard')} variant="ghost">Return</Button>
          </div>
          <p className="text-xs text-muted-foreground">The onboarding opens in a new tab. Follow Stripe's simple steps to verify identity and add a bank account. Return here when finished.</p>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Step 3 — Verify account setup</p>
            {renderStatusBadge(stepStatus(3))}
          </div>
          <div className="flex gap-2 items-start">
            <Button onClick={checkStatus} disabled={!accountId || loading} variant="secondary">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Checking...</> : 'Check Status'}
            </Button>
            <div className="flex-1">
              {status ? (
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">Account Summary</p>
                  <p className="text-sm text-muted-foreground">Charges enabled: {status.charges_enabled ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-muted-foreground">Payouts enabled: {status.payouts_enabled ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-muted-foreground">Details submitted: {status.details_submitted ? 'Yes' : 'No'}</p>
                  {(!status.charges_enabled || !status.payouts_enabled) && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Next steps</p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {missingRequirements().length === 0 ? (
                          <li>Check Stripe dashboard for required details</li>
                        ) : (
                          missingRequirements().map((r: string) => <li key={r}>{r}</li>)
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No account information available yet. Create an account and complete onboarding to enable payments.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
