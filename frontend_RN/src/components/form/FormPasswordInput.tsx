import React from "react";
import { View } from "react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { HelperText } from "react-native-paper";
import PasswordInput from "../PasswordInput";

/*
  Este componente:
  - conecta PasswordInput con el formulario
  - mantiene el toggle de mostrar/ocultar contraseña
  - muestra errores de validación
*/

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

export function FormPasswordInput<T extends FieldValues>({
  control,
  name,
  label,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <PasswordInput
            value={field.value}            // Valor actual
            onChangeText={field.onChange}  // Actualiza el formulario
            error={!!fieldState.error} // Marca error visual
            label={label}    
          />

          {/* Mensaje de error */}
          <HelperText type="error" visible={!!fieldState.error} style={{ marginTop: -6 }}>
            {fieldState.error?.message}
          </HelperText>
        </View>
      )}
    />
  );
}
