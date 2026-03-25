import { useQuery } from "@tanstack/react-query";
import { fetchClienteById } from "../../services/clientesSupabaseService";
import { Cliente } from "../../types/Cliente";
import { clienteQueryKey } from "../queryKeys";

export function useCliente(clienteId: number | null) {
  return useQuery<Cliente | null, Error>({
    queryKey: clienteQueryKey(clienteId ?? 0),
    queryFn: () => {
      if (clienteId === null) {
        return Promise.resolve(null);
      }
      return fetchClienteById(clienteId);
    },
    enabled: clienteId !== null,
  });
}
