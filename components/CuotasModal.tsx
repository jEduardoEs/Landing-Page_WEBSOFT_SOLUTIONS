'use client'
import { useState } from 'react'

interface Props {
  precio: number
  onClose: () => void
}

const BANCOS = [
  {
    nombre: 'Tarjetas BAC', logo: 'BAC',
    color: '#E31837',
    cuotas: [3, 6, 10, 12, 18, 24, 36, 48],
  },
  {
    nombre: 'Tarjetas BAM', logo: 'BAM',
    color: '#004A97',
    cuotas: [2, 3, 6, 10, 12, 15, 18],
  },
  {
    nombre: 'Banco Industrial', logo: 'BI',
    color: '#006DB7',
    cuotas: [3, 6, 12, 18, 24],
  },
  {
    nombre: 'Banrural', logo: 'BANRURAL',
    color: '#007A3D',
    cuotas: [2, 3, 6, 10, 12, 15, 18],
  },
  {
    nombre: 'CHN', logo: 'CHN',
    color: '#1E3A8A',
    cuotas: [3, 6, 12, 18],
  },
  {
    nombre: 'Promerica', logo: 'PROMERICA',
    color: '#00A651',
    cuotas: [3, 6, 12, 18, 24],
  },
]

// Simple interest rate per cuota count
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
  const [expanded, setExpanded] = useState<string | null>('Tarjetas BAC')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.55)', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,
        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>Cuotas mensuales</div>
            <div style={{ fontSize: 12, color: '#64748b', maxWidth: 300, lineHeight: 1.5 }}>
              Préstamos de consumo de tu banco, también conocidos como NeoCuotas, VisaCuotas, MasterCuotas, Cuotas BAC. Pueden tener recargo.
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* Banks list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {BANCOS.map(banco => (
            <div key={banco.nombre} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {/* Bank header */}
              <button
                onClick={() => setExpanded(expanded === banco.nombre ? null : banco.nombre)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Bank logo placeholder */}
                  <div style={{
                    background: banco.color, color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 7px', borderRadius: 5, letterSpacing: 0.5, minWidth: 48, textAlign: 'center',
                  }}>
                    {banco.logo}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{banco.nombre}</span>
                </div>
                <span style={{ fontSize: 18, color: '#94a3b8', transform: expanded === banco.nombre ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
              </button>

              {/* Cuotas list */}
              {expanded === banco.nombre && (
                <div style={{ padding: '0 20px 16px', background: '#fafbfc' }}>
                  {banco.cuotas.map(n => (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{n} cuotas de</span>
                      <span style={{ fontWeight: 700, color: '#1a1f36' }}>
                        Q {calcCuota(precio, n).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
          El mejor precio lo obtienes pagando con tarjeta de crédito, transferencia o efectivo. Si eliges pagar en cuotas el precio varía dependiendo de tu banco y el número de cuotas.
        </div>
      </div>
    </div>
  )
}
