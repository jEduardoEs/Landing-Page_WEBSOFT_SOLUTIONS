'use client'
import { Producto } from '@/lib/types'
import { WA, CATEGORY_ICONS } from '@/lib/constants'

interface Props {
  producto: Producto
  onAddCart: (p: Producto) => void
}

export default function ProductCard({ producto: p, onAddCart }: Props) {
  const agotado = p.stock === 0
  const pocaExistencia = p.stock > 0 && p.stock <= 5

  const solicitar = () => {
    const msg = `Hola WebSoft Solutions! Me interesa:\n\nProducto: ${p.nombre}\nPrecio: Q ${p.precio.toFixed(2)}\n\nSolicito más información y disponibilidad.`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--gray3)', borderRadius: 16,
      padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', transition: 'all .25s',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--blue)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(43,127,212,.12)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--gray3)'; el.style.transform = ''; el.style.boxShadow = '' }}
    >
      {/* Badges */}
      {agotado && <div style={{ position: 'absolute', top: 10, left: 10, background: '#fef2f2', color: '#dc2626', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>Agotado</div>}
      {pocaExistencia && <div style={{ position: 'absolute', top: 10, left: 10, background: '#fef3c7', color: '#d97706', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>Últimas {p.stock} unidades</div>}

      {/* Image or placeholder */}
      {p.imagenUrl
        ? <img src={p.imagenUrl} alt={p.nombre} style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 12px', display: 'block', borderRadius: 8 }} onError={e => { e.currentTarget.style.display = 'none' }} />
        : <div style={{ width: 80, height: 80, margin: '0 auto 12px', background: 'var(--blue-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              {(CATEGORY_ICONS[p.categoria || ''] || 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z').split(' M').map((d, i) => (
                <path key={i} d={i === 0 ? d : 'M' + d} />
              ))}
            </svg>
          </div>
      }

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{p.categoria}</div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, color: 'var(--text)' }}>{p.nombre}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 12, flex: 1 }}>{p.descripcion}</div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--blue)', marginBottom: 12 }}>Q {p.precio.toFixed(2)}</div>

      <div style={{ display: 'flex', gap: 8 }}>
        {/* Main button: Add to cart */}
        <button onClick={() => !agotado && onAddCart(p)} disabled={agotado}
          style={{ flex: 1, background: agotado ? 'var(--gray3)' : 'var(--blue)', color: agotado ? 'var(--text2)' : '#fff', border: 'none', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: agotado ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .2s' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {agotado ? 'Agotado' : 'Añadir al carrito'}
        </button>
        {/* Secondary: WhatsApp info */}
        <button onClick={solicitar} title="Consultar por WhatsApp"
          style={{ background: 'var(--blue-light)', color: 'var(--blue)', border: '1.5px solid var(--blue-mid)', padding: '10px 11px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--green)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--blue)' }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
