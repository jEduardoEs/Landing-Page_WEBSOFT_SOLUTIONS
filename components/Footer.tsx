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
                {
                  href: 'https://www.facebook.com/profile.php?id=61578217802162',
                  color: '#1877F2',
                  svg: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                },
                {
                  href: 'https://www.instagram.com/websoft_solutions_?igsh=eXJ2cmU5MmR5eG9t&utm_source=qr',
                  color: '#E1306C',
                  svg: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                },
                {
                  href: 'https://www.tiktok.com/@websoft.solutions?_r=1&_t=ZS-97hvpXUDLk4',
                  color: '#000000',
                  svg: <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                },
                {
                  href: openWA,
                  color: '#25D366',
                  svg: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                },
              ].map(({ href, color, svg }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 34, height: 34, border: '1px solid #ebebeb', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', color: 'var(--text2)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = color; el.style.color = color; el.style.background = color + '12' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#ebebeb'; el.style.color = 'var(--text2)'; el.style.background = 'transparent' }}>
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Servicios', links: [['/servicios', 'Instalación CCTV'], ['/servicios', 'Reparación de PC'], ['/servicios', 'Aires Acondicionados'], ['/catalogo', 'Venta de productos']] },
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
