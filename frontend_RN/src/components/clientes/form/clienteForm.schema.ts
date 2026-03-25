import { z } from "zod";
import { TFunction } from "i18next";

/**
 * Esquema de validación para el formulario de Cliente
 * Coincide con ClienteFormValues (Cliente sin id)
 */
export const createClienteFormSchema = (t: TFunction) =>
  z.object({
    nombre: z
      .string()
      .min(1, t("validation.nameRequired")),

    nifCif: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          const nifRegex = /^[A-Za-z0-9]{6,15}$/;
          return nifRegex.test(value);
        },
        {
          message: t("validation.nifCifInvalid"),
        }
      ),

    telefono: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          const normalized = value.replace(/\s+/g, "");
          const phoneRegex = /^\+?\d{9,15}$/;
          return phoneRegex.test(normalized);
        },
        {
          message: t("validation.phoneInvalid"),
        }
      ),

    email: z
      .string()
      .email(t("validation.emailInvalid"))
      .optional()
      .or(z.literal("")),

    notas: z.string().optional(),

    activo: z.boolean(),
  });

export type ClienteFormValues = z.infer<ReturnType<typeof createClienteFormSchema>>;




// import { z } from "zod";

// /**
//  * Esquema de validación para el formulario de Cliente
//  * Coincide con ClienteFormValues (Cliente sin id)
//  */
// export const clienteFormSchema = z.object({
//   nombre: z
//     .string()
//     .min(1, "El nombre es obligatorio"),

//   nifCif: z
//   .string()
//   .optional()
//   .refine(
//     (value) => {
//       // Permitimos vacío (campo opcional)
//       if (!value) return true;

//       // Validación básica: solo letras y números, longitud razonable
//       const nifRegex = /^[A-Za-z0-9]{6,15}$/;
//       return nifRegex.test(value);
//     },
//     {
//       message: "NIF / CIF no tiene un formato válido",
//     }
//   ),
//  telefono: z
//   .string()
//   .optional()
//   .refine(
//     (value) => {
//       // Permitimos vacío (campo opcional)
//       if (!value) return true;

//       // Quitamos espacios para validar
//       const normalized = value.replace(/\s+/g, "");

//       // Validación básica de teléfono (nacional o internacional)
//       const phoneRegex = /^\+?\d{9,15}$/;
//       return phoneRegex.test(normalized);
//     },
//     {
//       message: "Teléfono no tiene un formato válido",
//     }
//   ),
//   email: z
//     .string()
//     .email("Email no válido")
//     .optional()
//     .or(z.literal("")),

//   notas: z
//     .string()
//     .optional(),

//   activo: z.boolean(),
// });
