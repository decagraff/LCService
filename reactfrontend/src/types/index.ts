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
  created_at?: string;
  updated_at?: string;
}

// Category types
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  equipment_count?: number;
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

export interface Cotizacion {
  id: number;
  numero_cotizacion: string;
  cliente_id: number;
  cliente_nombre?: string;
  empresa_cliente?: string;
  contacto_cliente?: string;
  vendedor_id?: number;
  vendedor_nombre?: string;
  estado: CotizacionEstado;
  subtotal: number;
  igv: number;
  total: number;
  notas?: string;
  created_at: string;
  updated_at?: string;
  fecha_vencimiento?: string;
  items?: CotizacionItem[];
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
  estado?: CotizacionEstado | '';
}

export interface CotizacionItem {
  id: number;
  cotizacion_id: number;
  equipo_id: number;
  equipo_nombre: string;
  equipo_codigo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Filter types
export interface CatalogFilters {
  search?: string;
  categoria_id?: number;
  min_precio?: number;
  max_precio?: number;
}

export interface CatalogStats {
  total_equipos: number;
  total_categorias: number;
  precio_min: number;
  precio_max: number;
}

// Inventory Stats types
export interface InventoryStats {
  total_equipos: number;
  total_categorias: number;
  total_stock: number;
  valor_inventario: number;
  equipos_bajo_stock: number;
  equipos_sin_stock: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Theme types
export type Theme = 'light' | 'dark';

// Report types
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
