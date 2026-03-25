import { supabase } from "../lib/supabaseClient";

// Representa una fila de la tabla lineas_pedido tal como viene de Supabase
export type LineaPedidoRow = {
  id: number;
  pedido_id: number;
  descripcion: string;
  precio_dia: number;
  dias_alquiler: number;
  cantidad_total: number;
  importe_linea: number;
};

// Obtiene todas las líneas asociadas a un pedido
export async function fetchLineasByPedido(
  pedidoId: number
): Promise<LineaPedidoRow[]> {
  const { data, error } = await supabase
    .from("lineas_pedido")
    .select("*")
    .eq("pedido_id", pedidoId);

  if (error) {
    throw error;
  }

  return data ?? [];
}
