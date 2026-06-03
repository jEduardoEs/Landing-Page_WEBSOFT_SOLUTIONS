'use client'
import { useState, useEffect, Suspense } from 'react'
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
  const [soloStock, setSoloStock] = useState(false)
  const [precioMax, setPrecioMax] = useState(0)
  const [precioFiltro, setPrecioFiltro] = useState(0)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [pedidoOpen, setPedidoOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${POS_URL}/api/tienda/productos`)
      .then(r => r.json())
      .then(d => {
        const prods: Producto[] = d.productos || []
        setProductos(prods)
        setCategorias(d.categorias || [])
        const maxP = Math.max(...prods.map(p => p.precio), 0)
        setPrecioMax(maxP)
        setPrecioFiltro(maxP)
        setLoading(false)
      })
      .catch(() => {
        const prods = FALLBACK_PRODUCTOS as Producto[]
        setProductos(prods)
        setCategorias(['Periféricos','CCTV','Componentes PC','Accesorios','Cables'])
        const maxP = Math.max(...prods.map(p => p.precio), 0)
        setPrecioMax(maxP)
        setPrecioFiltro(maxP)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let res = [...productos]
    if (activeCat) res = res.filter(p => p.categoria === activeCat)
    if (soloStock) res = res.filter(p => p.stock > 0)
    if (precioFiltro > 0 && precioFiltro < precioMax) res = res.filter(p => p.precio <= precioFiltro)
    if (busqueda) {
      const q = busqueda.toLowerCase()
      res = res.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q) ||
        (p.codigo || '').toLowerCase().includes(q)
      )
    }
    if (orden === 'asc') res.sort((a, b) => a.precio - b.precio)
    else if (orden === 'desc') res.sort((a, b) => b.precio - a.precio)
    else if (orden === 'nombre') res.sort((a, b) => a.nombre.localeCompare(b.nombre))
    setFiltrados(res)
  }, [productos, activeCat, busqueda, orden, soloStock, precioFiltro, precioMax])

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

  const resetFiltros = () => {
    setActiveCat('')
    setSoloStock(false)
    setPrecioFiltro(precioMax)
    setBusqueda('')
  }

  const hayFiltros = activeCat !== '' || soloStock || precioFiltro < precioMax || busqueda !== ''

  const inp: React.CSSProperties = {
    border: 'none', outline: 'none', flex: 1,
    fontFamily: 'DM Sans, sans-serif', fontSize: 13,
    color: 'var(--text)', background: 'transparent',
  }

  const Sidebar = () => (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ background: '#fff', border: '1.5px solid #e2eaf4', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 90 }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1f36' }}>Filtros</span>
          {hayFiltros && (
            <button onClick={resetFiltros} style={{ fontSize: 11, color: '#2B7FD4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
              Limpiar todo
            </button>
          )}
        </div>

        {/* Stock */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
              <input type="checkbox" checked={soloStock} onChange={e => setSoloStock(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
              <div style={{ position: 'absolute', inset: 0, background: soloStock ? '#2B7FD4' : '#e2eaf4', borderRadius: 10, transition: 'background .2s' }} />
              <div style={{ position: 'absolute', width: 16, height: 16, background: '#fff', borderRadius: '50%', top: 2, left: soloStock ? 18 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
            <span style={{ fontSize: 13, color: '#334155' }}>Solo con stock</span>
          </label>
        </div>

        {/* Categories */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Categoría</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['', ...categorias].map(cat => {
              const count = cat ? productos.filter(p => p.categoria === cat).length : productos.length
              return (
                <button key={cat || 'todos'} onClick={() => setActiveCat(cat)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                    background: activeCat === cat ? '#eff6ff' : 'transparent',
                    color: activeCat === cat ? '#2B7FD4' : '#334155',
                    fontWeight: activeCat === cat ? 600 : 400, fontSize: 13,
                    transition: 'all .15s',
                  }}>
                  <span>{cat || 'Todos'}</span>
                  <span style={{ fontSize: 11, color: activeCat === cat ? '#2B7FD4' : '#94a3b8', background: activeCat === cat ? '#dbeafe' : '#f1f5f9', padding: '1px 6px', borderRadius: 10 }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Price range */}
        {precioMax > 0 && (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Precio máximo</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2B7FD4', marginBottom: 10 }}>
              Q {precioFiltro.toFixed(0)}
            </div>
            <input type="range" min={0} max={precioMax} value={precioFiltro}
              onChange={e => setPrecioFiltro(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2B7FD4', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              <span>Q 0</span>
              <span>Q {precioMax.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Navbar cartCount={cart.reduce((s, x) => s + x.qty, 0)} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={changeQty} onRemove={id => setCart(p => p.filter(x => x.id !== id))} onPedido={() => { setCartOpen(false); setPedidoOpen(true) }} />
      <CheckoutModal open={pedidoOpen} items={cart} onClose={() => setPedidoOpen(false)} onSuccess={() => setCart([])} />

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,.4)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ width: 260, background: '#fff', overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Filtros</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,var(--dark) 0%,#0f1530 100%)', padding: '120px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(43,127,212,.15) 0%,transparent 65%)', right: -100, top: -100, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Inicio</a>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>Catálogo</span>
          </div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
            Catálogo de <span style={{ color: 'var(--blue)' }}>Productos</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, maxWidth: 520 }}>
            Tecnología de calidad con garantía en Guastatoya y Guatemala. Precios actualizados en tiempo real.
          </p>
        </div>
      </section>

      {/* Body */}
      <div style={{ padding: '40px 24px 80px', background: '#f4f7fb', minHeight: '60vh' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, background: '#fff', border: '1.5px solid #e2eaf4', borderRadius: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
            {/* Filter button (mobile) */}
            <button onClick={() => setSidebarOpen(true)} className="mobile-filter-btn"
              style={{ display: 'none', alignItems: 'center', gap: 6, padding: '7px 14px', background: hayFiltros ? '#eff6ff' : '#f4f7fb', border: '1.5px solid', borderColor: hayFiltros ? '#2B7FD4' : '#e2eaf4', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: hayFiltros ? '#2B7FD4' : '#334155' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filtros {hayFiltros ? '•' : ''}
            </button>
            <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e2eaf4', borderRadius: 8, padding: '8px 14px' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
              <input style={inp} placeholder="Buscar producto, SKU..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              {busqueda && <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>}
            </div>
            <select value={orden} onChange={e => setOrden(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid #e2eaf4', borderRadius: 8, fontSize: 13, color: '#334155', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <option value="">Ordenar por</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
            <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Main content with sidebar */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* Sidebar - desktop */}
            <div className="catalog-sidebar">
              <Sidebar />
            </div>

            {/* Products */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 80 }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #e2eaf4', borderTopColor: '#2B7FD4', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ color: '#94a3b8' }}>Cargando catálogo...</p>
                </div>
              ) : filtrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
                  <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, marginBottom: 8, color: '#1a1f36' }}>Sin resultados</h3>
                  <p style={{ marginBottom: 16 }}>Intenta con otra categoría o término de búsqueda.</p>
                  <button onClick={resetFiltros} style={{ background: '#2B7FD4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className='prod-grid-4' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                  {filtrados.map(p => <ProductCard key={p.id} producto={p} onAddCart={addCart} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WAButton />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .catalog-sidebar { display: block; }
        @media(max-width: 900px) {
          .catalog-sidebar { display: none; }
          .mobile-filter-btn { display: flex !important; }
          .prod-grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media(max-width: 480px) {
          .prod-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 100, textAlign: 'center' }}>Cargando...</div>}>
      <CatalogoContent />
    </Suspense>
  )
}
