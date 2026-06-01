import Link from 'next/link'
import Image from 'next/image'
import { WA } from '@/lib/constants'

export default function Footer() {
  const openWA = `https://wa.me/${WA}?text=${encodeURIComponent('Hola WebSoft Solutions!')}`
  return (
    <footer style={{ background: '#080b18', padding: '36px 24px 24px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Image src="/logo.png" alt="Logo" width={30} height={30} style={{ objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 19, fontWeight: 700, color: '#fff' }}>Web<span style={{ color: 'var(--blue)' }}>Soft</span> Solutions</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', lineHeight: 1.7, maxWidth: 280 }}>Tecnología y seguridad profesional en Guastatoya, El Progreso y Guatemala.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'].map((d, i) => (
              <a key={i} href={i === 1 ? openWA : '#'} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              </a>
            ))}
          </div>
        </div>

        {[
          { title: 'Servicios', links: [['/#servicios', 'Instalación CCTV'], ['/#servicios', 'Reparación de PC'], ['/#servicios', 'Mantenimiento laptops'], ['/catalogo', 'Venta de productos']] },
          { title: 'Catálogo', links: [['/catalogo?cat=Periféricos', 'Periféricos'], ['/catalogo?cat=CCTV', 'Cámaras CCTV'], ['/catalogo?cat=Componentes PC', 'Componentes PC'], ['/catalogo?cat=Accesorios', 'Accesorios']] },
          { title: 'Contacto', links: [[openWA, 'WhatsApp: 3671-4377'], ['/#contacto', 'Guastatoya, El Progreso'], ['/#contacto', 'Guatemala City, GT'], ['/#contacto', 'Lun – Sáb 8:00am – 6:00pm']] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>{col.title}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {col.links.map(([href, label]) => (
                <li key={label}><Link href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1140, margin: '0 auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>© 2025 WebSoft Solutions · Guastatoya, El Progreso, Guatemala</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>Tecnología y seguridad profesional</span>
      </div>
    </footer>
  )
}
