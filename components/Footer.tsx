import Link from 'next/link'
import Image from 'next/image'
import { WA } from '@/lib/constants'

export default function Footer() {
  const openWA = `https://wa.me/${WA}?text=${encodeURIComponent('Hola WebSoft Solutions!')}`
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #ebebeb', padding: '56px 32px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image src="/logo.png" alt="Logo" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>WebSoft Solutions</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 240 }}>
              Tecnología y seguridad profesional en Guastatoya, El Progreso y Guatemala.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {[
                { icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', href: '#' },
                { icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z', href: openWA },
              ].map(({ icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 34, height: 34, border: '1px solid #ebebeb', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--text)'; el.style.background = 'var(--text)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#ebebeb'; el.style.background = 'transparent' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text2)' }}>
                    <path d={icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Servicios', links: [['/#servicios', 'Instalación CCTV'], ['/#servicios', 'Reparación de PC'], ['/#servicios', 'Mantenimiento laptops'], ['/catalogo', 'Venta de productos']] },
            { title: 'Catálogo', links: [['/catalogo?cat=Periféricos', 'Periféricos'], ['/catalogo?cat=CCTV', 'Cámaras CCTV'], ['/catalogo?cat=Componentes PC', 'Componentes'], ['/catalogo?cat=Accesorios', 'Accesorios']] },
            { title: 'Contacto', links: [[openWA, 'WhatsApp: 3671-4377'], ['/#contacto', 'Guastatoya, El Progreso'], ['/#contacto', 'Guatemala City'], ['/#contacto', 'Lun – Sáb 8am – 6pm']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 18 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 24, borderTop: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#bbb' }}>© 2025 WebSoft Solutions · Guastatoya, El Progreso, Guatemala</span>
          <span style={{ fontSize: 12, color: '#bbb' }}>Tecnología y seguridad profesional</span>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media(max-width:500px){
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
