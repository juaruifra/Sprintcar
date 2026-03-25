import { TFunction } from 'i18next';
import { z } from 'zod';

export const createVehicleFormSchema = (t: TFunction) =>
  z.object({
    licensePlate: z.string().min(1, t('validation.required')).max(20, t('validation.maxLength')),
    brand: z.string().min(1, t('validation.required')).max(80, t('validation.maxLength')),
    model: z.string().min(1, t('validation.required')).max(120, t('validation.maxLength')),
    year: z
      .string()
      .min(1, t('validation.required'))
      .refine((value) => /^\d{4}$/.test(value), t('validation.yearInvalid')),
    category: z.string().optional(),
    pricePerDay: z
      .string()
      .min(1, t('validation.required'))
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, t('validation.priceInvalid')),
    mileage: z
      .string()
      .optional()
      .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), t('validation.mileageInvalid')),
    color: z.string().optional(),
    fuel: z.string().optional(),
    status: z.enum(['DISPONIBLE', 'NO_DISPONIBLE']),
  });
