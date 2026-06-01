'use client'
import { CartItem } from '@/lib/types'
import { IVA, WA } from '@/lib/constants'
import { useState } from 'react'

interface Props {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onQty: (id: number, delta: number) => void
  onRemove: (id: number) => void
  onPedido: () => void
}

export default function CartDrawer({ open, items, onClose, onQty, onRemove, onPedido }: Props) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const iva = subtotal * IVA
  const total = subtotal + iva

  const pedirWA = () => {
    const lines = ['Hola WebSoft Solutions! Quisiera solicitar:\n']
    items.forEach(i => lines.push(`- ${i.nombre} x${i.qty} = Q ${(i.precio * i.qty).toFixed(2)}`))
    lines.push(`\nTotal (con IVA 5%): Q ${total.toFixed(2)}`)
    lines.push('\nUbicación: Guastatoya / El Progreso / Guatemala.')
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
  }

  return (
    <>
      {/* Overlay */}
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 499 }} />}

      {/* Drawer */}
      <div className='cart-glass' style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(400px, 100vw)',
        background: '#fff', zIndex: 500,
        boxShadow: '-8px 0 40px rgba(0,0,0,.12)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--gray3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, fontWeight: 700 }}>Carrito de compras</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text2)', lineHeight: 1 }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}></div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>El carrito está vacío</p>
              <p style={{ fontSize: 13 }}>Agrega productos del catálogo</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray3)' }}>
              {item.imagenUrl
                ? <img src={item.imagenUrl} alt={item.nombre} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: 'var(--gray2)', flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}></div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>Q {item.precio.toFixed(2)} c/u</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <button onClick={() => onQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1.5px solid var(--gray3)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>-</button>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => onQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1.5px solid var(--gray3)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>+</button>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 18, marginLeft: 'auto' }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 22px', borderTop: '1px solid var(--gray3)', background: 'var(--gray2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            <span>Total:</span><span>Q {total.toFixed(2)}</span>
          </div>
          {items.length > 0 && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Incluye IVA (5%): Q {iva.toFixed(2)}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={onPedido} style={{ width: '100%', padding: 12, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Finalizar compra
            </button>
            <button onClick={pedirWA} style={{ width: '100%', padding: 12, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Solicitar por WhatsApp
            </button>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){div[style*="width: 400px"]{width:100%!important}}`}</style>
    </>
  )
}
