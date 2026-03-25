import { clientes, listClientes, direccionesCliente,pedidos } from "../../data/mockApi";
import type { Cliente } from "../../data/mockApi";

// Simula un pequeño delay como si fuera una API real
const wait = (ms = 300) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Devuelve la lista de clientes
 * IMPORTANTE: devolvemos una COPIA del array
 * para que React detecte cambios y re-renderice
 */
export async function getClientes(): Promise<Cliente[]> {
  await wait();

  const data = await listClientes();

  // Devolvemos una nueva referencia
  return [...data];
}

/**
 * Obtiene un cliente por id
 * Trabaja sobre la copia devuelta por getClientes
 */
export async function getClienteById(
  id: number
): Promise<Cliente | null> {
  const clientes = await getClientes();
  return clientes.find((cliente) => cliente.id === id) || null;
}

/**
 * Crea un cliente nuevo (en memoria)
 */
export const createCliente = async (
  data: Omit<Cliente, "id">
): Promise<Cliente> => {
  await wait();

  // Generamos un id simple
  const newCliente: Cliente = {
    id: clientes.length + 1,
    ...data,
  };

  // Mutamos el mock (esto está bien aquí)
  clientes.push(newCliente);

  return newCliente;
};

/**
 * Actualiza un cliente existente (en memoria)
 */
export const updateCliente = async (
  clienteId: number,
  data: Omit<Cliente, "id">
): Promise<Cliente> => {
  await wait();

  const index = clientes.findIndex((c) => c.id === clienteId);
  if (index === -1) {
    throw new Error("Cliente no encontrado");
  }

  // Sobrescribimos los datos manteniendo el id
  clientes[index] = {
    id: clienteId,
    ...data,
  };

  return clientes[index];
};

// Borrar un cliente de la memoria
export const deleteCliente = async (
  clienteId: number
): Promise<void> => {
  await wait();

  const index = clientes.findIndex((c) => c.id === clienteId);
  if (index === -1) {
    throw new Error("Cliente no encontrado");
  }

  // Comprobacion existencia de pedidos asociados
  const tienePedidos = pedidos.some((pedido) => pedido.clienteId === clienteId);

  if(tienePedidos){
    throw new Error("No se puede borrar un cliente con pedidos asociados");
  }

  // Comprobación existencia de direcciones asociadas
  const tieneDir = direccionesCliente.some((dir) => dir.clienteId === clienteId);

  if(tieneDir){
    throw new Error("No se puede borrar un cliente con direcciones asociadas");
  }

  // Borramos el cliente
  clientes.splice(index, 1);
 
};
