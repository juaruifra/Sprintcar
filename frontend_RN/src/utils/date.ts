import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(dateIso: string): string {
  return format(new Date(dateIso), "dd/MM/yyyy", {
    locale: es,
  });
}
