import Link from 'next/link'
export default function GraciasPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray2)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.08)' }}>
        <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}></div>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>¡Pedido Recibido!</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          Hemos recibido tu pedido. Te contactaremos pronto para confirmar disponibilidad y coordinar la entrega.
        </p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue)', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          Volver al inicio
        </Link>
        <style>{`:root{--blue:#2B7FD4;--gray2:#f4f7fb;--text2:#4a5568}`}</style>
      </div>
    </div>
  )
}
