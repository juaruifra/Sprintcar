import { Cliente } from "./Cliente";
import { DireccionCliente } from "./DireccionCliente";

export type EstadoPedido =
  | 'PREPARADO'
  | 'ENTREGADO'
  | 'DEVUELTO'
  | 'PENDIENTE_REVISION'
  | 'FINALIZADO';

export interface Pedido {
  id: number;
  codigo: string;
  clienteId: number;
  direccionEntregaId?: number;
  direccionRecogidaId?: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPedido;
  creadoPor: number;   // userId (auth.users / users) --> en el futuro
  notas?: string;
}

/**
 * Pedido enriquecido
 * NO es una tabla
 * Resultado de una consulta 
 */
export interface PedidoConDetalle extends Pedido {
  cliente?: Cliente;
  direccionEntrega?: DireccionCliente;
  direccionRecogida?: DireccionCliente;
  totalUnidades: number;
  totalImporte: number;
}
