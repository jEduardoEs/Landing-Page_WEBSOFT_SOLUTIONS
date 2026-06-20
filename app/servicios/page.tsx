'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import Footer from '@/components/Footer'
import WAButton from '@/components/WAButton'
import { CartItem } from '@/lib/types'
import { WA } from '@/lib/constants'

const SERVICIOS = [
  {
    n: '01',
    title: 'Redes y Sistemas de Seguridad',
    img: '/galeria/Fondo.jpeg',
    resumen: 'Instalación profesional de cámaras CCTV, DVR/NVR y monitoreo remoto.',
    detalle: 'Diseñamos e instalamos sistemas de videovigilancia para hogares y negocios: cámaras IP, domo y analógicas, con grabación en DVR/NVR y visualización remota desde tu celular o computadora. Incluye cableado estructurado, configuración de red y mantenimiento preventivo.',
    incluye: ['Cámaras IP, domo y analógicas', 'Configuración DVR / NVR', 'Visualización remota desde el celular', 'Cableado estructurado profesional', 'Mantenimiento preventivo periódico', 'Garantía de instalación'],
    cat: 'CCTV',
  },
  {
    n: '02',
    title: 'PC y Laptops',
    img: '/galeria/Foto9.jpeg',
    resumen: 'Mantenimiento, reparación de hardware y recuperación de datos.',
    detalle: 'Servicio técnico especializado en computadoras de escritorio y laptops. Diagnóstico gratuito antes de cualquier reparación, formateo e instalación de software, cambio de pantallas y componentes, limpieza interna y recuperación de información.',
    incluye: ['Diagnóstico gratuito', 'Mantenimiento preventivo y correctivo', 'Cambio de pantallas y componentes', 'Formateo e instalación de software', 'Recuperación de datos', 'Limpieza interna profesional'],
    cat: null,
  },
  {
    n: '03',
    title: 'Aires Acondicionados',
    img: '/galeria/Foto1.jpeg',
    resumen: 'Venta, instalación y mantenimiento de unidades de aire acondicionado.',
    detalle: 'Instalamos y damos mantenimiento a aires acondicionados tipo split para hogar y negocio. Incluye recarga de gas refrigerante, limpieza de unidades, reparación de fallas y asesoría para elegir el equipo ideal según el espacio.',
    incluye: ['Instalación de unidades nuevas', 'Mantenimiento preventivo', 'Recarga de gas refrigerante', 'Reparación de fallas', 'Limpieza de filtros y unidades', 'Asesoría según el espacio'],
    cat: 'Aires Acondicionados',
  },
  {
    n: '04',
    title: 'Venta de Tecnología',
    img: '/galeria/Foto10.jpeg',
    resumen: 'Catálogo de periféricos, accesorios, cables y componentes con garantía.',
    detalle: 'Contamos con un catálogo amplio de productos tecnológicos: periféricos, accesorios para PC, cables, componentes y más. Todos nuestros productos cuentan con garantía y precio justo, con entrega en Guastatoya y envíos a toda Guatemala.',
    incluye: ['Periféricos y accesorios', 'Componentes para PC', 'Cables y conectores', 'Garantía en todos los productos', 'Entrega en Guastatoya', 'Envíos a toda Guatemala'],
    cat: null,
    href: '/catalogo',
  },
]

export default function ServiciosPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [pedidoOpen, setPedidoOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observerRef.current?.unobserve(e.target) } })
    }, { threshold: .08 })
    document.querySelectorAll('.fade-up').forEach(el => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

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
      <section style={{ position: 'relative', minHeight: '52vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="/galeria/Foto2.jpeg" alt="Servicios WebSoft Solutions" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.1) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1140, margin: '0 auto', padding: '140px 24px 70px', width: '100%' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.65)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Lo que hacemos</div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 58, fontWeight: 700, color: '#fff', lineHeight: 1.04, maxWidth: 640 }}>
            Servicios completos<br />para tu hogar y negocio.
          </h1>
        </div>
      </section>

      {/* LISTADO DETALLADO */}
      {SERVICIOS.map((s, idx) => (
        <section key={s.n} style={{ padding: '90px 24px', background: idx % 2 === 0 ? '#fff' : '#f9f9f7' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: idx % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 70, alignItems: 'center' }} className="serv-row">
            <div className={`fade-up ${idx % 2 !== 0 ? 'order-2' : ''}`} style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#e8f3fd' }}>
              <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget.parentElement as HTMLElement).style.background = '#dbeeff' }} />
            </div>
            <div className={`fade-up ${idx % 2 !== 0 ? 'order-1' : ''}`}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 52, fontWeight: 700, color: '#e8e8e8', lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 38, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 24 }}>{s.detalle}</p>
              <ul style={{ listStyle: 'none', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.incluye.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => openWA(`Hola WebSoft Solutions! Me interesa el servicio de ${s.title}.`)} style={{ background: 'var(--text)', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5 }}>
                  Cotizar este servicio
                </button>
                {s.href && (
                  <Link href={s.href} style={{ background: 'transparent', color: 'var(--text)', border: '1.5px solid #e2e2e2', padding: '13px 28px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: .5 }}>
                    Ver catálogo
                  </Link>
                )}
                {s.cat && (
                  <Link href={`/catalogo?cat=${encodeURIComponent(s.cat)}`} style={{ background: 'transparent', color: 'var(--text)', border: '1.5px solid #e2e2e2', padding: '13px 28px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: .5 }}>
                    Ver productos relacionados
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA FINAL */}
      <section style={{ padding: '110px 24px', background: 'linear-gradient(135deg, #1581E3 0%, #0d5fb0 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }} className="fade-up">
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            ¿No encontraste lo que buscas?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
            Escríbenos y te ayudamos a encontrar la solución ideal para tu hogar o negocio.
          </p>
          <button onClick={() => openWA()} style={{ background: '#fff', color: '#1581E3', border: 'none', padding: '15px 34px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5 }}>
            Escribir al 3671-4377
          </button>
        </div>
      </section>

      <Footer />
      <WAButton />

      <style>{`
        @media(max-width:900px){
          .serv-row{grid-template-columns:1fr!important;gap:32px!important}
          .order-1{order:1}
          .order-2{order:2}
        }
      `}</style>
    </>
  )
}
