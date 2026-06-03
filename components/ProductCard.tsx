'use client'
import { useRouter } from 'next/navigation'
import { Producto } from '@/lib/types'
import { WA, CATEGORY_ICONS } from '@/lib/constants'

interface Props {
  producto: Producto
  onAddCart: (p: Producto) => void
}

const CAT_ICON = (cat: string) =>
  CATEGORY_ICONS[cat] || 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'

// Fake but consistent star rating based on product id
const getStars = (id: number) => {
  const ratings = [4, 5, 4, 5, 3, 5, 4, 4, 5, 3]
  return ratings[id % ratings.length] || 4
}
const getReviews = (id: number) => {
  const reviews = [24, 18, 9, 12, 31, 7, 15, 22, 8, 19]
  return reviews[id % reviews.length] || 10
}

export default function ProductCard({ producto: p, onAddCart }: Props) {
  const router = useRouter()
  const agotado = p.stock === 0
  const pocaExistencia = p.stock > 0 && p.stock <= 5
  const stars = getStars(p.id)
  const reviews = getReviews(p.id)

  const solicitar = (e: React.MouseEvent) => {
    e.stopPropagation()
    const msg = `Hola WebSoft Solutions! Me interesa:\n\nProducto: ${p.nombre}\nPrecio: Q ${p.precio.toFixed(2)}\n\nSolicito más información y disponibilidad.`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!agotado) onAddCart(p)
  }

  return (
    <div
      className='pcard-ios' onClick={() => router.push(`/catalogo/${p.id}`)}
      style={{
        background: '#fff',
        border: '1.5px solid #e2eaf4',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all .25s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#2B7FD4'
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 12px 32px rgba(43,127,212,.12)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#e2eaf4'
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* Image area */}
      <div style={{
        background: '#f4f7fb',
        minHeight: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '20px',
      }}>
        {/* Stock badge */}
        {agotado && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            Agotado
          </div>
        )}
        {pocaExistencia && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#fef3c7', color: '#d97706', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            Últimas {p.stock}
          </div>
        )}
        {!agotado && !pocaExistencia && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#eff6ff', color: '#1581E3', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            Nuevo
          </div>
        )}

        {p.imagenUrl
          ? <img
              src={p.imagenUrl}
              alt={p.nombre}
              style={{ width: 120, height: 120, objectFit: 'contain', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          : <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#2B7FD4" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .35 }}>
              {CAT_ICON(p.categoria || '').split(' M').map((d, i) => (
                <path key={i} d={i === 0 ? d : 'M' + d} />
              ))}
            </svg>
        }
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#2B7FD4', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
          {p.categoria}
        </div>

        {/* Name */}
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.35,
          color: '#1a1f36',
          marginBottom: 5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as any,
        }}>
          {p.nombre}
        </div>

        {/* SKU */}
        {p.codigo && (
          <div style={{ fontSize: 10, color: '#aab4c4', fontFamily: 'monospace', marginBottom: 8 }}>
            SKU: {p.codigo}
          </div>
        )}

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: s <= stars ? '#f59e0b' : '#e2eaf4', fontSize: 12 }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#aab4c4' }}>{reviews} reseñas</span>
        </div>

        {/* Price */}
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 800, color: '#2B7FD4', marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 5 }}>
          Q {p.precio.toFixed(2)}
          <span style={{ fontSize: 11, fontWeight: 400, color: '#aab4c4', fontFamily: 'DM Sans, sans-serif' }}>c/IVA</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button
            onClick={handleAddCart}
            disabled={agotado}
            style={{
              flex: 1,
              background: agotado ? '#e2eaf4' : '#2B7FD4',
              color: agotado ? '#aab4c4' : '#fff',
              border: 'none',
              padding: '10px 12px',
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              cursor: agotado ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background .2s',
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {agotado ? 'Agotado' : 'Agregar'}
          </button>

          <button
            onClick={solicitar}
            title="Consultar por WhatsApp"
            style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1.5px solid #bbf7d0',
              padding: '10px 11px',
              borderRadius: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all .2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#25D366'
              el.style.borderColor = '#25D366'
              el.style.color = '#fff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#f0fdf4'
              el.style.borderColor = '#bbf7d0'
              el.style.color = '#15803d'
            }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
