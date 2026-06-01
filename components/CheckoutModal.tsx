'use client'
import { useState, useEffect } from 'react'
import { CartItem, PedidoForm } from '@/lib/types'
import { POS_URL, WA, IVA } from '@/lib/constants'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Initialize Stripe outside component to avoid recreating on renders
const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

type Step = 'datos' | 'pago' | 'confirmado'
type MetodoPago = 'tarjeta' | 'transferencia' | 'efectivo'

interface Props {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

// ─── Inner payment form (needs Stripe context) ───────────────────────────────
function PaymentForm({ total, onPaid, onBack, loading, setLoading }: {
  total: number
  onPaid: () => void
  onBack: () => void
  loading: boolean
  setLoading: (v: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')

  const pagar = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) { setError(submitError.message || 'Error'); setLoading(false); return }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/gracias` },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Pago rechazado. Verifica los datos de tu tarjeta.')
      setLoading(false)
    } else {
      onPaid()
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <PaymentElement options={{
          layout: 'tabs',
          fields: { billingDetails: { address: { country: 'never' } } },
        }} />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Security badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'var(--gray2)', borderRadius: 8 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>Pago seguro con cifrado SSL. WebSoft Solutions nunca almacena datos de tu tarjeta.</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ padding: '12px 20px', background: 'var(--gray2)', color: 'var(--text2)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Atrás
        </button>
        <button onClick={pagar} disabled={loading || !stripe || !elements}
          style={{ flex: 1, padding: '13px 0', background: loading ? '#94a3b8' : 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background .2s' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
              Procesando...
            </span>
          ) : `Pagar Q ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

// ─── Main CheckoutModal ───────────────────────────────────────────────────────
export default function CheckoutModal({ open, items, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('datos')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('tarjeta')
  const [loading, setLoading] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [form, setForm] = useState<PedidoForm>({
    nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: ''
  })

  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const iva = subtotal * IVA
  const total = subtotal + iva
  const totalCentavos = Math.round(total * 100)

  // Create PaymentIntent when user selects card payment and moves to step 2
  useEffect(() => {
    if (step === 'pago' && metodoPago === 'tarjeta' && !clientSecret && totalCentavos > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCentavos,
          currency: 'gtq',
          metadata: { cliente: form.nombre, telefono: form.telefono },
        }),
      })
        .then(r => r.json())
        .then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
        .catch(() => {})
    }
  }, [step, metodoPago, clientSecret, totalCentavos, form.nombre, form.telefono])

  if (!open) return null

  const set = (k: keyof PedidoForm, v: string) => setForm(p => ({ ...p, [k]: v }))

