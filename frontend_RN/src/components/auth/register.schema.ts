import { TFunction } from 'i18next';
import { z } from 'zod';

export const createRegisterSchema = (t: TFunction) =>
  z
    .object({
      email: z
        .string()
        .min(1, t('validation.emailRequired'))
        .email(t('validation.emailInvalid')),
      password: z
        .string()
        .min(8, t('validation.passwordMin', { count: 8 }))
        .max(255, t('validation.passwordMax')),
      confirmPassword: z
        .string()
        .min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validation.passwordsMismatch'),
    });

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
