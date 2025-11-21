// User types
export type UserRole = 'admin' | 'vendedor' | 'cliente';

export interface User {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  role: UserRole;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  estado?: string;
  created_at: string;
  updated_at: string;
}

// Equipment/Product types
export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id?: number;
  categoria_nombre?: string;
  material?: string;
  dimensiones?: string;
  imagen_url?: string;
  ficha_tecnica_url?: string;
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
  created_at?: string;
  updated_at?: string;
}

// Category types
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  equipment_count?: number;
  estado?: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

// Cart types
export interface CartItem {
  equipo_id: number;
  nombre: string;
  codigo: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string;
  stock?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
}

// Cotización types
export type CotizacionEstado = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';

export interface CotizacionItem {
  id?: number;
  cotizacion_id?: number;
  equipo_id: number;
  equipo_nombre: string;
  equipo_codigo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: number;
  numero_cotizacion: string;
  cliente_id: number;

  // Campos extendidos del cliente
  cliente_nombre?: string;
  cliente_apellido?: string; // Agregado
  cliente_email?: string;    // Agregado
  cliente_telefono?: string; // Agregado
  cliente_empresa?: string;  // Agregado (alias de empresa_cliente o del usuario)

  empresa_cliente?: string;
  contacto_cliente?: string;

  vendedor_id?: number;
  // Campos extendidos del vendedor
  vendedor_nombre?: string;
  vendedor_apellido?: string; // Agregado
  vendedor_email?: string;    // Agregado

  estado: CotizacionEstado;
  subtotal: number;
  igv: number;
  total: number;
  notas?: string;
  created_at: string;
  updated_at?: string;
  fecha_vencimiento?: string;
  items: CotizacionItem[]; // Cambiado a obligatorio para evitar error en .map
}

export interface CotizacionStats {
  total: number;
  borrador: number;
  enviada: number;
  aprobada: number;
  rechazada: number;
  vencida: number;
}

export interface CotizacionFilters {
  search?: string;
  estado?: CotizacionEstado | '' | string;
  page?: number;
  limit?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CatalogFilters {
  search?: string;
  categoria_id?: number;
  min_precio?: number;
  max_precio?: number;
  page?: number;
  limit?: number;
}

export interface CatalogStats {
  total_equipos: number;
  total_categorias: number;
  precio_min: number;
  precio_max: number;
}

export interface InventoryStats {
  total_equipos: number;
  total_categorias: number;
  total_stock: number;
  valor_inventario: number;
  equipos_bajo_stock: number;
  equipos_sin_stock: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type Theme = 'light' | 'dark';

export interface ReportKPIs {
  totalVentas: number;
  totalOrdenes: number;
  ticketPromedio: number;
  conversionRate: number;
}

export interface SalesByMonth {
  name: string;
  ventas: number;
}

export interface SalesBySeller {
  name: string;
  fullName: string;
  ventas: number;
}

export interface SalesStatus {
  name: string;
  value: number;
  color: string;
}