import { PedidoConDetalle, pedidos,buildPedidoConDetalle } from "../../data/mockApi";


// Simula latencia
const delay = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getPedidosByCliente(
  clienteId: number
): Promise<PedidoConDetalle[]> {
  await delay();

  return pedidos
    .filter((p) => p.clienteId === clienteId)
    .sort(
      (a, b) =>
        new Date(b.fechaInicio).getTime() -
        new Date(a.fechaInicio).getTime()
    )
    .slice(0, 5)
    .map(buildPedidoConDetalle);
}
