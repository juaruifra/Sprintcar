import React from "react";
import { View } from "react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { HelperText, TextInput } from "react-native-paper";
import AuthTextInput from "../AuthTextInput";

/*
  Este componente:
  - conecta el input con React Hook Form
  - muestra el error que venga de Zod
  - reutiliza tu AuthTextInput original
*/

type Props<T extends FieldValues> = {
  // "control" es el objeto que maneja el formulario
  control: Control<T>;

  // "name" es el nombre del campo (email, password, etc.)
  name: Path<T>;

  // Label que verá el usuario
  label: string;
} & Omit<
  React.ComponentProps<typeof TextInput>,
  // Estas props las controla el formulario, no el usuario
  "value" | "onChangeText"
>;

export function FormAuthTextInput<T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: Props<T>) {
  return (
    <Controller
      // Le decimos a React Hook Form qué formulario controlar
      control={control}

      // Nombre del campo (debe existir en el esquema Zod)
      name={name}
      render={({ field, fieldState }) => (
        <View>
          {/* Input visual */}
          <AuthTextInput
            label={label}
            value={field.value}          // Valor actual del campo
            onChangeText={field.onChange} // Actualiza el formulario
            error={!!fieldState.error}    // Muestra borde rojo si hay error
            {...props}
          />

          {/* Texto de error debajo del input */}
          <HelperText type="error" visible={!!fieldState.error} style={{ marginTop: -6 }}>
            {fieldState.error?.message}
          </HelperText>
        </View>
      )}
    />
  );
}
