import { supabase } from "../lib/supabaseClient";
import { Cliente } from "../types/Cliente";
import i18n from "../i18n/i18n";

/**
 * Tipo que representa la fila cruda tal y como viene de Supabase.
 * Usamos snake_case porque así está en la BD.
 */
type ClienteRow = {
  id: number;
  nombre: string;
  nif_cif: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};


 //Mapea de la fila de Supabase al tipo de la app.
function mapRowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    nifCif: row.nif_cif ?? undefined,
    telefono: row.telefono ?? undefined,
    email: row.email ?? undefined,
    notas: row.notas ?? undefined,
    activo: row.activo,
  };
}


// Prepara los datos para INSERT/UPDATE en Supabase (camelCase → snake_case).
// No incluimos id porque lo maneja la BD.
function mapClienteToRowInput(
  data: Omit<Cliente, "id">
): Omit<ClienteRow, "id" | "created_at" | "updated_at"> {
  return {
    nombre: data.nombre,
    nif_cif: data.nifCif ?? null,
    telefono: data.telefono ?? null,
    email: data.email ?? null,
    notas: data.notas ?? null,
    activo: data.activo,
  };
}

// Obtiene todos los clientes desde Supabase.
export async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[fetchClientes] Error al obtener clientes:", error);
    throw error;
  }

  // data puede ser null si no hay registros
  if (!data) return [];

  return (data as ClienteRow[]).map(mapRowToCliente);
}


// Obtiene un cliente por id.
export async function fetchClienteById(id: number): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // devuelve null si no encuentra nada

  if (error) {
    console.error("[fetchClienteById] Error al obtener cliente:", error);
    throw error;
  }

  if (!data) return null;

  return mapRowToCliente(data as ClienteRow);
}

// Crea un cliente nuevo.
export async function createClienteApi(
  data: Omit<Cliente, "id">
): Promise<Cliente> {
  const rowInput = mapClienteToRowInput(data);

  const { data: insertData, error } = await supabase
    .from("clientes")
    .insert(rowInput)
    .select("*")
    .single();

  if (error) {
    //console.error("[createClienteApi] Error al crear cliente:", error);
    throw error;
  }

  return mapRowToCliente(insertData as ClienteRow);
}

// Actualiza un cliente existente.
export async function updateClienteApi(
  id: number,
  data: Omit<Cliente, "id">
): Promise<Cliente> {
  const rowInput = mapClienteToRowInput(data);

  const { data: updateData, error } = await supabase
    .from("clientes")
    .update(rowInput)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    //console.error("[updateClienteApi] Error al actualizar cliente:", error);
    throw error;
  }

  return mapRowToCliente(updateData as ClienteRow);
}

// Elimina un cliente por id.
export async function deleteClienteApi(id: number): Promise<void> {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) {
    //console.error("Error al borrar cliente:", error);
    
    // Detectar violación de foreign key (cliente tiene pedidos)
    if (error.code === "23503") {
      throw new Error(i18n.t("clients.errorDeleteOrders"));
    }
    
    // Otros errores de base de datos
    throw new Error(error.message || i18n.t("common.unexpectedError"));
  }
}
