// mockApi.ts
// Datos ficticios + tipos para simular servicios en una app React Native

// 1. TIPOS BÁSICOS
// -----------------------------------------------------

export type RoleName = 'NORMAL' | 'ADMIN';

export interface Role {
  id: number;
  name: RoleName;
  description?: string;
}

export interface User {
  id: number;
  roleId: number;
  name: string;
  email: string;
}

export type EstadoPedido =
  | 'PREPARADO'
  | 'ENTREGADO'
  | 'DEVUELTO'
  | 'PENDIENTE_REVISION'
  | 'FINALIZADO';

export interface Cliente {
  id: number;
  nombre: string;
  nifCif?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  activo: boolean;
}

export interface DireccionCliente {
  id: number;
  clienteId: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioDia: number; // precio por unidad y día
  activo: boolean;
}

export interface TallaProducto {
  id: number;
  productoId: number;
  codigoTalla: string; // 'S','M','L','XL','2x3m','42', etc.
  descripcion?: string;
  activo: boolean;
}

export interface Pedido {
  id: number;
  codigo: string;
  clienteId: number;
  direccionEntregaId?: number;
  direccionRecogidaId?: number;
  fechaInicio: string; // ISO (YYYY-MM-DD)
  fechaFin: string;    // ISO
  estado: EstadoPedido;
  creadoPor: number;   // userId
  notas?: string;
}

export interface LineaPedido {
  id: number;
  pedidoId: number;
  productoId: number;
  precioDia: number;   // copia del precio del producto en el momento del pedido
  diasAlquiler: number;
  cantidadTotal: number;
  importeLinea: number;
}

export interface TallaLineaPedido {
  id: number;
  lineaPedidoId: number;
  tallaId: number;
  cantidad: number;
}

export interface HistorialEstadoPedido {
  id: number;
  pedidoId: number;
  estadoAnterior?: EstadoPedido;
  estadoNuevo: EstadoPedido;
  cambiadoPor: number;   // userId
  fechaCambio: string;   // ISO datetime
  observaciones?: string;
}

// Tipos enriquecidos para usar en la UI

export interface LineaPedidoConDetalle extends LineaPedido {
  producto: Producto;
  tallas: Array<{
    talla: TallaProducto;
    cantidad: number;
  }>;
}

export interface PedidoConDetalle extends Pedido {
  cliente: Cliente;
  direccionEntrega?: DireccionCliente;
  direccionRecogida?: DireccionCliente;
  lineas: LineaPedidoConDetalle[];
  totalUnidades: number;
  totalImporte: number;
}

// Credenciales SOLO para autenticación (mock)
// En un backend real esto estaría en BD y con hash
export type AuthCredential = {
  userId: number;
  password: string;
};

// 2. DATOS FICTICIOS
// -----------------------------------------------------

// Roles
export const roles: Role[] = [
  { id: 1, name: 'NORMAL', description: 'Usuario operativo' },
  { id: 2, name: 'ADMIN', description: 'Administrador del sistema' },
];

// Usuarios
export const usuarios: User[] = [
  {
    id: 1,
    roleId: 2,
    name: 'Admin Principal',
    email: 'admin@sprintcar.com',
  },
  {
    id: 2,
    roleId: 1,
    name: 'Pepe',
    email: 'pepe@sprintcar.com',
  },
];

// Usuarios válidos para login (modo demo)
export const credentials: AuthCredential[] = [
  {
    userId: 1,
    password: "admin123",
  },
  {
    userId: 2,
    password: "pepe123",
  },
];

// Clientes
export const clientes: Cliente[] = [
  {
    id: 1,
    nombre: 'Carlos López',
    telefono: '612000111',
    email: 'carlos@example.com',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Ana Torres',
    telefono: '612000222',
    email: 'ana@example.com',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Grupo Evento SL',
    nifCif: 'B12345678',
    telefono: '955000333',
    email: 'contacto@eventosl.com',
    activo: false,
  },
];

// Direcciones
export const direccionesCliente: DireccionCliente[] = [
  {
    id: 1,
    clienteId: 1,
    alias: 'Casa',
    linea1: 'Calle Mayor 12',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    codigoPostal: '28013',
    pais: 'España',
    esPrincipal: true,
  },
  {
    id: 2,
    clienteId: 2,
    alias: 'Piso',
    linea1: 'Avenida del Sol 88',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    codigoPostal: '46001',
    pais: 'España',
    esPrincipal: true,
  },
  {
    id: 3,
    clienteId: 3,
    alias: 'Almacén principal',
    linea1: 'Polígono Norte 4',
    ciudad: 'Sevilla',
    provincia: 'Sevilla',
    codigoPostal: '41001',
    pais: 'España',
    esPrincipal: true,
  },
];

// Productos
export const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Casco de moto',
    descripcion: 'Casco integral homologado',
    precioDia: 8,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Traje de gala',
    descripcion: 'Traje de etiqueta para eventos',
    precioDia: 12,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Carpa XL',
    descripcion: 'Carpa para eventos exteriores 5x10m',
    precioDia: 35,
    activo: true,
  },
];

