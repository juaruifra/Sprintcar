
import { z } from "zod";
import { TFunction } from "i18next";

export const createChangePasswordSchema = (t: TFunction) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("validation.currentPasswordRequired")),

      newPassword: z
        .string()
        .min(6, t("validation.passwordMin", { count: 6 }))
        .max(50, t("validation.passwordMax")),

      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;


// import { z } from "zod";

// /**
//  * Schema de validación para cambio de contraseña
//  */
// export const changePasswordSchema = z
//   .object({
//     currentPassword: z
//       .string()
//       .min(1, "La contraseña actual es obligatoria"),
    
//     newPassword: z
//       .string()
//       .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
//       .max(50, "La contraseña es demasiado larga"),
    
//     confirmPassword: z
//       .string()
//       .min(1, "Debes confirmar la nueva contraseña"),
//   })
//   // Validación personalizada: las contraseñas deben coincidir
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Las contraseñas no coinciden",
//     path: ["confirmPassword"], // Error en el campo confirmPassword
//   });

// export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

