import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
  SegmentedButtons,
  List,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";

//import { PedidoConDetalle } from "../../types/Pedido";

import { useCliente } from "../../hooks/clientes/useCliente";
import { useUpdateCliente } from "../../hooks/clientes/useUpdateCliente";
import { useDeleteCliente } from "../../hooks/clientes/useDeleteCliente";

//import { getPedidosByCliente } from "../../services/pedidosService";
import PedidoItem from "./PedidoItem";

import ClienteFormModal from "./form/ClienteFormModal";
import { ClienteFormValues } from "./form/clienteForm.types";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { usePedidosByCliente } from "../../hooks/pedidos/usePedidosByCliente";

import { useTranslation } from "react-i18next";


export default function ClienteDetalleScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const clienteId =
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : null;

  const {
    data: cliente,
    isLoading,
    error,
  } = useCliente(clienteId);

  const updateClienteMutation = useUpdateCliente();
  const deleteClienteMutation = useDeleteCliente();

//   const [pedidos, setPedidos] = useState<PedidoConDetalle[]>([]);
//   const [isLoadingPedidos, setIsLoadingPedidos] = useState(true);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "pedidos">("info");

  const { confirm, ConfirmDialogUI } = useConfirmAction();

//   React.useEffect(() => {
//     if (!clienteId) return;

//     getPedidosByCliente(clienteId)
//       .then(setPedidos)
//       .finally(() => setIsLoadingPedidos(false));
//   }, [clienteId]);

    const {
    data: pedidos = [],
    isLoading: isLoadingPedidos,
    } = usePedidosByCliente(clienteId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !cliente) {
    return (
      <View style={styles.center}>
        <Text>{t("clients.notFound")}</Text>
      </View>
    );
  }

  const editInitialValues: ClienteFormValues = {
    nombre: cliente.nombre,
    nifCif: cliente.nifCif ?? "",
    telefono: cliente.telefono ?? "",
    email: cliente.email ?? "",
    notas: cliente.notas ?? "",
    activo: cliente.activo,
  };

  const handleDeleteCliente = () => {
    confirm({
      title: t("clients.deleteTitle"),
      message: t("clients.deleteMessage", { name: cliente.nombre }),
      action: () => deleteClienteMutation.mutateAsync(cliente.id),
      onSuccess: () => {
        router.replace("/clientes");
      },
    });
  };

  return (
    <View style={[{ flex: 1 }, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.tabsWrapper,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "info" | "pedidos")
          }
          buttons={[
            { value: "info", label: t("clients.dataTab") },
            { value: "pedidos", label: t("tabs.orders") },
          ]}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "info" && (
          <>
            <Text variant="headlineSmall" style={styles.title}>
              {cliente.nombre}
            </Text>

            <Card style={styles.card}>
              <Card.Content>
                <List.Item
                  title={t("clients.form.email")}
                  description={cliente.email || "—"}
                  left={(props) => (
                    <List.Icon {...props} icon="email-outline" />
                  )}
                />

                <Divider />

                <List.Item
                  title={t("clients.form.nifCif")}
                  description={cliente.nifCif || "—"}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="card-account-details-outline"
                    />
                  )}
                />

                <Divider />

                <List.Item
                  title={t("clients.form.phone")}
                  description={cliente.telefono || "—"}
                  left={(props) => (
                    <List.Icon {...props} icon="phone-outline" />
                  )}
                />

                <Divider />

                <List.Item
                  title={t("clients.form.notes")}
                  description={cliente.notas || "—"}
                  descriptionNumberOfLines={3}
                  left={(props) => (
                    <List.Icon {...props} icon="note-text-outline" />
                  )}
                />

                <Divider />

                <List.Item
                  title={t("clients.form.status")}
                  description={cliente.activo ? t("clients.active") : t("clients.inactive")}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={
                        cliente.activo
                          ? "check-circle-outline"
                          : "close-circle-outline"
                      }
                      color={cliente.activo ? "#2E7D32" : "#C62828"}
                    />
                  )}
                />
              </Card.Content>
            </Card>

            <Button
              mode="outlined"
              style={{ marginTop: 16 }}
              onPress={() => setIsEditModalVisible(true)}
            >
              {t("clients.edit")}
            </Button>

            <Button
              mode="contained"
              buttonColor="#B00020"
              textColor="white"
              style={{ marginTop: 16 }}
              icon="trash-can-outline"
              onPress={handleDeleteCliente}
            >
              {t("clients.delete")}
            </Button>
          </>
        )}

        {activeTab === "pedidos" && (
          <>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t("tabs.orders")}
            </Text>

            {isLoadingPedidos ? (
              <ActivityIndicator style={{ marginTop: 8 }} />
            ) : pedidos.length === 0 ? (
              <Text style={{ marginTop: 8 }}>
                {t("clients.noOrders")}
              </Text>
            ) : (
              pedidos.map((p) => (
                <PedidoItem
                  key={p.id}
                  pedido={p}
                  onPress={() => console.log("Pedido pulsado:", p.id)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <ClienteFormModal
        visible={isEditModalVisible}
        title={t("clients.edit")}
        initialValues={editInitialValues}
        onSubmit={async (data) => {
          await updateClienteMutation.mutateAsync({
            id: cliente.id,
            data,
          });
          setIsEditModalVisible(false);
        }}
        onDismiss={() => setIsEditModalVisible(false)}
      />

      <ConfirmDialogUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
