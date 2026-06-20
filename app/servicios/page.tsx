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
    img: '/galeria/Foto11.jpeg',
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
    img: '/galeria/Foto16.jpeg',
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
        <img src="/galeria/Fondo.jpeg" alt="Servicios WebSoft Solutions" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
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
      <section style={{ padding: '110px 24px', background: 'var(--text)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }} className="fade-up">
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            ¿No encontraste lo que buscas?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
            Escríbenos y te ayudamos a encontrar la solución ideal para tu hogar o negocio.
          </p>
          <button onClick={() => openWA()} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '15px 34px', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .5, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
