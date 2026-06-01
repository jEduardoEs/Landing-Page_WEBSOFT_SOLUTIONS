import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
    }

    const { amount, currency = 'gtq', metadata } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    // Create PaymentIntent via Stripe API (no package needed)
    const params = new URLSearchParams()
    params.append('amount', String(Math.round(amount)))
    params.append('currency', currency)
    params.append('automatic_payment_methods[enabled]', 'true')
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        params.append(`metadata[${k}]`, String(v))
      })
    }

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const intent = await res.json() as any
    if (!res.ok) {
      return NextResponse.json({ error: intent?.error?.message || 'Error Stripe' }, { status: 400 })
    }

    return NextResponse.json({ clientSecret: intent.client_secret, intentId: intent.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 })
  }
}
