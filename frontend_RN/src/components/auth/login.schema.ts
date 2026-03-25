import { z } from "zod";
import { TFunction } from "i18next";

export const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),

    password: z
      .string()
      .min(4, t("validation.passwordMin", { count: 4 })),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;



// import { z } from "zod";

// export const loginSchema = z.object({
//   email: z
//     .string()
//     .min(1, "El correo es obligatorio")
//     .email("Correo electrónico inválido"),

//   password: z
//     .string()
//     .min(4, "La contraseña debe tener al menos 4 caracteres"),
// });

// export type LoginFormValues = z.infer<typeof loginSchema>;


