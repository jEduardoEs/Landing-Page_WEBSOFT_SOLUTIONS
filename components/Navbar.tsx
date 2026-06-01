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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const openWA = () => window.open(`https://wa.me/${WA}?text=${encodeURIComponent('Hola WebSoft Solutions! Me interesa obtener información sobre sus servicios.')}`, '_blank')

  return (
    <nav className='nav-glass' style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--gray3)', padding: '0 24px',
      boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,.09)' : 'none',
      transition: 'box-shadow .25s ease',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="WebSoft Solutions" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 21, fontWeight: 700, letterSpacing: .5, color: 'var(--text)' }}>
            Web<span style={{ color: 'var(--blue)' }}>Soft</span> Solutions
          </span>
        </Link>

        {/* Desktop nav */}
        <ul style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0 }} className="desktop-nav">
          {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/#servicios', 'Servicios'], ['/#galeria', 'Galería'], ['/#nosotros', 'Nosotros'], ['/#contacto', 'Contacto']].map(([href, label]) => (
            <li key={href}>
              <Link href={href} style={{ textDecoration: 'none', color: 'var(--text2)', fontSize: 14, fontWeight: 500, transition: 'color .25s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--blue)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart icon */}
          <div onClick={onCartOpen} style={{ position: 'relative', cursor: 'pointer', padding: 8, borderRadius: 8, transition: 'background .25s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--blue)', color: '#fff', fontSize: 10, fontWeight: 700, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </div>

          <button onClick={openWA} className="desktop-nav" style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background .25s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}>
            Cotizar ahora
          </button>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ padding: '16px 0 24px', borderTop: '1px solid var(--gray3)' }}>
          <ul style={{ listStyle: 'none' }}>
            {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/#servicios', 'Servicios'], ['/#galeria', 'Galería'], ['/#nosotros', 'Nosotros'], ['/#contacto', 'Contacto']].map(([href, label]) => (
              <li key={href}>
                <Link href={href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 0', color: 'var(--text2)', fontSize: 15, textDecoration: 'none' }}>{label}</Link>
              </li>
            ))}
            <li><button onClick={openWA} className="btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>Cotizar por WhatsApp</button></li>
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
