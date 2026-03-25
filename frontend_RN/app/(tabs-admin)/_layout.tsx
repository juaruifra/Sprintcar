import { Tabs, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserStore } from "../../src/store/userStore";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const user = useUserStore((state) => state.user);
  const theme = useTheme();
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!user) return null;
  if (user.roleId !== 1) return <Redirect href="/(tabs-user)/home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Colores de icono/texto activos
        tabBarActiveTintColor: theme.colors.primary,

        // Ajuste solo para modo oscuro: inactivo más apagado
        tabBarInactiveTintColor: theme.dark
          ? theme.colors.outline // más gris en dark
          : theme.colors.onSurfaceVariant, // lo que ya usabas en light

        // Fondo de la tab bar
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          //title: "Inicio",
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="pedidos"
        options={{
          // title: "Pedidos",
          title: t("tabs.orders"),
          href: null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-list"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="clientes"
        options={{
          //title: "Clientes",
          title: t("tabs.clients"),
          href: null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="vehiculos"
        options={{
          title: t("tabs.vehicles"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car-multiple" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservas"
        options={{
          title: t("tabs.reservations"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="inventario"
        options={{
          //title: "Inventario",
          title: t("tabs.inventory"),
          href: null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="warehouse" color={color} size={size} />
          ),
        }}
      />

      {/* Rutas ocultas de tabs */}
      <Tabs.Screen name="clientes/[id]" options={{ href: null }} />
      <Tabs.Screen name="preferencias" options={{ href: null }} />
      <Tabs.Screen name="perfil" options={{ href: null }} />
      <Tabs.Screen name="changePassword" options={{ href: null }} />
    </Tabs>
  );
}
