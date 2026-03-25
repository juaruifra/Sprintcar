import { Cliente } from "../../../data/mockApi";

export type ClienteFormValues = Omit<Cliente, "id">;
