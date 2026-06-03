'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import Footer from '@/components/Footer'
import WAButton from '@/components/WAButton'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import CuotasModal from '@/components/CuotasModal'
import { Producto, CartItem } from '@/lib/types'
import { POS_URL, WA, CATEGORY_ICONS } from '@/lib/constants'

const CAT_ICON = (cat: string) =>
  CATEGORY_ICONS[cat] || 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'

// Parse specs from description text
function parseSpecs(desc: string | null): { label: string; value: string }[] | null {
  if (!desc) return null
  const lines = desc.split(/[-·•\n]/).map(l => l.trim()).filter(l => l.length > 4 && l.length < 80)
  if (lines.length < 2) return null
  return lines.slice(0, 6).map(l => {
    const colon = l.indexOf(':')
    if (colon > 0 && colon < 20) return { label: l.slice(0, colon).trim(), value: l.slice(colon + 1).trim() }
    return { label: '', value: l }
  })
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [producto, setProducto] = useState<Producto | null>(null)
  const [relacionados, setRelacionados] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [pedidoOpen, setPedidoOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [cuotasOpen, setCuotasOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch(`${POS_URL}/api/tienda/productos`)
      .then(r => r.json())
      .then(d => {
        const prods: Producto[] = d.productos || []
        const found = prods.find(p => p.id === Number(id))
        if (!found) { setNotFound(true); setLoading(false); return }
        setProducto(found)
        setRelacionados(prods.filter(p => p.id !== found.id && p.categoria === found.categoria).slice(0, 4))
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  const addCart = (p: Producto, q = 1) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === p.id)
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: Math.min(x.qty + q, p.stock) } : x)
      return [...prev, { ...p, qty: q }]
    })
    setAdded(true)
    setCartOpen(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const changeQty = (id: number, delta: number) => setCart(prev =>
    prev.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0)
  )

  const openWA = () => {
    if (!producto) return
    const msg = `Hola WebSoft Solutions! Me interesa:\n\nProducto: ${producto.nombre}\nCódigo: ${producto.codigo || 'S/C'}\nPrecio: Q ${producto.precio.toFixed(2)}\n\nSolicito más información y disponibilidad.`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const agotado = producto?.stock === 0
  const pocaExistencia = producto && producto.stock > 0 && producto.stock <= 5
  const specs = producto ? parseSpecs(producto.descripcion) : null

  const S = {
    page: { background: '#f4f7fb', minHeight: '100vh' } as React.CSSProperties,
    container: { maxWidth: 1140, margin: '0 auto', padding: '40px 24px 80px' } as React.CSSProperties,
    bread: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a5568', marginBottom: 28, flexWrap: 'wrap' as const },
    breadLink: { color: '#2B7FD4', textDecoration: 'none' },
    card: { background: '#fff', border: '1.5px solid #e2eaf4', borderRadius: 18, padding: 32 } as React.CSSProperties,
    mainImg: { background: '#f4f7fb', borderRadius: 14, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 12, border: '1.5px solid #e2eaf4' } as React.CSSProperties,
    thumb: (active: boolean) => ({ width: 60, height: 60, borderRadius: 10, border: `2px solid ${active ? '#2B7FD4' : '#e2eaf4'}`, background: '#f4f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color .2s' } as React.CSSProperties),
    cat: { fontSize: 11, fontWeight: 700, color: '#2B7FD4', textTransform: 'uppercase' as const, letterSpacing: 1.2, marginBottom: 8 },
    name: { fontFamily: 'Rajdhani, sans-serif', fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: '#1a1f36', marginBottom: 8 },
    sku: { fontSize: 11, color: '#aab4c4', fontFamily: 'monospace', marginBottom: 16 },
    price: { fontFamily: 'Rajdhani, sans-serif', fontSize: 38, fontWeight: 700, color: '#2B7FD4', marginBottom: 4 },
    priceNote: { fontSize: 12, color: '#4a5568', marginBottom: 20 },
    stockOk: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a', fontWeight: 600, marginBottom: 20 },
    stockOut: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dc2626', fontWeight: 600, marginBottom: 20 },
    stockLow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d97706', fontWeight: 600, marginBottom: 20 },
    badges: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 },
    badge: { fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 600, background: '#e8f3fd', color: '#1a5fa0', display: 'flex', alignItems: 'center', gap: 5 } as React.CSSProperties,
    divider: { height: '1px', background: '#e2eaf4', margin: '20px 0' },
    desc: { fontSize: 14, color: '#4a5568', lineHeight: 1.75, marginBottom: 20 },
    specTable: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13, marginBottom: 20 },
    qtyWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    qtyBtn: { width: 36, height: 36, borderRadius: 8, border: '1.5px solid #e2eaf4', background: '#f4f7fb', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#1a1f36' } as React.CSSProperties,
    btnBuy: (dis: boolean) => ({ background: dis ? '#aab4c4' : '#2B7FD4', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: dis ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'DM Sans, sans-serif', width: '100%', marginBottom: 10, transition: 'background .2s' } as React.CSSProperties),
    btnWA: { background: '#f0fdf4', color: '#15803d', border: '1.5px solid #bbf7d0', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', width: '100%', marginBottom: 20 } as React.CSSProperties,
    trust: { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
    trustItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a5568' },
  }

  if (loading) return (
    <>
      <Navbar cartCount={0} onCartOpen={() => {}} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2eaf4', borderTopColor: '#2B7FD4', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#4a5568' }}>Cargando producto...</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  if (notFound || !producto) return (
    <>
      <Navbar cartCount={0} onCartOpen={() => {}} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#2B7FD4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .4, marginBottom: 16 }}>
          <rect x="2" y="7" width="20" height="15" rx="2"/>
          <polyline points="16 2 12 6 8 2"/>
        </svg>
        <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, color: '#1a1f36' }}>Producto no encontrado</h2>
        <Link href="/catalogo" style={{ color: '#2B7FD4', fontWeight: 600, textDecoration: 'none' }}>← Volver al catálogo</Link>
      </div>
    </>
  )

  return (
    <>
      <Navbar cartCount={cart.reduce((s, x) => s + x.qty, 0)} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={changeQty} onRemove={id => setCart(p => p.filter(x => x.id !== id))} onPedido={() => { setCartOpen(false); setPedidoOpen(true) }} />
      <CheckoutModal open={pedidoOpen} items={cart} onClose={() => setPedidoOpen(false)} onSuccess={() => setCart([])} />

      {/* Hero bar */}
      <div style={{ background: 'linear-gradient(135deg, #0d0f1a 0%, #0f1530 100%)', height: 80, display: 'flex', alignItems: 'center', paddingTop: 64 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', width: '100%', ...S.bread }}>
          <Link href="/" style={S.breadLink}>Inicio</Link>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          <Link href="/catalogo" style={S.breadLink}>Catálogo</Link>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'rgba(255,255,255,.5)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{producto.categoria}</span>
        </div>
      </div>

      <div style={S.page}>
        <div className='detail-container' style={S.container}>

          {/* Main card */}
          <div className='detail-grid-2 detail-card' style={S.card}>

            {/* LEFT: Gallery */}
            <div>
              <div style={S.mainImg}>
                {agotado && <div style={{ position: 'absolute', top: 14, left: 14, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Agotado</div>}
                {pocaExistencia && <div style={{ position: 'absolute', top: 14, left: 14, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Últimas {producto.stock} unidades</div>}
                {producto.imagenUrl
                  ? <img src={producto.imagenUrl} alt={producto.nombre} style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                  : <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="#2B7FD4" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .2 }}>
                      {CAT_ICON(producto.categoria || '').split(' M').map((d, i) => <path key={i} d={i === 0 ? d : 'M' + d} />)}
                    </svg>
                }
              </div>
              {/* Thumbnails — same image for now, future multiple images */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={S.thumb(activeImg === i)} onClick={() => setActiveImg(i)}>
                    {producto.imagenUrl && i === 0
                      ? <img src={producto.imagenUrl} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                      : <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={activeImg === i ? '#2B7FD4' : '#aab4c4'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          {CAT_ICON(producto.categoria || '').split(' M').map((d, j) => <path key={j} d={j === 0 ? d : 'M' + d} />)}
                        </svg>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Info */}
            <div>
              <div style={S.cat}>{producto.categoria}</div>
              <h1 className='detail-name' style={S.name}>{producto.nombre}</h1>
              <div style={S.sku}>
                {producto.codigo && `SKU: ${producto.codigo}`}
                {producto.codigo && ' · '}
                ID: {producto.id}
              </div>

              {/* Price */}
              <div className='detail-price' style={S.price}>Q {producto.precio.toFixed(2)}</div>
              <div style={S.priceNote}>IVA incluido · Precio en tienda Guastatoya</div>

              {/* Cuotas */}
              {producto.precio >= 100 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2eaf4', marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>
                    Cuotas desde <strong style={{ color: '#1a1f36' }}>Q {(producto.precio / 3).toFixed(2)}</strong> al mes
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {['/bancos/visa.png', '/bancos/mastercard.png', '/bancos/amex.png'].map(src => (
                      <img key={src} src={src} alt="" style={{ height: 18, width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    ))}
                  </div>
                  <button onClick={() => setCuotasOpen(true)} style={{ fontSize: 12, fontWeight: 600, color: '#2B7FD4', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', padding: 0 }}>
                    Ver cuotas
                  </button>
                </div>
              )}

              {/* Stock */}
              {agotado
                ? <div style={S.stockOut}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }} />Agotado temporalmente</div>
                : pocaExistencia
                ? <div style={S.stockLow}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', display: 'inline-block', flexShrink: 0 }} />Solo quedan {producto.stock} unidades</div>
                : <div style={S.stockOk}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />En stock — disponible ahora</div>
              }

              {/* Badges */}
              <div className='detail-badges' style={S.badges}>
                <div style={S.badge}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3L4 5v7c0 6 8 10 8 10z"/></svg>
                  12 meses garantía
                </div>
                <div style={S.badge}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Envío a Guatemala
                </div>
                <div style={S.badge}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Atención rápida
                </div>
              </div>

              <div style={S.divider} />

              {/* Description */}
              {producto.descripcion && (
                <p style={S.desc}>{producto.descripcion}</p>
              )}

              {/* Specs table */}
              {specs && specs.some(s => s.label) && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1f36', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Especificaciones</div>
                  <table style={S.specTable}>
                    <tbody>
                      {specs.filter(s => s.label).map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f4f7fb' }}>
                          <td style={{ padding: '7px 12px 7px 0', color: '#4a5568', width: '40%', verticalAlign: 'top' }}>{s.label}</td>
                          <td style={{ padding: '7px 0', color: '#1a1f36', fontWeight: 500 }}>{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Qty selector */}
              {!agotado && (
                <div className='detail-qty-row' style={S.qtyWrap}>
                  <span style={{ fontSize: 13, color: '#4a5568', fontWeight: 600 }}>Cantidad:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e2eaf4', borderRadius: 10, padding: '4px 8px' }}>
                    <button style={S.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center', color: '#1a1f36' }}>{qty}</span>
                    <button style={S.qtyBtn} onClick={() => setQty(q => Math.min(q + 1, producto.stock))}>+</button>
                  </div>
                  <span style={{ fontSize: 12, color: '#aab4c4' }}>máx. {producto.stock}</span>
                </div>
              )}

              {/* CTA buttons */}
              <button style={S.btnBuy(agotado)} onClick={() => !agotado && addCart(producto, qty)} disabled={agotado}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {agotado ? 'Agotado' : added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>

              <button style={S.btnWA} onClick={openWA}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar disponibilidad por WhatsApp
              </button>

              {/* Trust signals */}
              <div style={S.trust}>
                <div style={S.trustItem}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Producto original
                </div>
                <div style={S.trustItem}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Pago seguro
                </div>
                <div style={S.trustItem}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Soporte técnico incluido
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relacionados.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, color: '#1a1f36', marginBottom: 20 }}>
                Productos relacionados
              </h2>
              <div className='detail-related-4'>
                {relacionados.map(p => <ProductCard key={p.id} producto={p} onAddCart={addCart} />)}
              </div>
            </div>
          )}

        </div>
      </div>

      {cuotasOpen && producto && <CuotasModal precio={producto.precio} onClose={() => setCuotasOpen(false)} />}

      {/* Sticky buy bar - shows when user scrolls past the main price */}
      {producto && scrolled && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: '#fff', borderTop: '1.5px solid #e2eaf4',
          padding: '12px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, boxShadow: '0 -4px 20px rgba(0,0,0,.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            {producto.imagenUrl && (
              <img src={producto.imagenUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#f4f7fb', padding: 4, flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1f36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{producto.nombre}</div>
              <div style={{ fontSize: 12, color: '#2B7FD4', fontWeight: 700 }}>Q {producto.precio.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {!agotado && (
              <button onClick={() => addCart(producto, qty)} style={{ background: '#2B7FD4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                Agregar al carrito
              </button>
            )}
            <button onClick={openWA} style={{ background: '#f0fdf4', color: '#15803d', border: '1.5px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WA
            </button>
          </div>
        </div>
      )}

      <Footer />
      <WAButton />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
