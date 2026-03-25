import React from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import {
  Appbar,
  Menu,
  Divider,
  Text,
  Avatar,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserStore } from "../../store/userStore";
import { getInitials } from "../../utils/user";
import { useTranslation } from "react-i18next";

type AppHeaderProps = {
  options?: any;
  back?: { title?: string; href?: string };
};

export default function AppHeader({ options, back }: AppHeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const user = useUserStore((state) => state.user);

  const [menuVisible, setMenuVisible] = React.useState(false);

  const theme = useTheme();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.elevation.level2,
      }}
    >
      {/* Botón volver */}
      {back ? (
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      {/* Logo */}
      <Image
        source={require("../../../assets/img/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Appbar.Content
        title={options?.title ?? back?.title ?? ""}
        titleStyle={{
          fontSize: 18,
          fontWeight: "bold",
          color: theme.colors.onSurface,
        }}
      />

      {/* Menú usuario */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Pressable onPress={() => setMenuVisible(true)}>
            <View style={styles.avatarWrapper}>
              {user.avatarUrl ? (
                // Si hay avatar, mostramos la imagen
                <Avatar.Image
                  size={36}
                  source={{ uri: user.avatarUrl }}
                />
              ) : (
                // Si no, mostramos las iniciales
                <Avatar.Text
                  size={36}
                  label={getInitials(user.name)}
                  style={{
                    backgroundColor: theme.colors.primary,
                  }}
                  color={theme.colors.onPrimary}
                />
              )}
            </View>
          </Pressable>
        }
        contentStyle={{
          backgroundColor: theme.colors.elevation.level3,
        }}
      >
        {/* Info usuario */}
        <View style={styles.userInfo}>
          <Text style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
            {user.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {user.email}
          </Text>
        </View>

        <Divider />

        <Menu.Item
          title={t("header.preferences")}
          onPress={() => {
            router.push("/preferencias");
            setMenuVisible(false);
          }}
        />

        <Menu.Item
          title={t("header.profile")}
          onPress={() => {
            router.push("/perfil");
            setMenuVisible(false);
          }}
        />

        <Menu.Item
          title={t("header.changePassword")}
          onPress={() => {
            router.push("/changePassword");
            setMenuVisible(false);
          }}
        />

        <Divider />

        <Menu.Item
          title={t("header.logout")}
          onPress={async () => {
            setMenuVisible(false);
            await logout();
          }}
        />
      </Menu>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 95,
    width: 120,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    marginRight: 12,
    width: 32,
    height: 32,
  },
});
