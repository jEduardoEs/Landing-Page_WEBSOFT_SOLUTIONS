'use client'
import { useState } from 'react'
import { CartItem, PedidoForm } from '@/lib/types'
import { POS_URL, WA, IVA } from '@/lib/constants'

interface Props {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

type Step = 'datos' | 'pago' | 'confirmado'
type MetodoPago = 'tarjeta' | 'whatsapp' | 'transferencia'

export default function CheckoutModal({ open, items, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('datos')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('tarjeta')
  const [loading, setLoading] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [form, setForm] = useState<PedidoForm>({
    nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: ''
  })

  if (!open) return null

  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const iva = subtotal * IVA
  const total = subtotal + iva

  const set = (k: keyof PedidoForm, v: string) => setForm(p => ({ ...p, [k]: v }))

  const irAPago = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) { alert('Nombre y teléfono son requeridos'); return }
    if (!form.direccion.trim()) { alert('La dirección de entrega es requerida'); return }
    setStep('pago')
  }

  const confirmarPedido = async () => {
    setLoading(true)
    try {
      // 1. Register order in POS
      const res = await fetch(`${POS_URL}/api/tienda/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: form.nombre,
          clienteEmail: form.email || `${form.telefono}@ws.gt`,
          clienteTelefono: form.telefono,
          clienteNit: form.nit || 'CF',
          clienteDireccion: form.direccion,
          notas: `Método de pago: ${metodoPago}. ${form.notas}`.trim(),
          items: items.map(i => ({
            productoId: i.id, nombre: i.nombre,
            precio: i.precio, cantidad: i.qty, imagenUrl: i.imagenUrl,
          })),
        }),
      })
      const data = await res.json()

      if (data.ok) {
        setNumeroPedido(data.numero)

        if (metodoPago === 'tarjeta') {
          // 2. Create Stripe checkout session
          const stripeRes = await fetch(`${POS_URL}/api/tienda/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map(i => ({ nombre: i.nombre, precio: i.precio, cantidad: i.qty, imagenUrl: i.imagenUrl })),
              clienteEmail: form.email || undefined,
              successUrl: `${window.location.origin}/gracias?pedido=${data.numero}`,
              cancelUrl: `${window.location.origin}/catalogo`,
            }),
          })
          const stripeData = await stripeRes.json()
          if (stripeData.ok && stripeData.url) {
            // Redirect to Stripe
            window.location.href = stripeData.url
            return
          }
          // Stripe not configured - fallback to confirmed
        }

        // For WhatsApp/transfer: send WA notification and show confirmation
        if (metodoPago === 'whatsapp' || metodoPago === 'transferencia') {
          const metodoTexto = metodoPago === 'whatsapp' ? 'Contra entrega / efectivo' : 'Transferencia bancaria'
          const lines = [
            `Hola WebSoft Solutions! Realicé un pedido en línea.`,
            ``,
            `Pedido: ${data.numero}`,
            `Nombre: ${form.nombre}`,
            `Teléfono: ${form.telefono}`,
            `Dirección: ${form.direccion}`,
            `Método de pago: ${metodoTexto}`,
            ``,
            `Productos:`,
            ...items.map(i => `- ${i.nombre} x${i.qty} = Q ${(i.precio * i.qty).toFixed(2)}`),
            ``,
            `Total: Q ${total.toFixed(2)}`,
          ]
          window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
        }

        setStep('confirmado')
        onSuccess()
      } else {
        alert('Error al procesar: ' + (data.error || 'Intenta de nuevo'))
      }
    } catch {
      alert('Sin conexión. Por favor intenta de nuevo.')
    }
    setLoading(false)
  }

  const cerrar = () => {
    setStep('datos')
    setMetodoPago('tarjeta')
    setForm({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })
    onClose()
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray3)', borderRadius: 9, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', outline: 'none', transition: 'border-color .2s', background: '#fff' }

  const METODOS: { id: MetodoPago; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'tarjeta',
      label: 'Tarjeta de crédito / débito',
      desc: 'Pago seguro con Visa, Mastercard o American Express',
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      id: 'transferencia',
      label: 'Transferencia bancaria',
      desc: 'Envía comprobante por WhatsApp para confirmar tu pedido',
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      label: 'Efectivo / Contra entrega',
      desc: 'Coordina el pago y entrega directamente con nosotros',
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && step !== 'confirmado' && cerrar()}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '22px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              {step === 'datos' && 'Datos de envío'}
              {step === 'pago' && 'Método de pago'}
              {step === 'confirmado' && 'Pedido confirmado'}
            </h3>
            {/* Steps indicator */}
            {step !== 'confirmado' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {[['datos','1','Datos'],['pago','2','Pago']].map(([s, n, label], i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step === s ? 'var(--blue)' : (step === 'pago' && s === 'datos') ? 'var(--blue)' : 'var(--gray3)', color: (step === s || (step === 'pago' && s === 'datos')) ? '#fff' : 'var(--text2)', transition: 'all .25s' }}>{n}</div>
                    <span style={{ fontSize: 11, color: step === s ? 'var(--blue)' : 'var(--text2)', fontWeight: step === s ? 700 : 400 }}>{label}</span>
                    {i === 0 && <div style={{ width: 24, height: 1, background: 'var(--gray3)' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {step !== 'confirmado' && (
            <button onClick={cerrar} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text2)', lineHeight: 1, padding: 4 }}>×</button>
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
              <div style={{ marginBottom: 20 }}><label style={lbl}>Notas adicionales</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 64 }} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Instrucciones de entrega..." onFocus={e => (e.target.style.borderColor = 'var(--blue)')} onBlur={e => (e.target.style.borderColor = 'var(--gray3)')} /></div>

              {/* Order summary */}
              <div style={{ background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                    <span>{i.nombre} × {i.qty}</span>
                    <span>Q {(i.precio * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--gray3)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
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
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18 }}>Selecciona cómo quieres pagar tu pedido.</p>

              {/* Payment method carousel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {METODOS.map(m => (
                  <button key={m.id} onClick={() => setMetodoPago(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `2px solid ${metodoPago === m.id ? 'var(--blue)' : 'var(--gray3)'}`, borderRadius: 12, background: metodoPago === m.id ? 'var(--blue-light)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', fontFamily: 'DM Sans, sans-serif' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: metodoPago === m.id ? 'var(--blue)' : 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: metodoPago === m.id ? '#fff' : 'var(--text2)', transition: 'all .2s' }}>
                      {m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: metodoPago === m.id ? 'var(--blue)' : 'var(--text)', marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.desc}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${metodoPago === m.id ? 'var(--blue)' : 'var(--gray3)'}`, background: metodoPago === m.id ? 'var(--blue)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                      {metodoPago === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Info for each method */}
              {metodoPago === 'tarjeta' && (
                <div style={{ background: '#eff6ff', border: '1px solid var(--blue-mid)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--blue)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Pago seguro con Stripe
                  </div>
                  Serás redirigido a la pasarela de pago seguro. Tu información financiera nunca llega a nuestros servidores.
                </div>
              )}
              {metodoPago === 'transferencia' && (
                <div style={{ background: 'var(--gray2)', border: '1px solid var(--gray3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Datos bancarios</div>
                  <div style={{ color: 'var(--text2)', lineHeight: 1.8 }}>
                    Banco: <strong>Banco Industrial</strong><br />
                    Cuenta: <strong>000-000000-0</strong><br />
                    A nombre de: <strong>WebSoft Solutions</strong><br />
                    NIT: <strong>1234567-8</strong>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#d97706' }}>Envía tu comprobante por WhatsApp para confirmar el pedido.</div>
                </div>
              )}
              {metodoPago === 'whatsapp' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#166534' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Coordinación por WhatsApp</div>
                  Te enviaremos los detalles de entrega y coordinaremos el pago en persona o por transferencia al momento de recibir tu pedido.
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('datos')} style={{ padding: '12px 20px', background: 'var(--gray2)', color: 'var(--text2)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Atrás
                </button>
                <button onClick={confirmarPedido} disabled={loading} style={{ flex: 1, padding: '13px 0', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Procesando...' : metodoPago === 'tarjeta' ? 'Pagar con tarjeta' : 'Confirmar pedido'}
                </button>
              </div>
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
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pedido Recibido</h3>
              {numeroPedido && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 18, color: 'var(--blue)', fontWeight: 700, marginBottom: 12 }}>{numeroPedido}</div>}
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
                Hemos recibido tu pedido. Te contactaremos pronto al <strong>{form.telefono}</strong> para confirmar disponibilidad y coordinar la entrega.
              </p>
              <button onClick={cerrar} style={{ padding: '12px 32px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
