import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClienteApi } from "../../services/clientesSupabaseService";
import { Cliente } from "../../types/Cliente";
import { clientesQueryKey } from "../queryKeys";

type UpdateClienteInput = {
  id: number;
  data: Omit<Cliente, "id">;
};

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateClienteInput) =>
      updateClienteApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
  });
}
