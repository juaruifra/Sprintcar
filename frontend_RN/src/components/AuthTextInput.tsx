import React from "react";
import { StyleSheet } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";

interface AuthTextInputProps extends TextInputProps {
  // puedes añadir props propias si quieres
}

const AuthTextInput: React.FC<AuthTextInputProps> = (props) => {
  return <TextInput mode="outlined" style={styles.input} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});

export default AuthTextInput;
