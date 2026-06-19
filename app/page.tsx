'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import WAButton from '@/components/WAButton'
import { Producto, CartItem } from '@/lib/types'
import { POS_URL, WA, FALLBACK_PRODUCTOS } from '@/lib/constants'

export default function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [pedidoOpen, setPedidoOpen] = useState(false)
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIdx, setLbIdx] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const galeria = ['/galeria/Foto1.jpeg','/galeria/Foto2.jpeg','/galeria/Foto3.jpeg','/galeria/Foto4.jpeg','/galeria/Foto5.jpeg','/galeria/Foto6.jpeg','/galeria/Foto7.jpeg','/galeria/Foto8.jpeg']
  const galeria2 = ['/galeria/Foto12.jpeg','/galeria/Foto13.jpeg','/galeria/Foto14.jpeg','/galeria/Foto15.jpeg']


  useEffect(() => {
    fetch(`${POS_URL}/api/tienda/productos?disponibles=true`)
      .then(r => r.json())
      .then(d => setProductos((d.productos || []).slice(0, 8)))
      .catch(() => setProductos(FALLBACK_PRODUCTOS as Producto[]))
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observerRef.current?.unobserve(e.target) } })
    }, { threshold: .08 })
    document.querySelectorAll('.fade-up').forEach(el => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [productos])

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

  const openWA = (msg?: string) => window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg || 'Hola WebSoft Solutions! Me interesa obtener información sobre sus servicios.')}`, '_blank')

  return (
    <>
      <Navbar cartCount={cart.reduce((s, x) => s + x.qty, 0)} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={changeQty} onRemove={id => setCart(p => p.filter(x => x.id !== id))} onPedido={() => { setCartOpen(false); setPedidoOpen(true) }} />
      <CheckoutModal open={pedidoOpen} items={cart} onClose={() => setPedidoOpen(false)} onSuccess={() => setCart([])} />

      {/* ── HERO full-width foto ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Foto de fondo - usa tu propia foto de galería o una profesional */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.1) 100%)' }} 
        />
        <img
          src="/galeria/Foto1.jpeg"
          alt="WebSoft Solutions"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        {/* Overlay gradiente */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.1) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1140, margin: '0 auto', padding: '120px 24px 80px', width: '100%' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 28 }}>
              Guastatoya · El Progreso · Guatemala
            </div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 68, fontWeight: 700, lineHeight: 1.02, color: '#fff', marginBottom: 24 }}>
              Tecnología y<br />seguridad para<br /><span style={{ color: 'var(--blue)' }}>tu negocio.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.75)', lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>
              Instalación de cámaras CCTV, reparación de PC y laptops, y venta de tecnología en Guastatoya y Guatemala.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => openWA()} style={{ background: '#fff', color: 'var(--text)', border: 'none', padding: '15px 32px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5 }}>
                Cotizar ahora
              </button>
              <Link href="/catalogo" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.5)', padding: '15px 32px', borderRadius: 4, fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: .5 }}>
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,.3)', animation: 'scrollLine 2s infinite' }} />
        </div>
      </section>

      {/* ── STRIP VALORES ── */}
      <div style={{ background: '#f9f9f7', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb', padding: '18px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16, flexWrap: 'wrap' }}>
          {[['500+ Clientes', 'en Guastatoya y Guatemala'], ['5+ Años', 'de experiencia'], ['Diagnóstico gratis', 'sin compromiso'], ['Respuesta < 1h', 'lunes a sábado']].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: .5 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INTRO / QUIÉNES SOMOS ── */}
      <section style={{ padding: '110px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="two-col">
          <div className="fade-up">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Quiénes somos</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.08, color: 'var(--text)', marginBottom: 24 }}>
              Soluciones tecnológicas a tu medida.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 20 }}>
              Somos un equipo de técnicos especializados en Guastatoya, El Progreso. Instalamos sistemas de seguridad, reparamos equipos y vendemos tecnología con garantía.
            </p>
            <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 36 }}>
              Más de 5 años brindando servicio profesional a hogares, negocios y empresas en toda Guatemala.
            </p>
            <button onClick={() => openWA()} style={{ background: 'var(--text)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5 }}>
              Agendar consulta
            </button>
          </div>
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {galeria2.slice(0, 4).map((src, i) => (
              <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', background: '#f0f0f0' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}
                  onError={e => { (e.currentTarget.parentElement as HTMLElement).style.background = '#e8f3fd' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section style={{ padding: '110px 24px', background: '#f9f9f7' }} id="servicios">
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="fade-up" style={{ marginBottom: 70 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Servicios</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: 'var(--text)', maxWidth: 480 }}>
              Lo que hacemos por ti.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }} className="three-col">
            {[
              { n: '01', title: 'Redes y sistemas de Seguridad', desc: 'Instalación y configuración profesional de cámaras IP, domo y analógicas. DVR/NVR, visualización remota y mantenimiento preventivo.', img: '/galeria/Foto11.jpeg', href: '/catalogo?cat=CCTV' },
              { n: '02', title: 'PC y Laptops', desc: 'Mantenimiento preventivo y correctivo, reparación de hardware y pantallas, instalación de software y recuperación de datos. Diagnóstico gratuito.', img: '/galeria/Foto9.jpeg', href: null },
              { n: '03', title: 'Venta de Tecnología', desc: 'Catálogo completo de periféricos, accesorios, cables y componentes. Todo con garantía y precio justo.', img: '/galeria/Foto10.jpeg', href: '/catalogo' },
            ].map(s => (
              <div key={s.n} className="fade-up" style={{ background: '#fff', overflow: 'hidden' }}>
                <div style={{ height: 280, overflow: 'hidden', background: '#e0e0e0' }}>
                  <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = '')}
                    onError={e => { (e.currentTarget.parentElement as HTMLElement).style.background = '#dbeeff' }} />
                </div>
                <div style={{ padding: '28px 28px 32px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3, marginBottom: 10 }}>{s.n}</div>
                  <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 20 }}>{s.desc}</p>
                  {s.href
                    ? <Link href={s.href} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', borderBottom: '1.5px solid var(--text)', paddingBottom: 2 }}>Ver productos →</Link>
                    : <button onClick={() => openWA()} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1.5px solid var(--text)', paddingBottom: 2, padding: 0 }}>Agendar servicio →</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section style={{ padding: '110px 24px', background: '#fff' }} id="productos">
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }} >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Catálogo</div>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: 'var(--text)' }}>Productos populares.</h2>
            </div>
            <Link href="/catalogo" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', borderBottom: '1.5px solid var(--text)', paddingBottom: 2, whiteSpace: 'nowrap', marginBottom: 8 }}>Ver todo →</Link>
          </div>
          {productos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid #ddd', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Cargando productos...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="prod-grid-4">
              {productos.map(p => <ProductCard key={p.id} producto={p} onAddCart={addCart} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section style={{ padding: '110px 24px', background: '#f9f9f7' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="fade-up" style={{ marginBottom: 70 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Proceso</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: 'var(--text)' }}>Cómo trabajamos.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40 }} className="four-col">
            {[
              ['01', 'Diagnóstico', 'Evaluamos tu necesidad y te damos una cotización clara, sin costos ocultos.'],
              ['02', 'Propuesta', 'Diseñamos la solución ideal para tu presupuesto y espacio.'],
              ['03', 'Ejecución', 'Nuestro equipo instala o repara con equipos profesionales y garantía.'],
              ['04', 'Soporte', 'Te acompañamos después: asesoría, garantía y mantenimiento.'],
            ].map(([n, t, d]) => (
              <div key={n} className="fade-up">
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: '#ebebeb', lineHeight: 1, marginBottom: 16 }}>{n}</div>
                <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERÍA full-width ── */}
      <section style={{ padding: '110px 0' }} id="galeria">
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', marginBottom: 44 }} className="fade-up">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Nuestro trabajo</div>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: 'var(--text)' }}>Proyectos realizados.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'auto auto', padding: '0 24px' }}>
          {galeria.map((src, i) => (
            <div key={src} onClick={() => { setLbIdx(i); setLbOpen(true) }}
              style={{ aspectRatio: i === 0 ? '16/9' : '4/3', gridColumn: i === 0 ? '1/3' : 'auto', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#e0e0e0' }}>
              <img src={src} alt={`Proyecto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
                onError={e => { (e.currentTarget.parentElement as HTMLElement).style.background = '#dbeeff' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lbOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLbOpen(false)}>
          <button onClick={() => setLbOpen(false)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer', opacity: .7 }}>×</button>
          <button onClick={e => { e.stopPropagation(); setLbIdx((lbIdx - 1 + galeria.length) % galeria.length) }} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>‹</button>
          <img src={galeria[lbIdx]} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 4, objectFit: 'contain' }} />
          <button onClick={e => { e.stopPropagation(); setLbIdx((lbIdx + 1) % galeria.length) }} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>›</button>
        </div>
      )}

      {/* ── TESTIMONIOS ── */}
      <section style={{ padding: '110px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="fade-up" style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Testimonios</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 48, fontWeight: 700, color: 'var(--text)' }}>Lo que dicen nuestros clientes.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }} className="three-col">
            {[
              { t: 'María Castillo', r: 'Propietaria · Guastatoya', q: 'Instalaron mis cámaras en el negocio en un solo día. El trabajo quedó impecable y ahora monitoreo todo desde mi celular.', i: 'MC' },
              { t: 'Juan Rodríguez', r: 'Freelancer · El Progreso', q: 'Me repararon la laptop que ya había dado por perdida. Trabajo rápido, precio justo y me explicaron todo el proceso.', i: 'JR' },
              { t: 'Ana López', r: 'Gerente · Guatemala City', q: 'Compramos periféricos para toda la oficina. Muy satisfechos con la calidad de los productos y la atención recibida.', i: 'AL' },
            ].map(c => (
              <div key={c.t} className="fade-up">
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: '#1a1f36', fontSize: 14 }}>★</span>)}</div>
                <blockquote style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.8, marginBottom: 28, fontStyle: 'normal' }}>"{c.q}"</blockquote>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.i}</div>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{c.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>{c.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '120px 24px', background: 'var(--text)' }} id="contacto">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="fade-up">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 }}>Contáctanos</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 56, fontWeight: 700, color: '#fff', lineHeight: 1.06, marginBottom: 24 }}>
              ¿Listo para mejorar<br />tu negocio?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, marginBottom: 44, maxWidth: 440, margin: '0 auto 44px' }}>
              Cotizaciones sin costo. Servicio en Guastatoya, El Progreso y toda Guatemala.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => openWA()} style={{ background: '#fff', color: 'var(--text)', border: 'none', padding: '16px 36px', borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5 }}>
                Escribir al 3671-4377
              </button>
              <Link href="/catalogo" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', padding: '16px 36px', borderRadius: 4, fontSize: 15, fontWeight: 600, textDecoration: 'none', letterSpacing: .5 }}>
                Ver catálogo
              </Link>
            </div>
            <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
              {['Guastatoya, El Progreso', 'Guatemala City', 'Lun – Sáb · 8:00am – 6:00pm'].map(t => (
                <div key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WAButton />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes scrollLine { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }
        @media(max-width:1024px) {
          .prod-grid-4 { grid-template-columns: repeat(2,1fr) !important; }
          .four-col { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media(max-width:900px) {
          .two-col { grid-template-columns: 1fr !important; gap: 40px !important; }
          .three-col { grid-template-columns: 1fr !important; }
          h1 { font-size: 44px !important; }
          h2 { font-size: 34px !important; }
        }
        @media(max-width:600px) {
          .prod-grid-4 { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
