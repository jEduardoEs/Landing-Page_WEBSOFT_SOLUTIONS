'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  precio: number
  onClose: () => void
}

const BANCOS = [
  { nombre: 'BAC Credomatic', logo: '/bancos/bac.png',       cuotas: [3,6,10,12,18,24,36,48] },
  { nombre: 'Banco Industrial', logo: '/bancos/bi.png',      cuotas: [3,6,12,18,24] },
  { nombre: 'G&T Continental', logo: '/bancos/gyt.png',       cuotas: [3,6,12,18,24] },
  { nombre: 'Banrural',        logo: '/bancos/banrural.png',  cuotas: [2,3,6,10,12,15,18] },
  { nombre: 'BAM',             logo: '/bancos/bam.png',       cuotas: [2,3,6,10,12,15,18] },
  { nombre: 'Banco Promerica', logo: '/bancos/promerica.png', cuotas: [3,6,12,18,24] },
  { nombre: 'Banco CHN',       logo: '/bancos/chn.png',       cuotas: [3,6,12,18] },
]

const TASA: Record<number, number> = {
  2: 0, 3: 0, 6: 0.005, 10: 0.01, 12: 0.01,
  15: 0.012, 18: 0.013, 24: 0.015, 36: 0.018, 48: 0.02,
}

function calcCuota(precio: number, n: number) {
  const t = TASA[n] || 0.01
  if (t === 0) return precio / n
  return (precio * t) / (1 - Math.pow(1 + t, -n))
}

export default function CuotasModal({ precio, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>('BAC Credomatic')

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.55)', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>Cuotas mensuales</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Préstamos de consumo — NeoCuotas, VisaCuotas, MasterCuotas. Pueden tener recargo.
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '0 0 0 12px', flexShrink: 0 }}>×</button>
        </div>

        {/* Banks list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {BANCOS.map(banco => (
            <div key={banco.nombre} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setExpanded(expanded === banco.nombre ? null : banco.nombre)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: expanded === banco.nombre ? '#fafbfc' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background .15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 80, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {banco.logo
                      ? <div style={{ width: 80, height: 32, position: 'relative' }}>
                          <Image src={banco.logo} alt={banco.nombre} fill style={{ objectFit: 'contain', objectPosition: 'left center' }} />
                        </div>
                      : <div style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#475569' }}>{banco.nombre.replace('Banco ', '')}</div>
                    }
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{banco.nombre}</span>
                </div>
                <span style={{ fontSize: 20, color: '#94a3b8', transition: 'transform .2s', display: 'block', transform: expanded === banco.nombre ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>

              {expanded === banco.nombre && (
                <div style={{ padding: '4px 20px 16px', background: '#fafbfc' }}>
                  {banco.cuotas.map(n => (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>{n} {n === 1 ? 'cuota' : 'cuotas'} de</span>
                      <span style={{ fontWeight: 700, color: '#1a1f36', fontSize: 15 }}>Q {calcCuota(precio, n).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
          El mejor precio lo obtienes pagando con tarjeta de crédito, transferencia o efectivo. Si pagas en cuotas el precio varía según tu banco.
        </div>
      </div>
    </div>
  )
}
