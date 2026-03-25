import { z } from "zod";
import { TFunction } from "i18next";

// Regex para validar fechas en formato DD/MM/YYYY.
const DATE_DDMMYYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

export const createProfileFormSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(2, t("validation.nameMin", { count: 2 }))
      .max(50, t("validation.nameMax")),
    lastName: z
      .string()
      .max(120, t("validation.nameMax"))
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
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
    birthDate: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => {
          if (!value) return true;
          return DATE_DDMMYYYY_REGEX.test(value);
        },
        {
          message: t("validation.dateInvalid"),
        }
      ),
    documentId: z
      .string()
      .max(20, t("validation.documentMax"))
      .optional()
      .or(z.literal("")),
    email: z.string().email(t("validation.emailInvalid")).optional(),
  });

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>;



// import { z } from "zod";

// /**
//  * Validación del formulario de perfil
//  * Solo permitimos editar el nombre
//  */
// export const profileFormSchema = z.object({
//   name: z
//     .string()
//     .min(2, "El nombre debe tener al menos 2 caracteres")
//     .max(50, "El nombre es demasiado largo"),
//   email: z.string().email("El correo electrónico no es válido").optional(),
// });

// export type ProfileFormValues = z.infer<typeof profileFormSchema>;
