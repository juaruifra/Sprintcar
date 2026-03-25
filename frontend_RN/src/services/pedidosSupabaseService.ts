import { supabase } from "../lib/supabaseClient";
import { PedidoConDetalle } from "../types/Pedido";
// Servicio para leer las líneas de un pedido
//import { fetchLineasByPedido } from "./lineasPedidoSupabaseService";

type PedidoRow = {
  id: number;
  codigo: string;
  cliente_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  creado_por: number;
  notas: string | null;
};

export async function fetchPedidosByCliente(
  clienteId: number
): Promise<PedidoConDetalle[]> {
  // Primera consulta: obtenemos todos los pedidos del cliente
  const { data: pedidos, error: pedidosError } = await supabase
    .from("pedidos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha_inicio", { ascending: false });

  // Si falla la consulta de pedidos, error
  if (pedidosError) {
    throw pedidosError;
  }

  // Si el cliente no tiene pedidos, devolvemos lista vacía
  if (!pedidos || pedidos.length === 0) {
    return [];
  }

  // Extraemos los ids de los pedidos para usarlos en la siguiente consulta
  const pedidoIds = pedidos.map((p) => p.id);

  // Segunda consulta: obtenemos todas las líneas de esos pedidos de una sola vez
  const { data: lineas, error: lineasError } = await supabase
    .from("lineas_pedido")
    .select("*")
    .in("pedido_id", pedidoIds);

  // Si falla la consulta de líneas, propagamos el error
  if (lineasError) {
    throw lineasError;
  }

  // Nos aseguramos que lineas no sea null
  const lineasPedido = lineas ?? [];

  // Construimos cada pedido con sus líneas y totales calculados
  return pedidos.map((pedido) => {
    
    // Filtramos las líneas que pertenecen a este pedido
    const lineasDelPedido = lineasPedido.filter(
      (l) => l.pedido_id === pedido.id
    );

    // Calculamos el total de unidades sumando todas las líneas
    const totalUnidades = lineasDelPedido.reduce(
      (sum, linea) => sum + linea.cantidad_total,
      0
    );

    // Calculamos el importe total sumando el importe de cada línea
    const totalImporte = lineasDelPedido.reduce(
      (sum, linea) => sum + linea.importe_linea,
      0
    );

    // Devolvemos el pedido con el formato que espera la aplicación
    return {
      id: pedido.id,
      codigo: pedido.codigo,
      clienteId: pedido.cliente_id,
      fechaInicio: pedido.fecha_inicio,
      fechaFin: pedido.fecha_fin,
      estado: pedido.estado,
      creadoPor: pedido.creado_por,
      notas: pedido.notas ?? undefined,

      // Estos campos aún no se están utilizando en la UI
      cliente: undefined,
      direccionEntrega: undefined,
      direccionRecogida: undefined,

      // Asignamos las líneas reales del pedido
      lineas: lineasDelPedido.map((l) => ({
        id: l.id,
        pedidoId: l.pedido_id,
        productoId: l.producto_id,
        precioDia: l.precio_dia,
        diasAlquiler: l.dias_alquiler,
        cantidadTotal: l.cantidad_total,
        importeLinea: l.importe_linea,
      })),

      // Asignamos los totales calculados
      totalUnidades,
      totalImporte,
    };
  });
}

