import { useQuery } from "@tanstack/react-query";
import { fetchClientes } from "../../services/clientesSupabaseService";
import { Cliente } from "../../types/Cliente";
import { clientesQueryKey } from "../queryKeys";

export function useClientes() {
  return useQuery<Cliente[], Error>({
    queryKey: clientesQueryKey,
    queryFn: fetchClientes,
  });
}
