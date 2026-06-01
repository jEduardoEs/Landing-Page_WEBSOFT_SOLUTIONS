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

export default function PedidoModal({ open, items, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<PedidoForm>({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const total = items.reduce((s, i) => s + i.precio * i.qty, 0) * (1 + IVA)
  const set = (k: keyof PedidoForm, v: string) => setForm(p => ({ ...p, [k]: v }))

  const enviar = async () => {
    if (!form.nombre.trim() || !form.telefono.trim()) { alert('Nombre y teléfono son requeridos'); return }
    setLoading(true)
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
          notas: form.notas,
          items: items.map(i => ({ productoId: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.qty, imagenUrl: i.imagenUrl })),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        onSuccess()
        onClose()
        setForm({ nombre: '', telefono: '', email: '', nit: '', direccion: '', notas: '' })
        alert(` Pedido ${data.numero} registrado. Te contactaremos pronto al ${form.telefono}.`)
        const msg = `Hola WebSoft! Pedido en línea: ${data.numero} - Nombre: ${form.nombre} - Tel: ${form.telefono}`
        window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
      } else {
        alert('Error: ' + (data.error || 'No se pudo enviar'))
      }
    } catch {
      alert('Sin conexión al servidor. Intenta por WhatsApp.')
    }
    setLoading(false)
  }

  const enviarWA = () => {
    const lines = ['Hola WebSoft! Quiero hacer un pedido:\n', `Nombre: ${form.nombre}`, `Tel: ${form.telefono}`]
    items.forEach(i => lines.push(`- ${i.nombre} x${i.qty} = Q ${(i.precio * i.qty).toFixed(2)}`))
    lines.push(`\nTOTAL: Q ${total.toFixed(2)}`)
    onClose()
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray3)', borderRadius: 9, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700 }}>Datos para tu pedido</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Te contactaremos para confirmar disponibilidad.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text2)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={lbl}>Nombre *</label><input style={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" /></div>
          <div><label style={lbl}>Teléfono *</label><input style={inp} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="5555-5555" /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" /></div>
        <div style={{ marginBottom: 14 }}><label style={lbl}>NIT</label><input style={inp} value={form.nit} onChange={e => set('nit', e.target.value)} placeholder="CF" /></div>
        <div style={{ marginBottom: 14 }}><label style={lbl}>Dirección de entrega</label><input style={inp} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Guastatoya, El Progreso..." /></div>
        <div style={{ marginBottom: 20 }}><label style={lbl}>Notas</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Instrucciones especiales..." /></div>

        {/* Resumen */}
        <div style={{ background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{items.length} producto{items.length !== 1 ? 's' : ''}</div>
          {items.map(i => <div key={i.id} style={{ color: 'var(--text2)' }}>{i.nombre} x{i.qty} — Q {(i.precio * i.qty).toFixed(2)}</div>)}
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8, color: 'var(--blue)' }}>Total: Q {total.toFixed(2)}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, background: 'var(--gray2)', color: 'var(--text2)', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
          <button onClick={enviarWA} style={{ padding: '12px 14px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>WA</button>
          <button onClick={enviar} disabled={loading} style={{ flex: 2, padding: 12, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {loading ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
