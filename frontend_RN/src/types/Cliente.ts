export interface Cliente {
  id: number;
  nombre: string;
  nifCif?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  activo: boolean;
}
