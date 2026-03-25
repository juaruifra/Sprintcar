export interface LineaPedido {
  id: number;
  pedidoId: number;
  productoId: number;
  precioDia: number;
  diasAlquiler: number;
  cantidadTotal: number;
  importeLinea: number;
}
