import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClienteApi } from "../../services/clientesSupabaseService";
import { clientesQueryKey } from "../queryKeys";

export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clienteId: number) => deleteClienteApi(clienteId),
    onSuccess: () => {
      // Invalidar la caché de clientes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: clientesQueryKey });
    },
    // NO manejamos onError aquí, dejamos que se propague
    // al catch en useConfirmAction para mostrar el error personalizado
  });
}
