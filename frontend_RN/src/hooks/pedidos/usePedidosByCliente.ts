import { useQuery } from "@tanstack/react-query";
import { fetchPedidosByCliente } from "../../services/pedidosSupabaseService";
import { pedidosByClienteQueryKey } from "../queryKeys";
import { PedidoConDetalle } from "../../types/Pedido";

export function usePedidosByCliente(clienteId: number | null) {
  return useQuery<PedidoConDetalle[], Error>({
    queryKey: clienteId ? pedidosByClienteQueryKey(clienteId) : [],
    queryFn: () => fetchPedidosByCliente(clienteId as number),
    enabled: clienteId !== null,
  });
}
