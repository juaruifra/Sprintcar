import React from "react";
import { View, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Text,
  Card,
  Button,
  Avatar,
  Chip,
  List,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import AppHeader from "../layout/AppHeader";
import { useUserStore } from "../../store/userStore";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const theme = useTheme();
  const user = useUserStore((state) => state.user);
  const { t } = useTranslation();

  // Mientras el usuario se restaura desde storage
  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const isProfileMissingCriticalData = !isAdmin && !user.documentId?.trim();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Barra superior */}
      <AppHeader />

      <View style={styles.content}>
        {/* Card de bienvenida */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Icon
              size={64}
              icon="account"
              style={{ backgroundColor: theme.colors.primary }}
            />

            <View style={styles.userInfo}>
              <Text variant="titleMedium">
                {t("home.welcome")} <Text style={{ fontWeight: "bold" }}> {user.name}</Text>
              </Text>

              <Chip
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: isAdmin
                      ? theme.colors.errorContainer
                      : theme.colors.secondaryContainer,
                  },
                ]}
                textStyle={{
                  color: isAdmin
                    ? theme.colors.error
                    : theme.colors.secondary,
                  fontWeight: "600",
                }}
                icon={isAdmin ? "shield-account" : "account-check"}
              >
                {/* {isAdmin ? "Administrador" : "Usuario"} */}
                {isAdmin ? t("home.roleAdmin") : t("home.roleUser")}

              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Texto contextual */}
        <Text
          variant="bodyMedium"
          style={[
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {t("home.subtitle")}
        </Text>

        {isProfileMissingCriticalData ? (
          <Card style={{ borderRadius: 16, marginBottom: 16 }}>
            <Card.Content style={{ gap: 10 }}>
              <Text variant="titleSmall">{t("home.profileIncompleteTitle")}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {t("home.profileIncompleteMessage")}
              </Text>
              <Button mode="contained" onPress={() => router.push("/perfil")}>
                {t("home.completeProfileAction")}
              </Button>
            </Card.Content>
          </Card>
        ) : null}

        {/* Acciones rápidas */}
        <Card style={styles.actionsCard}>
          <List.Item
            //title="Perfil"
            title={t("home.profile")}
            description={t("home.profileDesc")}
            left={(props) => (
              <List.Icon {...props} icon="account-circle-outline" />
            )}
            onPress={() => router.push("/perfil")}
          />

          <List.Item
            title={t("home.preferences")}
            description={t("home.preferencesDesc")}
            left={(props) => (
              <List.Icon {...props} icon="cog-outline" />
            )}
            onPress={() => router.push("/preferencias")}
          />

          
          {/* <List.Item
            title={t("home.clients")}
            description={t("home.clientsDesc")}
            left={(props) => (
              <List.Icon {...props} icon="account-group-outline" />
            )}
            onPress={() => router.push("/clientes")}
          /> */}
          
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  roleChip: {
    alignSelf: "flex-start",
  },
  subtitle: {
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionsCard: {
    borderRadius: 16,
  },
});