// Tallas / tamaños
export const tallasProducto: TallaProducto[] = [
  // Cascos
  { id: 1, productoId: 1, codigoTalla: 'M', descripcion: 'Talla M', activo: true },
  { id: 2, productoId: 1, codigoTalla: 'L', descripcion: 'Talla L', activo: true },
  // Trajes
  { id: 3, productoId: 2, codigoTalla: 'M', descripcion: 'Talla M', activo: true },
  { id: 4, productoId: 2, codigoTalla: 'L', descripcion: 'Talla L', activo: true },
  // Carpa XL (único tamaño)
  { id: 5, productoId: 3, codigoTalla: 'XL', descripcion: 'Tamaño único XL', activo: true },
];

// Pedidos
export const pedidos: Pedido[] = [
  {
    id: 1,
    codigo: 'P-001',
    clienteId: 1,
    direccionEntregaId: 1,
    direccionRecogidaId: 1,
    fechaInicio: '2025-12-10',
    fechaFin: '2025-12-14',
    estado: 'PREPARADO',
    creadoPor: 2,
    notas: 'Entrega por la mañana',
  },
  {
    id: 2,
    codigo: 'P-002',
    clienteId: 2,
    direccionEntregaId: 2,
    direccionRecogidaId: 2,
    fechaInicio: '2025-12-08',
    fechaFin: '2025-12-11',
    estado: 'ENTREGADO',
    creadoPor: 2,
  },
  {
    id: 3,
    codigo: 'P-003',
    clienteId: 3,
    direccionEntregaId: 3,
    direccionRecogidaId: 3,
    fechaInicio: '2025-12-05',
    fechaFin: '2025-12-09',
    estado: 'PENDIENTE_REVISION',
    creadoPor: 1,
    notas: 'Revisar posibles daños en carpa',
  },
  {
    id: 4,
    codigo: 'P-004',
    clienteId: 1,
    direccionEntregaId: 1,
    direccionRecogidaId: 1,
    fechaInicio: '2025-12-01',
    fechaFin: '2025-12-03',
    estado: 'FINALIZADO',
    creadoPor: 2,
  },
];

// Líneas de pedido
export const lineasPedido: LineaPedido[] = [
  // Pedido 1 (Carlos) – Casco + Traje
  {
    id: 1,
    pedidoId: 1,
    productoId: 1,  // Casco
    precioDia: 8,
    diasAlquiler: 4,
    cantidadTotal: 3,
    importeLinea: 3 * 8 * 4, // 96
  },
  {
    id: 2,
    pedidoId: 1,
    productoId: 2,  // Traje
    precioDia: 12,
    diasAlquiler: 4,
    cantidadTotal: 2,
    importeLinea: 2 * 12 * 4, // 96
  },
  // Pedido 2 (Ana) – Sólo cascos
  {
    id: 3,
    pedidoId: 2,
    productoId: 1,
    precioDia: 8,
    diasAlquiler: 3,
    cantidadTotal: 3,
    importeLinea: 3 * 8 * 3, // 72
  },
  // Pedido 3 (Grupo Evento SL) – Trajes + Carpa + Cascos
  {
    id: 4,
    pedidoId: 3,
    productoId: 2,
    precioDia: 12,
    diasAlquiler: 4,
    cantidadTotal: 6,
    importeLinea: 6 * 12 * 4, // 288
  },
  {
    id: 5,
    pedidoId: 3,
    productoId: 3,
    precioDia: 35,
    diasAlquiler: 4,
    cantidadTotal: 2,
    importeLinea: 2 * 35 * 4, // 280
  },
  {
    id: 6,
    pedidoId: 3,
    productoId: 1,
    precioDia: 8,
    diasAlquiler: 4,
    cantidadTotal: 6,
    importeLinea: 6 * 8 * 4, // 192
  },
  // Pedido 4 (Carlos, histórico)
  {
    id: 7,
    pedidoId: 4,
    productoId: 1,
    precioDia: 8,
    diasAlquiler: 2,
    cantidadTotal: 2,
    importeLinea: 2 * 8 * 2, // 32
  },
];

// Detalle por talla
export const tallasLineaPedido: TallaLineaPedido[] = [
  // Pedido 1, línea 1 (Cascos)
  { id: 1, lineaPedidoId: 1, tallaId: 1, cantidad: 2 }, // M
  { id: 2, lineaPedidoId: 1, tallaId: 2, cantidad: 1 }, // L
  // Pedido 1, línea 2 (Trajes)
  { id: 3, lineaPedidoId: 2, tallaId: 3, cantidad: 1 }, // M
  { id: 4, lineaPedidoId: 2, tallaId: 4, cantidad: 1 }, // L

  // Pedido 2, línea 3 (Cascos)
  { id: 5, lineaPedidoId: 3, tallaId: 1, cantidad: 1 }, // M
  { id: 6, lineaPedidoId: 3, tallaId: 2, cantidad: 2 }, // L

  // Pedido 3, línea 4 (Trajes)
  { id: 7, lineaPedidoId: 4, tallaId: 3, cantidad: 4 }, // M
  { id: 8, lineaPedidoId: 4, tallaId: 4, cantidad: 2 }, // L
  // Pedido 3, línea 5 (Carpa XL)
  { id: 9, lineaPedidoId: 5, tallaId: 5, cantidad: 2 }, // XL
  // Pedido 3, línea 6 (Cascos)
  { id: 10, lineaPedidoId: 6, tallaId: 1, cantidad: 3 }, // M
  { id: 11, lineaPedidoId: 6, tallaId: 2, cantidad: 3 }, // L

  // Pedido 4, línea 7 (Cascos)
  { id: 12, lineaPedidoId: 7, tallaId: 1, cantidad: 2 }, // M
];

