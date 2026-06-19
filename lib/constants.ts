export const WA = '50236714377'
export const POS_URL = process.env.NEXT_PUBLIC_POS_URL || 'https://websoft-pos-web.vercel.app'
export const IVA = 0.05

// Category icon paths (SVG d attribute)
export const CATEGORY_ICONS: Record<string, string> = {
  'Periféricos': 'M2 3h20v14H2z M8 21h8 M12 17v4',
  'CCTV': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'Componentes PC': 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  'Accesorios': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  'Cables': 'M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4 M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M9 12h6',
  'Aires Acondicionados': 'M3 9h18M3 15h18M8 9v6M16 9v6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
}

export const FALLBACK_PRODUCTOS: Omit<import('./types').Producto, 'codigo'>[] = [
  { id: 1, nombre: 'Mouse Inalámbrico Ergonómico', categoria: 'Periféricos', precio: 85, descripcion: 'Mouse óptico inalámbrico, DPI ajustable, batería recargable.', stock: 10, imagenUrl: null },
  { id: 2, nombre: 'Teclado Mecánico USB', categoria: 'Periféricos', precio: 120, descripcion: 'Teclado mecánico retroiluminado, switches duraderos.', stock: 8, imagenUrl: null },
  { id: 3, nombre: 'Audífonos con Micrófono', categoria: 'Periféricos', precio: 150, descripcion: 'Stereo con micrófono integrado, cancelación de ruido.', stock: 5, imagenUrl: null },
  { id: 4, nombre: 'Cámara CCTV Domo IP 2MP', categoria: 'CCTV', precio: 450, descripcion: 'Visión nocturna 30m, resistente al agua IP67.', stock: 6, imagenUrl: null },
  { id: 5, nombre: 'DVR 4 Canales 1080P', categoria: 'CCTV', precio: 850, descripcion: 'Grabador 4 canales Full HD, acceso remoto.', stock: 4, imagenUrl: null },
  { id: 6, nombre: 'Webcam Full HD 1080P', categoria: 'Periféricos', precio: 195, descripcion: '1080P con micrófono, Plug and Play.', stock: 7, imagenUrl: null },
  { id: 7, nombre: 'Memoria RAM 8GB DDR4', categoria: 'Componentes PC', precio: 185, descripcion: 'DDR4 3200MHz. Compatible Intel y AMD.', stock: 12, imagenUrl: null },
  { id: 8, nombre: 'SSD 480GB SATA', categoria: 'Componentes PC', precio: 245, descripcion: 'SATA III 550MB/s. Ideal para upgrade.', stock: 9, imagenUrl: null },
]
