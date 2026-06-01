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

  const galeria = ['/galeria/Foto1.jpeg','/galeria/Foto2.jpeg','/galeria/Foto3.jpeg','/galeria/Foto4.jpeg','/galeria/Foto5.jpeg','/galeria/Foto6.jpeg']

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

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#fff 0%,#eef6ff 40%,#deeeff 100%)' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(43,127,212,.09) 0%,transparent 70%)', right: -180, top: -180, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(43,127,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(43,127,212,.04) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '55% 45%', gap: 56, alignItems: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(43,127,212,.1)', border: '1px solid rgba(43,127,212,.2)', borderRadius: 24, padding: '7px 16px', fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              Guastatoya · El Progreso · Guatemala
            </div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 56, fontWeight: 700, lineHeight: 1.06, marginBottom: 20, color: 'var(--text)' }}>
              Tecnología y<br /><span style={{ color: 'var(--blue)' }}>seguridad</span> para tu<br />
              <span style={{ WebkitTextStroke: '2px var(--blue)', color: 'transparent' }}>negocio</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8, marginBottom: 32, maxWidth: 490 }}>
              Servicio técnico profesional en Guastatoya, El Progreso y toda Guatemala. Instalación de cámaras CCTV, reparación de PC y laptops, venta de periféricos y componentes.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 36 }}>
              <button onClick={() => openWA()} className="btn-primary">
                <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Cotizar por WhatsApp
              </button>
              <Link href="/catalogo" className="btn-secondary">Ver catálogo completo</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {['MC','JR','AL','+'].map((l, i) => (
                  <div key={l} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', fontSize: i === 3 ? 10 : 12, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -8 : 0 }}>{l}</div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}><strong style={{ color: 'var(--text)' }}>+500 clientes</strong> en Guastatoya y Guatemala</div>
            </div>
          </div>
          <div>
            <div style={{ background: '#fff', border: '1px solid var(--gray3)', borderRadius: 20, padding: 26, boxShadow: '0 24px 64px rgba(43,127,212,.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--gray3)' }}>
                <div style={{ width: 42, height: 42, background: 'var(--dark)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, flexShrink: 0 }}>
                  <Image src="/logo.png" alt="Logo" width={30} height={30} style={{ objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 700 }}>WebSoft Solutions</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Guastatoya, El Progreso, Guatemala</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                {[['500+','Clientes'],['5+','Años'],['100%','Garantía']].map(([n,l]) => (
                  <div key={l} style={{ background: 'var(--gray2)', borderRadius: 10, padding: 11, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 21, fontWeight: 700, color: 'var(--blue)' }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Periféricos','CCTV','Reparaciones','PC y Laptops','Guastatoya'].map(c => (
                  <span key={c} style={{ background: 'var(--blue-light)', border: '1px solid rgba(43,127,212,.2)', borderRadius: 20, padding: '4px 11px', fontSize: 11, color: 'var(--blue)', fontWeight: 500 }}>{c}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              {[['Instalación CCTV','Guastatoya y El Progreso','M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],['Reparación técnica','PC, laptops y más','M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z']].map(([t,s,d]) => (
                <div key={t} style={{ background: '#fff', border: '1px solid var(--gray3)', borderRadius: 13, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--blue-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
                  </div>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.5)}70%{box-shadow:0 0 0 6px rgba(37,211,102,0)}}
          @media(max-width:900px){
            section:first-of-type > div:last-of-type > div:first-of-type{grid-template-columns:1fr!important;gap:40px!important}
            h1{font-size:38px!important}
          }
        `}</style>
      </section>

      {/* STRIP */}
      <div style={{ background: 'var(--dark)', padding: '13px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 20, flexWrap: 'wrap' }}>
          {[['Instalación certificada','M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],['Productos con garantía','M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],['Respuesta en menos de 1 hora','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l4 2'],['Diagnóstico gratis','M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11']].map(([label, d]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d as string} /></svg>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTOS */}
      <section style={{ padding: '90px 0', background: '#fff' }} id="productos">
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
          <div className="fade-up" style={{ marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
              <span style={{ width: 22, height: 2, background: 'var(--blue)', borderRadius: 2, display: 'inline-block' }} />
              Productos populares
            </div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Los más <span style={{ color: 'var(--blue)' }}>solicitados</span></h2>
            <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8, maxWidth: 580 }}>Precios y stock actualizados en tiempo real desde nuestro sistema.</p>
          </div>
          {productos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--gray3)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text2)' }}>Cargando productos...</p>
            </div>
          ) : (
            <div className="prod-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
              {productos.map(p => <ProductCard key={p.id} producto={p} onAddCart={addCart} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--dark)', color: '#fff', padding: '13px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Ver catálogo completo →
            </Link>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1024px){.prod-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:480px){.prod-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* SERVICIOS */}
      <section style={{ padding: '90px 0', background: 'var(--gray2)' }} id="servicios">
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }} className="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, justifyContent: 'center' }}>
              <span style={{ width: 22, height: 2, background: 'var(--blue)', borderRadius: 2, display: 'inline-block' }} />Lo que ofrecemos
            </div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Nuestros <span style={{ color: 'var(--blue)' }}>Servicios</span></h2>
          </div>
          <div className="services-grid" className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {[
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Sistemas CCTV', desc: 'Instalación y configuración profesional de cámaras de seguridad.', items: ['Cámaras IP, domo y analógicas','Configuración de DVR/NVR','Visualización remota desde celular','Mantenimiento preventivo'], href: '/catalogo?cat=CCTV' },
              { icon: 'M2 3h20v14H2z M8 21h8 M12 17v4', title: 'PC y Laptops', desc: 'Servicio técnico especializado. Diagnóstico gratuito sin compromiso.', items: ['Mantenimiento preventivo y correctivo','Reparación de hardware y pantallas','Instalación de software y sistemas','Recuperación de datos'], href: null },
              { icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M16 10a4 4 0 0 1-8 0', title: 'Venta de Tecnología', desc: 'Catálogo completo de productos tecnológicos con garantía.', items: ['Periféricos: teclados, mouse, audífonos','Accesorios para PC y laptop','Cables y conectores','Componentes y repuestos'], href: '/catalogo' },
            ].map(s => (
              <div key={s.title} className="fade-up" style={{ background: '#fff', border: '1.5px solid var(--gray3)', borderRadius: 18, padding: 30, position: 'relative', overflow: 'hidden', transition: 'all .25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--blue-mid)'; el.style.transform = 'translateY(-5px)'; el.style.boxShadow = '0 18px 44px rgba(43,127,212,.12)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--gray3)'; el.style.transform = ''; el.style.boxShadow = '' }}>
                <div style={{ width: 50, height: 50, background: 'var(--blue-light)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{s.icon.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}</svg>
                </div>
                <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {s.items.map(item => <li key={item} style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 5, height: 5, background: 'var(--blue)', borderRadius: '50%', flexShrink: 0 }} />{item}</li>)}
                </ul>
                {s.href
                  ? <Link href={s.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--blue)', textDecoration: 'none' }}>Ver productos →</Link>
                  : <button onClick={() => openWA()} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--blue)', cursor: 'pointer', fontFamily: 'inherit' }}>Agendar servicio →</button>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section style={{ padding: '90px 0', background: 'var(--gray2)' }} id="nosotros">
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div className="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
                <span style={{ width: 22, height: 2, background: 'var(--blue)', borderRadius: 2, display: 'inline-block' }} />Por qué elegirnos
              </div>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 40, fontWeight: 700, lineHeight: 1.12, marginBottom: 16 }}>Experiencia, calidad<br />y <span style={{ color: 'var(--blue)' }}>confianza</span></h2>
              <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8 }}>Más de 5 años brindando soluciones tecnológicas en Guastatoya y Guatemala.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 30 }}>
                {[['Técnicos certificados','Personal capacitado con experiencia comprobada.'],['Productos con garantía','Solo trabajamos con marcas reconocidas.'],['Atención rápida','Cotizaciones inmediatas, lunes a sábado.'],['Garantía en todos los trabajos','Cada instalación viene respaldada con garantía escrita.']].map(([t, d]) => (
                  <div key={t} className="fade-up" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 18, borderRadius: 13, border: '1px solid transparent', transition: 'all .25s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#fff'; el.style.borderColor = 'var(--gray3)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ''; el.style.borderColor = 'transparent' }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, background: 'var(--blue-light)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{t}</h4>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-up" style={{ background: 'linear-gradient(145deg,var(--dark) 0%,#0f1530 100%)', borderRadius: 20, padding: 34, boxShadow: '0 28px 72px rgba(13,15,26,.18)' }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 22, letterSpacing: 3, textTransform: 'uppercase' }}>Nuestros números</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                {[['500+','Clientes satisfechos'],['5+','Años en el mercado'],['100%','Garantía en servicio'],['<1h','Tiempo de respuesta']].map(([n,l]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 13, padding: 20 }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 36, fontWeight: 700, color: 'var(--blue)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 5 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(43,127,212,.1)', border: '1px solid rgba(43,127,212,.2)', borderRadius: 13, padding: 20 }}>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, fontStyle: 'italic' }}>"Tu seguridad y productividad son nuestra prioridad. Servimos con orgullo a Guastatoya, El Progreso y toda Guatemala."</p>
                <cite style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'block', marginTop: 10, fontStyle: 'normal' }}>— Equipo WebSoft Solutions</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section style={{ padding: '90px 0', background: '#fff' }} id="galeria">
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
          <div className="fade-up" style={{ marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
              <span style={{ width: 22, height: 2, background: 'var(--blue)', borderRadius: 2, display: 'inline-block' }} />Nuestro trabajo
            </div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Galería de <span style={{ color: 'var(--blue)' }}>Proyectos</span></h2>
          </div>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {galeria.map((src, i) => (
              <div key={src} onClick={() => { setLbIdx(i); setLbOpen(true) }} className="fade-up"
                style={{ borderRadius: 13, overflow: 'hidden', aspectRatio: '4/3', position: 'relative', cursor: 'pointer', transition: 'all .25s', border: '1.5px solid var(--gray3)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1.02)'; el.style.boxShadow = '0 10px 28px rgba(43,127,212,.12)'; el.style.borderColor = 'var(--blue)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--gray3)' }}>
                <img src={src} alt={`Proyecto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,26,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .25s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lbOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLbOpen(false)}>
          <button onClick={() => setLbOpen(false)} style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer', opacity: .7 }}>×</button>
          <button onClick={e => { e.stopPropagation(); setLbIdx((lbIdx - 1 + galeria.length) % galeria.length) }} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', width: 42, height: 42, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <img src={galeria[lbIdx]} onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 10, objectFit: 'contain' }} />
          <button onClick={e => { e.stopPropagation(); setLbIdx((lbIdx + 1) % galeria.length) }} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', width: 42, height: 42, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      )}

      {/* TESTIMONIOS */}
      <section style={{ padding: '90px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }} className="fade-up">
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Lo que dicen nuestros <span style={{ color: 'var(--blue)' }}>clientes</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {[
              { t: 'María Castillo', r: 'Propietaria · Guastatoya', q: '"Instalaron mis cámaras en el negocio en un solo día. El trabajo quedó impecable y ahora monitoreo todo desde mi celular."', i: 'MC' },
              { t: 'Juan Rodríguez', r: 'Freelancer · El Progreso', q: '"Me repararon la laptop que ya había dado por perdida. Trabajo rápido, precio justo y me explicaron todo."', i: 'JR' },
              { t: 'Ana López', r: 'Gerente · Guatemala City', q: '"Compramos periféricos para toda la oficina. Muy satisfechos con la calidad y atención."', i: 'AL' },
            ].map(c => (
              <div key={c.t} className="fade-up" style={{ background: '#fff', border: '1.5px solid var(--gray3)', borderRadius: 17, padding: 28 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f5a623', fontSize: 15 }}></span>)}</div>
                <blockquote style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>{c.q}</blockquote>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),#5ba3e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.i}</div>
                  <div><div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 700 }}>{c.t}</div><div style={{ fontSize: 11, color: 'var(--text2)' }}>{c.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '90px 0', background: 'linear-gradient(135deg,var(--dark) 0%,#0a0e22 100%)', position: 'relative', overflow: 'hidden' }} id="contacto">
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(43,127,212,.12) 0%,transparent 65%)', right: -150, top: -150, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 44, fontWeight: 700, color: '#fff', marginBottom: 14, lineHeight: 1.1 }}>¿Listo para mejorar<br /><span style={{ color: 'var(--blue)' }}>su negocio?</span></h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, maxWidth: 480, margin: '0 auto 36px' }}>Servicio técnico profesional en Guastatoya y Guatemala. Cotizaciones sin costo.</p>
          <button onClick={() => openWA()} style={{ display: 'inline-flex', alignItems: 'center', gap: 11, background: 'var(--green)', color: '#fff', padding: '16px 40px', borderRadius: 13, fontSize: 17, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none', boxShadow: '0 6px 22px rgba(37,211,102,.35)', transition: 'all .25s' }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Escribir al 3671-4377
          </button>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap' }}>
            {['Guastatoya, El Progreso','Guatemala City','Lun – Sáb · 8:00am – 6:00pm','Respuesta en menos de 1 hora'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: 'rgba(255,255,255,.5)' }}>
                <span style={{ width: 5, height: 5, background: 'var(--blue)', borderRadius: '50%', flexShrink: 0 }} />{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WAButton />

      <style>{`
        @media(max-width:900px){
          section > div > div[style*="grid-template-columns: 55%"]{grid-template-columns:1fr!important;gap:40px!important;text-align:center}
          section > div > div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important}
          section > div > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
          h1{font-size:38px!important}h2{font-size:30px!important}
        }
        @media(max-width:600px){
          section > div > div[style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </>
  )
}
