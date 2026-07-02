import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Obtener tipo de cambio GTQ→USD desde Banguat (Banco de Guatemala)
async function getTipoCambio(): Promise<number> {
  try {
    const hoy = new Date()
    const fecha = hoy.toISOString().slice(0, 10) // YYYY-MM-DD
    const url = `https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx/TipoCambioDia?fecha=${fecha.split('-').reverse().join('/')}`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // cache 1 hora
    const xml = await res.text()
    // El XML devuelve <VentaRef>7.75000</VentaRef>
    const match = xml.match(/<VentaRef>([0-9.]+)<\/VentaRef>/)
    if (match) return parseFloat(match[1])
  } catch {}
  // Fallback al tipo de cambio aproximado si falla Banguat
  return 7.75
}

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

    // Obtener tipo de cambio en tiempo real
    const tipoCambio = await getTipoCambio()

    // Convertir de centavos GTQ a centavos USD
    const amountGTQ = amount / 100
    const amountUSD = Math.round((amountGTQ / tipoCambio) * 100)

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
    params.append('metadata[tipo_cambio]', tipoCambio.toFixed(4))

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

    return NextResponse.json({
      clientSecret: intent.client_secret,
      intentId: intent.id,
      tipoCambio,
      amountUSD: amountUSD / 100,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 })
  }
}
