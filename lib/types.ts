export interface Producto {
  id: number
  codigo: string | null
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  categoria: string | null
  imagenUrl: string | null
  imagenesExtra: string | null  // JSON array de URLs adicionales
}

export interface CartItem extends Producto {
  qty: number
}

export interface PedidoForm {
  nombre: string
  telefono: string
  email: string
  nit: string
  direccion: string
  notas: string
}
