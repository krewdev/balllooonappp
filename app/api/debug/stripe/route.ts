import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY || ''
    const hasKey = !!key
    const looksLikeSecret = key.startsWith('sk_')
    const looksLikePublishable = key.startsWith('pk_')

    return NextResponse.json({
      hasKey,
      looksLikeSecret,
      looksLikePublishable,
      note: 'This endpoint does NOT return the key value. It only indicates whether the key appears configured and whether it looks like a secret or publishable key.'
    })
  } catch (err) {
    console.error('Debug stripe endpoint error', err)
    return NextResponse.json({ error: 'Failed to read stripe env' }, { status: 500 })
  }
}
