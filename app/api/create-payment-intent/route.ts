import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Tipo de cambio aproximado Q → USD (1 USD ≈ 7.75 GTQ)
const GTQ_TO_USD = 7.75

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
    }

    const { amount, metadata } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    // Convertir de centavos de GTQ a centavos de USD
    // amount viene en centavos de GTQ (ej: Q63.00 = 6300)
    const amountGTQ = amount / 100
    const amountUSD = Math.round((amountGTQ / GTQ_TO_USD) * 100) // centavos USD

    if (amountUSD < 50) {
      return NextResponse.json({ error: 'Monto mínimo no alcanzado' }, { status: 400 })
    }

    const params = new URLSearchParams()
    params.append('amount', String(amountUSD))
    params.append('currency', 'usd')
    params.append('automatic_payment_methods[enabled]', 'true')
    params.append('description', `WebSoft Solutions — Q ${amountGTQ.toFixed(2)}`)
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        params.append(`metadata[${k}]`, String(v))
      })
    }
    params.append('metadata[monto_gtq]', amountGTQ.toFixed(2))

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
      console.error('Stripe error:', intent?.error)
      return NextResponse.json({ error: intent?.error?.message || 'Error Stripe' }, { status: 400 })
    }

    return NextResponse.json({ clientSecret: intent.client_secret, intentId: intent.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 })
  }
}
