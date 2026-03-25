import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import type { TextInputProps } from "react-native-paper";

import { useTranslation } from "react-i18next";

// Definimos un nuevo tipo de props para nuestro componente PasswordInput
// Partimos de TextInputProps pero eliminamos ("Omit") las props secureTextEntry y right
// porque estas las vamos a controlar nosotros internamente
type PasswordInputProps = Omit<TextInputProps, "secureTextEntry" | "right">;

// Declaramos el componente funcional PasswordInput, tipado con React.FC
// y que recibe como props nuestro tipo PasswordInputProps
const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  
  // Declaramos un estado bool para saber si la contraseña debe mostrarse o no
  // Por defecto: false. Contraseña oculta
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { t } = useTranslation();


  // Devolvemos el TextInput de React Native Paper configurado como campo de contraseña
  return (
    <TextInput
      // Es la forma de pasar todas las propiedades al componente desde el componente original
      {...props}
      // Por si no se le pasa la propiedad label, le ponemos una por defecto
      label={props.label ?? t("common.password")}
      mode="outlined"
      // Controla si se muestra o no la contraseña
      secureTextEntry={!showPassword}
      // Combinamos los estilos por defecto con los estilos que vengan desde props
      style={[styles.input, props.style]}
      left={<TextInput.Icon icon="lock" />}
      right={
        <TextInput.Icon
          // Cambiamos el icono según el estado
          icon={showPassword ? "eye-off" : "eye"}
          onPress={() => setShowPassword(!showPassword)}
        />
      }
    />
  );
};

// Creamos una hoja de estilos para el componente
const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});

// Como siempre, exportamos el componente
export default PasswordInput;