  const registrarPedido = async (estadoPago: 'pendiente' | 'pagado') => {
    try {
      const res = await fetch(`${POS_URL}/api/tienda/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: form.nombre,
          clienteEmail: form.email || `${form.telefono}@ws.gt`,
          clienteTelefono: form.telefono,
          clienteNit: form.nit || 'CF',
          clienteDireccion: form.direccion,
          notas: `Método: ${metodoPago}. ${form.notas}`.trim(),
          estado: estadoPago,
          items: items.map(i => ({
            productoId: i.id, nombre: i.nombre,
            precio: i.precio, cantidad: i.qty, imagenUrl: i.imagenUrl,
          })),
        }),
      })
      const data = await res.json()
      if (data.ok) setNumeroPedido(data.numero)
      return data
    } catch { return null }
  }

  const irAPago = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) { alert('Nombre y teléfono son requeridos'); return }
    if (!form.direccion.trim()) { alert('La dirección de entrega es requerida'); return }
    setClientSecret('') // reset so new PaymentIntent is created
    setStep('pago')
  }

  const onPagoTarjetaExitoso = async () => {
    setLoading(true)
    await registrarPedido('pagado')
    setLoading(false)
    onSuccess()
    setStep('confirmado')
  }

  const confirmarOtroMetodo = async () => {
    setLoading(true)
    const data = await registrarPedido('pendiente')
    setLoading(false)
    if (data?.ok) {
      // Send WhatsApp notification
      const metodoTexto = metodoPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo / contra entrega'
      const lines = [
        `Hola WebSoft Solutions! Realicé un pedido.`,
        `Pedido: ${data.numero}`,
        `Nombre: ${form.nombre}`,
        `Teléfono: ${form.telefono}`,
        `Dirección: ${form.direccion}`,
        `Pago: ${metodoTexto}`,
        `Total: Q ${total.toFixed(2)}`,
      ]
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
      setStep('confirmado')
      onSuccess()
    } else {
      alert('Error al registrar. Intenta de nuevo.')
    }
  }

  const cerrar = () => {
    if (loading) return
    setStep('datos')
    setMetodoPago('tarjeta')
    setClientSecret('')
    setForm({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })
    onClose()
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray3)', borderRadius: 9, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', outline: 'none', transition: 'border-color .2s', background: '#fff' }

  const METODOS: { id: MetodoPago; label: string; desc: string; iconPath: string }[] = [
    { id: 'tarjeta', label: 'Tarjeta de crédito / débito', desc: 'Visa, Mastercard, American Express — pago inmediato', iconPath: 'M1 4h22v16H1z M1 10h22' },
    { id: 'transferencia', label: 'Transferencia bancaria', desc: 'Envía comprobante por WhatsApp para confirmar', iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'efectivo', label: 'Efectivo / Contra entrega', desc: 'Coordina pago y entrega con nosotros', iconPath: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && step !== 'confirmado' && cerrar()}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,.2)', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '22px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              {step === 'datos' && 'Datos de envío'}
              {step === 'pago' && 'Método de pago'}
              {step === 'confirmado' && 'Pedido confirmado'}
            </h3>
            {step !== 'confirmado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {[['datos', '1', 'Datos'], ['pago', '2', 'Pago']].map(([s, n, label], i) => {
                  const done = step === 'pago' && s === 'datos'
                  const active = step === s
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: active || done ? 'var(--blue)' : 'var(--gray3)', color: active || done ? '#fff' : 'var(--text2)', transition: 'all .25s' }}>{done ? '✓' : n}</div>
                      <span style={{ fontSize: 11, color: active ? 'var(--blue)' : 'var(--text2)', fontWeight: active ? 700 : 400 }}>{label}</span>
                      {i === 0 && <div style={{ width: 24, height: 1, background: 'var(--gray3)' }} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {step !== 'confirmado' && (
            <button onClick={cerrar} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text2)', lineHeight: 1, padding: 4, marginTop: -4 }}>×</button>
          )}
        </div>

        <div style={{ padding: '20px 28px 28px' }}>

          {/* STEP 1: Datos */}
          {step === 'datos' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={lbl}>Nombre completo *</label><input style={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>
                <div><label style={lbl}>Teléfono *</label><input style={inp} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="5555-5555" onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={lbl}>NIT</label><input style={inp} value={form.nit} onChange={e => set('nit', e.target.value)} placeholder="CF" onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>
                <div><label style={lbl}>Dirección de entrega *</label><input style={inp} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Guastatoya, El Progreso..." onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label style={lbl}>Notas</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 64 }} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Instrucciones de entrega..." onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>

              {/* Resumen */}
              <div style={{ background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                    <span>{i.nombre} × {i.qty}</span>
                    <span>Q {(i.precio * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--gray3)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
                  <span>IVA (5%)</span><span>Q {iva.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: 'var(--blue)', marginTop: 6 }}>
                  <span>Total</span><span>Q {total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={irAPago} style={{ width: '100%', padding: '13px 0', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Continuar al pago
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          )}

          {/* STEP 2: Pago */}
          {step === 'pago' && (
            <>
              {/* Method selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {METODOS.map(m => (
                  <button key={m.id} onClick={() => setMetodoPago(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: `2px solid ${metodoPago === m.id ? 'var(--blue)' : 'var(--gray3)'}`, borderRadius: 12, background: metodoPago === m.id ? 'var(--blue-light)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', fontFamily: 'DM Sans, sans-serif' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 9, background: metodoPago === m.id ? 'var(--blue)' : 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={metodoPago === m.id ? '#fff' : 'var(--text2)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        {m.iconPath.split(' M').map((d, i) => <path key={i} d={i === 0 ? d : 'M' + d} />)}
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: metodoPago === m.id ? 'var(--blue)' : 'var(--text)' }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{m.desc}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${metodoPago === m.id ? 'var(--blue)' : 'var(--gray3)'}`, background: metodoPago === m.id ? 'var(--blue)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                      {metodoPago === m.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Tarjeta: Stripe Elements */}
              {metodoPago === 'tarjeta' && (
                <>
                  {!clientSecret ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ width: 28, height: 28, border: '2px solid var(--gray3)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
                      <p style={{ fontSize: 13, color: 'var(--text2)' }}>Preparando pago seguro...</p>
                    </div>
                  ) : stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#2B7FD4', borderRadius: '9px', fontFamily: 'DM Sans, sans-serif' } } }}>
                      <PaymentForm total={total} onPaid={onPagoTarjetaExitoso} onBack={() => setStep('datos')} loading={loading} setLoading={setLoading} />
                    </Elements>
                  ) : (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 14, fontSize: 13, color: '#92400e', marginBottom: 16 }}>
                      Stripe no está configurado. Usa transferencia o efectivo.
                    </div>
                  )}
                </>
              )}

              {/* Transferencia */}
              {metodoPago === 'transferencia' && (
                <>
                  <div style={{ background: 'var(--gray2)', border: '1px solid var(--gray3)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--text)' }}>Datos para transferencia</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                      {[['Banco', 'Banco Industrial'], ['Cuenta', '000-000000-0'], ['A nombre de', 'WebSoft Solutions'], ['NIT', '1234567-8']].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{l}</div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 12, color: '#d97706', background: '#fffbeb', borderRadius: 6, padding: '8px 10px' }}>
                      Despues de pagar, envía el comprobante por WhatsApp al 3671-4377 para confirmar tu pedido.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setStep('datos')} style={{ padding: '12px 18px', background: 'var(--gray2)', color: 'var(--text2)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Atrás
                    </button>
                    <button onClick={confirmarOtroMetodo} disabled={loading} style={{ flex: 1, padding: '13px 0', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {loading ? 'Registrando...' : 'Confirmar y enviar comprobante'}
                    </button>
                  </div>
                </>
              )}

              {/* Efectivo */}
              {metodoPago === 'efectivo' && (
                <>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Coordinación por WhatsApp</div>
                    Registraremos tu pedido y te contactaremos para coordinar la entrega y el pago en persona.
                    <div style={{ marginTop: 8, fontWeight: 600 }}>Total a pagar: Q {total.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setStep('datos')} style={{ padding: '12px 18px', background: 'var(--gray2)', color: 'var(--text2)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Atrás
                    </button>
                    <button onClick={confirmarOtroMetodo} disabled={loading} style={{ flex: 1, padding: '13px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {loading ? 'Registrando...' : 'Confirmar pedido'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 3: Confirmado */}
          {step === 'confirmado' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
                {metodoPago === 'tarjeta' ? 'Pago exitoso' : 'Pedido registrado'}
              </h3>
              {numeroPedido && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 18, color: 'var(--blue)', fontWeight: 700, marginBottom: 12 }}>{numeroPedido}</div>}
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
                {metodoPago === 'tarjeta'
                  ? `Tu pago fue procesado. Prepararemos tu pedido y te contactaremos al ${form.telefono} para coordinar la entrega.`
                  : `Pedido registrado. Te contactaremos pronto al ${form.telefono} para confirmar.`
                }
              </p>
              <button onClick={cerrar} style={{ padding: '12px 32px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
