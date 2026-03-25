import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { isValidSpanishDocumentId } from '../utils/document-id.util';

@ValidatorConstraint({ name: 'isSpanishDocumentId', async: false })
class IsSpanishDocumentIdConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    // Campo opcional: si viene vacío, no bloqueamos la validación global del DTO.
    if (value === undefined || value === null || value === '') {
      return true;
    }

    // Solo aceptamos string; cualquier otro tipo se considera inválido.
    if (typeof value !== 'string') {
      return false;
    }

    // Delegamos la lógica de DNI/NIE al helper para reutilizarla en toda la app.
    return isValidSpanishDocumentId(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    // Devolvemos clave i18n (no texto fijo) para que frontend traduzca según idioma activo.
    return 'errors.invalidSpanishDocumentId';
  }
}

export function IsSpanishDocumentId(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      constraints: [],
      validator: IsSpanishDocumentIdConstraint,
    });
  };
}
