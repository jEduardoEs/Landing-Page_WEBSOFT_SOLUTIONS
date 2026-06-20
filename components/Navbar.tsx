'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WA } from '@/lib/constants'

interface NavbarProps {
  cartCount?: number
  onCartOpen?: () => void
}

export default function Navbar({ cartCount = 0, onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroSection, setHeroSection] = useState(true)

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20)
      setHeroSection(window.scrollY < window.innerHeight - 80)
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const openWA = () => window.open(`https://wa.me/${WA}?text=${encodeURIComponent('Hola WebSoft Solutions! Me interesa obtener información sobre sus servicios.')}`, '_blank')

  const textColor = heroSection && !menuOpen ? 'rgba(255,255,255,.85)' : 'var(--text2)'
  const logoFilter = heroSection && !menuOpen ? 'brightness(10)' : 'none'
  const bg = heroSection && !menuOpen ? 'transparent' : 'rgba(255,255,255,.98)'
  const border = heroSection && !menuOpen ? 'transparent' : 'rgba(0,0,0,.07)'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: bg, backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: `1px solid ${border}`,
      padding: '0 32px',
      boxShadow: scrolled && !heroSection ? '0 1px 20px rgba(0,0,0,.06)' : 'none',
      transition: 'all .3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="WebSoft Solutions" width={32} height={32} style={{ objectFit: 'contain', filter: logoFilter, transition: 'filter .3s' }} />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 19, fontWeight: 700, letterSpacing: .5, color: heroSection && !menuOpen ? '#fff' : 'var(--text)', transition: 'color .3s' }}>
            WebSoft Solutions
          </span>
        </Link>

        <ul style={{ display: 'flex', gap: 36, listStyle: 'none', margin: 0 }} className="desktop-nav">
          {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/servicios', 'Servicios'], ['/#galeria', 'Proyectos'], ['/#contacto', 'Contacto']].map(([href, label]) => (
            <li key={href}>
              <Link href={href} style={{ textDecoration: 'none', color: textColor, fontSize: 13, fontWeight: 500, letterSpacing: .5, transition: 'color .25s' }}
                onMouseEnter={e => (e.currentTarget.style.color = heroSection ? '#fff' : 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = textColor)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={onCartOpen} style={{ position: 'relative', cursor: 'pointer', padding: 6 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={heroSection && !menuOpen ? 'rgba(255,255,255,.8)' : 'var(--text2)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke .3s' }}>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--blue)', color: '#fff', fontSize: 9, fontWeight: 700, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </div>

          <button onClick={openWA} className="desktop-nav"
            style={{ background: heroSection && !menuOpen ? 'rgba(255,255,255,.15)' : 'var(--text)', color: '#fff', border: `1px solid ${heroSection && !menuOpen ? 'rgba(255,255,255,.3)' : 'transparent'}`, padding: '9px 22px', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: .5, transition: 'all .3s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--blue)'; el.style.borderColor = 'transparent' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = heroSection && !menuOpen ? 'rgba(255,255,255,.15)' : 'var(--text)'; el.style.borderColor = heroSection && !menuOpen ? 'rgba(255,255,255,.3)' : 'transparent' }}>
            Cotizar ahora
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 1.5, background: heroSection && !menuOpen ? '#fff' : 'var(--text)', borderRadius: 2, transition: 'background .3s' }} />)}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: '#fff', padding: '20px 0 28px', borderTop: '1px solid #f0f0f0' }}>
          <ul style={{ listStyle: 'none', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/servicios', 'Servicios'], ['/#galeria', 'Proyectos'], ['/#contacto', 'Contacto']].map(([href, label]) => (
              <li key={href} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <Link href={href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 0', color: 'var(--text)', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>{label}</Link>
              </li>
            ))}
            <li style={{ marginTop: 20 }}>
              <button onClick={openWA} style={{ background: 'var(--text)', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>Cotizar ahora</button>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @media(max-width:900px){
          .desktop-nav{display:none!important}
          .mobile-only{display:flex!important}
        }
      `}</style>
    </nav>
  )
}
