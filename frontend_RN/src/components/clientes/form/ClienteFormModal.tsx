import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Modal, Portal, Text, useTheme } from "react-native-paper";

import ClienteForm from "./ClienteForm";
import { ClienteFormValues } from "./clienteForm.types";
import { useTranslation } from "react-i18next";

type Props = {
  // Controla si el modal se muestra o no
  visible: boolean;

  // Texto del header (Crear cliente / Editar cliente)
  title: string;

  // Valores iniciales del formulario
  // En crear: valores vacíos
  // En editar: datos del cliente
  initialValues: ClienteFormValues;

  // Se llama cuando el usuario pulsa "Guardar"
  onSubmit: (data: ClienteFormValues) => void;

  // Se llama al cerrar el modal (cancelar o tocar fuera)
  onDismiss: () => void;
};

export default function ClienteFormModal({
  visible,
  title,
  initialValues,
  onSubmit,
  onDismiss,
}: Props) {

  const theme = useTheme();
  const { t } = useTranslation();
  return (
    // Portal asegura que el modal se renderiza por encima de toda la app
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.container, {backgroundColor: theme.colors.surface}]}
      >
        {/* Scroll para que el contenido no se corte en pantallas pequeñas */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título del modal */}
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>

          {/* Formulario reutilizable */}
          <ClienteForm
            defaultValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onDismiss}
            submitLabel={t("common.save")}
          />
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal del modal (la "caja blanca")
  container: {
    //backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,

    // Hace que el modal ocupe casi toda la pantalla,
    // pero siga sintiéndose como un modal
    maxHeight: "90%",
  },

  // Contenido interno del ScrollView
  scrollContent: {
    padding: 20,
  },

  // Estilo del título
  title: {
    marginBottom: 16,
  },
});
