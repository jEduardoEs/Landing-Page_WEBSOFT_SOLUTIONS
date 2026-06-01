import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebSoft Solutions | Tecnología y Seguridad · Guastatoya, El Progreso',
  description: 'Tecnología y seguridad en Guastatoya, El Progreso y Guatemala. Instalación CCTV, reparación PC, periféricos y más.',
  keywords: 'tecnología Guatemala, CCTV Guastatoya, periféricos El Progreso, reparación laptops Guatemala',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
