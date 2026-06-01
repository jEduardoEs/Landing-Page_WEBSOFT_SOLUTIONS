'use client'
import { useState, useEffect } from 'react'
import { CartItem, PedidoForm } from '@/lib/types'
import { POS_URL, WA, IVA } from '@/lib/constants'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

type Step = 'datos' | 'metodo' | 'resumen' | 'pago' | 'confirmado'
type MetodoPago = 'tarjeta' | 'transferencia' | 'efectivo'

interface Props {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

// ── Stripe payment form ──────────────────────────────────────────────────────
function PaymentForm({ total, onPaid, onBack, loading, setLoading }: {
  total: number; onPaid: () => void; onBack: () => void
  loading: boolean; setLoading: (v: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')

  const pagar = async () => {
    if (!stripe || !elements) return
    setLoading(true); setError('')
    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message || 'Error'); setLoading(false); return }
    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/gracias` },
      redirect: 'if_required',
    })
    if (confirmErr) { setError(confirmErr.message || 'Pago rechazado'); setLoading(false) }
    else onPaid()
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <PaymentElement options={{ layout: 'tabs', fields: { billingDetails: { address: { country: 'never' } } } }} />
      </div>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style={{ fontSize: 11, color: '#166534' }}>Pago seguro con cifrado SSL. Tus datos no se almacenan en nuestros servidores.</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Atrás
        </button>
        <button onClick={pagar} disabled={loading || !stripe || !elements}
          style={{ flex: 1, padding: '13px 0', background: loading ? '#94a3b8' : '#2B7FD4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
                Procesando...
              </span>
            : `Pagar Q ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function CheckoutModal({ open, items, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('datos')
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta')
  const [loading, setLoading] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [form, setForm] = useState<PedidoForm>({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })

  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const iva = subtotal * IVA
  const total = subtotal + iva

  // Create PaymentIntent only when user reaches pago step with tarjeta
  useEffect(() => {
    if (step === 'pago' && metodo === 'tarjeta' && !clientSecret) {
      fetch('/api/create-payment-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'gtq', metadata: { cliente: form.nombre, telefono: form.telefono } }),
      }).then(r => r.json()).then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
    }
  }, [step, metodo, clientSecret, total, form.nombre, form.telefono])

  if (!open) return null

  const set = (k: keyof PedidoForm, v: string) => setForm(p => ({ ...p, [k]: v }))

  const registrarPedido = async (estado: 'pendiente' | 'pagado') => {
    try {
      const res = await fetch(`${POS_URL}/api/tienda/pedidos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: form.nombre, clienteEmail: form.email || `${form.telefono}@ws.gt`,
          clienteTelefono: form.telefono, clienteNit: form.nit || 'CF',
          clienteDireccion: form.direccion, notas: `Método: ${metodo}. ${form.notas}`.trim(),
          estado,
          items: items.map(i => ({ productoId: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.qty, imagenUrl: i.imagenUrl })),
        }),
      })
      const data = await res.json()
      if (data.ok) setNumeroPedido(data.numero)
      return data
    } catch { return null }
  }

  const irAMetodo = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) { alert('Nombre y teléfono son requeridos'); return }
    if (!form.direccion.trim()) { alert('La dirección de entrega es requerida'); return }
    setStep('metodo')
  }

  const irAResumen = () => setStep('resumen')

  const irAPago = () => {
    setClientSecret('')
    setStep('pago')
  }

  const onPagoExitoso = async () => {
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
      const metodoTexto = metodo === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo / contra entrega'
      const lines = [`Hola WebSoft! Pedido: ${data.numero}`, `Nombre: ${form.nombre}`, `Tel: ${form.telefono}`, `Dirección: ${form.direccion}`, `Pago: ${metodoTexto}`, `Total: Q ${total.toFixed(2)}`]
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
      setStep('confirmado')
      onSuccess()
    } else alert('Error al registrar. Intenta de nuevo.')
  }

  const cerrar = () => {
    if (loading) return
    setStep('datos'); setMetodo('tarjeta'); setClientSecret('')
    setForm({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })
    onClose()
  }

  const STEPS = [
    { id: 'datos', label: 'Datos' },
    { id: 'metodo', label: 'Pago' },
    { id: 'resumen', label: 'Resumen' },
    { id: 'pago', label: 'Confirmar' },
  ]
  const stepIdx = STEPS.findIndex(s => s.id === step)

  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#1a1f36', outline: 'none', background: '#fff', transition: 'border-color .2s' }

  const METODOS = [
    { id: 'tarjeta' as MetodoPago, label: 'Tarjeta de crédito / débito', desc: 'Visa, Mastercard — pago inmediato y seguro', icon: 'M1 4h22v16H1z M1 10h22' },
    { id: 'transferencia' as MetodoPago, label: 'Transferencia bancaria', desc: 'Envía tu comprobante por WhatsApp', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'efectivo' as MetodoPago, label: 'Efectivo / Contra entrega', desc: 'Coordina entrega y pago con nosotros', icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}
      onClick={e => e.target === e.currentTarget && step !== 'confirmado' && cerrar()}>
      <div style={{ background: '#fff', borderRadius: '18px 18px 0 0', width: '100%', maxWidth: 540, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,.2)' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              {step === 'datos' && 'Datos de envío'}
              {step === 'metodo' && 'Método de pago'}
              {step === 'resumen' && 'Resumen del pedido'}
              {step === 'pago' && 'Pago con tarjeta'}
              {step === 'confirmado' && 'Pedido confirmado'}
            </h3>
            {/* Steps */}
            {step !== 'confirmado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {STEPS.map((s, i) => {
                  const done = i < stepIdx
                  const active = s.id === step
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: done || active ? '#2B7FD4' : '#f1f5f9', color: done || active ? '#fff' : '#94a3b8', transition: 'all .2s', flexShrink: 0 }}>
                        {done ? '' : i + 1}
                      </div>
                      <span style={{ fontSize: 10, color: active ? '#2B7FD4' : '#94a3b8', fontWeight: active ? 700 : 400 }}>{s.label}</span>
                      {i < STEPS.length - 1 && <div style={{ width: 16, height: 1, background: '#e2e8f0', margin: '0 2px' }} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {step !== 'confirmado' && (
            <button onClick={cerrar} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>

          {/* STEP 1: Datos */}
          {step === 'datos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>Nombre *</label><input style={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
                <div><label style={lbl}>Teléfono *</label><input style={inp} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="5555-5555" onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
              </div>
              <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>NIT</label><input style={inp} value={form.nit} onChange={e => set('nit', e.target.value)} placeholder="CF" onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
                <div><label style={lbl}>Dirección *</label><input style={inp} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Guastatoya..." onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
              </div>
              <div><label style={lbl}>Notas</label><textarea style={{ ...inp, resize: 'none', minHeight: 60 }} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Instrucciones especiales..." onFocus={e => (e.target.style.borderColor = '#2B7FD4')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} /></div>
              <button onClick={irAMetodo} style={{ width: '100%', padding: '14px 0', background: '#2B7FD4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                Continuar
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* STEP 2: Metodo */}
          {step === 'metodo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {METODOS.map(m => (
                <button key={m.id} onClick={() => setMetodo(m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `2px solid ${metodo === m.id ? '#2B7FD4' : '#e2e8f0'}`, borderRadius: 12, background: metodo === m.id ? '#eff6ff' : '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: metodo === m.id ? '#2B7FD4' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={metodo === m.id ? '#fff' : '#64748b'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      {m.icon.split(' M').map((d, i) => <path key={i} d={i === 0 ? d : 'M' + d} />)}
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: metodo === m.id ? '#1e40af' : '#0f172a' }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.desc}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${metodo === m.id ? '#2B7FD4' : '#e2e8f0'}`, background: metodo === m.id ? '#2B7FD4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                    {metodo === m.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setStep('datos')} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Atrás</button>
                <button onClick={irAResumen} style={{ flex: 1, padding: '13px 0', background: '#2B7FD4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Ver resumen</button>
              </div>
            </div>
          )}

          {/* STEP 3: Resumen */}
          {step === 'resumen' && (
            <div>
              {/* Cliente */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Datos de envío</div>
                <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.8 }}>
                  <strong>{form.nombre}</strong> · {form.telefono}<br />
                  {form.direccion}{form.nit && ` · NIT: ${form.nit}`}
                  {form.notas && <><br /><span style={{ color: '#64748b', fontSize: 12 }}>{form.notas}</span></>}
                </div>
              </div>
              {/* Método */}
              <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#2B7FD4" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>{METODOS.find(m => m.id === metodo)?.label}</span>
              </div>
              {/* Items */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                {items.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.nombre}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Q {item.precio.toFixed(2)} × {item.qty}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginLeft: 12 }}>Q {(item.precio * item.qty).toFixed(2)}</div>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                    <span>IVA (5%)</span><span>Q {iva.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#2B7FD4' }}>
                    <span>Total</span><span>Q {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('metodo')} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Atrás</button>
                {metodo === 'tarjeta'
                  ? <button onClick={irAPago} style={{ flex: 1, padding: '13px 0', background: '#2B7FD4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Ingresar datos de tarjeta</button>
                  : <button onClick={confirmarOtroMetodo} disabled={loading} style={{ flex: 1, padding: '13px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{loading ? 'Procesando...' : 'Confirmar pedido'}</button>}
              </div>
            </div>
          )}

          {/* STEP 4: Pago con tarjeta */}
          {step === 'pago' && (
            <div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Total a pagar</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#2B7FD4' }}>Q {total.toFixed(2)}</span>
              </div>
              {!clientSecret ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 28, height: 28, border: '2px solid #e2e8f0', borderTopColor: '#2B7FD4', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: '#64748b' }}>Preparando pago seguro...</p>
                </div>
              ) : stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#2B7FD4', borderRadius: '9px', fontFamily: 'DM Sans, sans-serif' } } }}>
                  <PaymentForm total={total} onPaid={onPagoExitoso} onBack={() => setStep('resumen')} loading={loading} setLoading={setLoading} />
                </Elements>
              ) : (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 14, fontSize: 13, color: '#92400e' }}>
                  Stripe no configurado. Usa transferencia o efectivo.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Confirmado */}
          {step === 'confirmado' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                {metodo === 'tarjeta' ? 'Pago exitoso' : 'Pedido registrado'}
              </h3>
              {numeroPedido && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 18, color: '#2B7FD4', fontWeight: 700, marginBottom: 12 }}>{numeroPedido}</div>}
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                {metodo === 'tarjeta'
                  ? `Pago procesado. Prepararemos tu pedido y te contactaremos al ${form.telefono}.`
                  : `Pedido registrado. Te contactaremos pronto al ${form.telefono}.`}
              </p>
              <button onClick={cerrar} style={{ padding: '12px 32px', background: '#2B7FD4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cerrar</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
