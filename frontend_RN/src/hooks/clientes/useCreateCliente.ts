import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClienteApi } from "../../services/clientesSupabaseService";
import { clientesQueryKey } from "../queryKeys";
import { Cliente } from "../../types/Cliente";

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Cliente, "id">) => createClienteApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}
