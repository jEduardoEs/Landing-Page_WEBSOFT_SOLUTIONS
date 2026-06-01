'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import WAButton from '@/components/WAButton'
import { Producto, CartItem } from '@/lib/types'
import { POS_URL, FALLBACK_PRODUCTOS } from '@/lib/constants'

function CatalogoContent() {
  const searchParams = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [filtrados, setFiltrados] = useState<Producto[]>([])
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || '')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [pedidoOpen, setPedidoOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${POS_URL}/api/tienda/productos`)
      .then(r => r.json())
      .then(d => {
        const prods = d.productos || []
        setProductos(prods)
        setCategorias(d.categorias || [])
        setLoading(false)
      })
      .catch(() => {
        setProductos(FALLBACK_PRODUCTOS as Producto[])
        setCategorias(['Periféricos','CCTV','Componentes PC','Accesorios','Cables'])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let res = [...productos]
    if (activeCat) res = res.filter(p => p.categoria === activeCat)
    if (busqueda) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    }
    if (orden === 'asc') res.sort((a, b) => a.precio - b.precio)
    else if (orden === 'desc') res.sort((a, b) => b.precio - a.precio)
    else if (orden === 'nombre') res.sort((a, b) => a.nombre.localeCompare(b.nombre))
    setFiltrados(res)
  }, [productos, activeCat, busqueda, orden])

  const addCart = (p: Producto) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === p.id)
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: Math.min(x.qty + 1, p.stock) } : x)
      return [...prev, { ...p, qty: 1 }]
    })
    setCartOpen(true)
  }

  const changeQty = (id: number, delta: number) => setCart(prev =>
    prev.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0)
  )

  const inp: React.CSSProperties = { border: 'none', outline: 'none', flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text)', background: 'transparent' }

  return (
    <>
      <Navbar cartCount={cart.reduce((s, x) => s + x.qty, 0)} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={changeQty} onRemove={id => setCart(p => p.filter(x => x.id !== id))} onPedido={() => { setCartOpen(false); setPedidoOpen(true) }} />
      <CheckoutModal open={pedidoOpen} items={cart} onClose={() => setPedidoOpen(false)} onSuccess={() => setCart([])} />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,var(--dark) 0%,#0f1530 100%)', padding: '120px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(43,127,212,.15) 0%,transparent 65%)', right: -100, top: -100, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Inicio</a>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>Catálogo</span>
          </div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Catálogo de <span style={{ color: 'var(--blue)' }}>Productos</span></h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, maxWidth: 520 }}>Tecnología de calidad con garantía en Guastatoya y Guatemala. Precios actualizados en tiempo real.</p>
        </div>
      </section>

      {/* Body */}
      <div style={{ padding: '48px 24px 80px', background: 'var(--gray2)', minHeight: '60vh' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20, background: '#fff', border: '1px solid var(--gray3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--gray3)', borderRadius: 8, padding: '8px 14px' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
              <input style={inp} placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <select value={orden} onChange={e => setOrden(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--gray3)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <option value="">Ordenar por</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
            <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{filtrados.length} productos</span>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {['', ...categorias].map(cat => (
              <button key={cat || 'todos'} onClick={() => setActiveCat(cat)}
                style={{ padding: '7px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all .25s', borderColor: activeCat === cat ? 'var(--blue)' : 'var(--gray3)', background: activeCat === cat ? 'var(--blue)' : '#fff', color: activeCat === cat ? '#fff' : 'var(--text2)' }}>
                {cat || 'Todos'}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--gray3)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text2)' }}>Cargando catálogo...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text2)' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}></div>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, marginBottom: 8 }}>Sin resultados</h3>
              <p>Intenta con otra categoría o término de búsqueda.</p>
            </div>
          ) : (
            <div className='prod-grid-4' style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
              {filtrados.map(p => <ProductCard key={p.id} producto={p} onAddCart={addCart} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <WAButton />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:400px){div[style*="repeat(4,1fr)"]{grid-template-columns:1fr!important}}
      `}</style>
    </>
  )
}

export default function CatalogoPage() {
  return <Suspense fallback={<div style={{padding:100,textAlign:'center'}}>Cargando...</div>}><CatalogoContent /></Suspense>
}
