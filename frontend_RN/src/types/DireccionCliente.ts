export interface DireccionCliente {
  id: number;
  clienteId: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal: boolean;
}