// Historial de estados (ejemplo simple)
export const historialEstados: HistorialEstadoPedido[] = [
  {
    id: 1,
    pedidoId: 3,
    estadoAnterior: 'DEVUELTO',
    estadoNuevo: 'PENDIENTE_REVISION',
    cambiadoPor: 2,
    fechaCambio: '2025-12-09T18:30:00Z',
    observaciones: 'Faltan fotos de la carpa',
  },
];

// 3. HELPERS INTERNOS
// -----------------------------------------------------

const wait = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getClienteById = (id: number) =>
  clientes.find((c) => c.id === id);

const getDireccionById = (id?: number) =>
  direccionesCliente.find((d) => d.id === id);

const getProductoById = (id: number) =>
  productos.find((p) => p.id === id)!;

const getTallaById = (id: number) =>
  tallasProducto.find((t) => t.id === id)!;

// Calcula detalle de líneas y totales de un pedido
export const buildPedidoConDetalle = (pedido: Pedido): PedidoConDetalle => {
  const cliente = getClienteById(pedido.clienteId);
  if (!cliente) {
    throw new Error(`Cliente ${pedido.clienteId} no encontrado`);
  }

  const lineas = lineasPedido
    .filter((l) => l.pedidoId === pedido.id)
    .map<LineaPedidoConDetalle>((l) => {
      const producto = getProductoById(l.productoId);
      const tallas = tallasLineaPedido
        .filter((tl) => tl.lineaPedidoId === l.id)
        .map((tl) => ({
          talla: getTallaById(tl.tallaId),
          cantidad: tl.cantidad,
        }));

      return {
        ...l,
        producto,
        tallas,
      };
    });

  const totalUnidades = lineas.reduce(
    (sum, l) => sum + l.cantidadTotal,
    0
  );

  const totalImporte = lineas.reduce(
    (sum, l) => sum + l.importeLinea,
    0
  );

  return {
    ...pedido,
    cliente,
    direccionEntrega: getDireccionById(pedido.direccionEntregaId),
    direccionRecogida: getDireccionById(pedido.direccionRecogidaId),
    lineas,
    totalUnidades,
    totalImporte,
  };
};

// 4. SERVICIOS FALSOS (API MOCK)
// -----------------------------------------------------

// Listado simple de pedidos con totales (para dashboard)
export const listPedidosResumen = async (): Promise<PedidoConDetalle[]> => {
  await wait();
  // Podrías ordenar por fecha, estado, etc.
  return pedidos.map(buildPedidoConDetalle);
};

// Pedidos activos (entre fecha inicio y fin, excluyendo finalizados, por ejemplo)
export const listPedidosActivos = async (): Promise<PedidoConDetalle[]> => {
  await wait();
  const today = new Date('2025-12-10'); // puedes adaptar o usar new Date()
  return pedidos
    .filter((p) => {
      const inicio = new Date(p.fechaInicio);
      const fin = new Date(p.fechaFin);
      const isInRange = inicio <= today && fin >= today;
      const notFinalizado = p.estado !== 'FINALIZADO';
      return isInRange && notFinalizado;
    })
    .map(buildPedidoConDetalle);
};

// Obtener detalle de un pedido concreto
export const getPedidoById = async (
  pedidoId: number
): Promise<PedidoConDetalle | null> => {
  await wait();
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return null;
  return buildPedidoConDetalle(pedido);
};

// Listado de clientes
export const listClientes = async (): Promise<Cliente[]> => {
  await wait();
  return clientes;
};

// Listado de productos
export const listProductos = async (): Promise<Producto[]> => {
  await wait();
  return productos;
};

// Ejemplo de actualización de estado (solo in-memory)
export const updateEstadoPedido = async (
  pedidoId: number,
  nuevoEstado: EstadoPedido,
  userId: number
): Promise<PedidoConDetalle> => {
  await wait();

  const pedidoIndex = pedidos.findIndex((p) => p.id === pedidoId);
  if (pedidoIndex === -1) {
    throw new Error('Pedido no encontrado');
  }

  const anterior = pedidos[pedidoIndex].estado;
  pedidos[pedidoIndex].estado = nuevoEstado;

  historialEstados.push({
    id: historialEstados.length + 1,
    pedidoId,
    estadoAnterior: anterior,
    estadoNuevo: nuevoEstado,
    cambiadoPor: userId,
    fechaCambio: new Date().toISOString(),
  });

  return buildPedidoConDetalle(pedidos[pedidoIndex]);
};

