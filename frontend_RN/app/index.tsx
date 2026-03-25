import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { useUserStore } from "../src/store/userStore";

export default function IndexFile() {
  
  // Obtenemos el usuario y el estado de carga del contexto
  const {isLoading } = useAuth();

  const user = useUserStore((state) => state.user);

  // Mientras comprobamos el storage, mostramos un loader
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si NO hay usuario, vamos al login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Si el usuario es administrador
  if (user.roleId === 2) {
    return <Redirect href="/(tabs-admin)/home" />;
  }

  // Usuario normal
  return <Redirect href="/(tabs-user)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

