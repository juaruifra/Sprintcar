import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Text } from "react-native-paper";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>

      {/* Logo SprintCar */}
      <Image
        source={require("../../assets/img/logo.png")} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>{title}</Text>
      
      {/* Condicional: Se muestra subtitulo solo si existe */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 370,
    height: 180,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
  },
});

export default AuthHeader;

