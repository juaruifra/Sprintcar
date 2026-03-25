import React, { useRef } from "react";
import {
  List,
  Surface,
  IconButton,
  Chip,
  useTheme,
} from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { Cliente } from "../../types/Cliente";
import { useTranslation } from "react-i18next";

type Props = {
  cliente: Cliente;
  onPress?: () => void;
  onDelete?: () => void;
};

export default function ClienteItem({ cliente, onPress, onDelete }: Props) {
  // Flag para saber si el click viene del icono de borrar
  const isDeletingRef = useRef(false);

  const theme = useTheme();
  const { t } = useTranslation();
  const isActivo = cliente.activo;

  // Colores claros pero reconocibles
  const statusColor = isActivo
    ? theme.colors.primary // verde / primario
    : theme.colors.error; // rojo

  return (
    <Surface style={styles.container} elevation={1}>
      <List.Item
        // Texto principal (nombre del cliente)
        title={cliente.nombre}

        // Texto secundario (email o teléfono)
        description={
          (cliente.email ?? t("clients.noEmail")) +
          " - " +
          (cliente.telefono ?? t("clients.noPhone"))
        }
        descriptionNumberOfLines={1}

        // Icono a la izquierda (NO se cambia)
        left={(props) => (
          <List.Icon
            {...props}
            icon="domain"
          />
        )}

        // Click principal → navegación
        onPress={() => {
          // Si el click viene del icono de borrar, no navegamos
          if (isDeletingRef.current) {
            isDeletingRef.current = false;
            return;
          }

          onPress?.();
        }}

        // Parte derecha: estado + borrar
        right={() => (
          <View style={styles.right}>
            {/* Estado Activo / Inactivo */}
            <Chip
              compact
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: statusColor },
              ]}
              textStyle={{
                color: statusColor,
                fontWeight: "700",
              }}
            >
              {isActivo ? t("clients.active") : t("clients.inactive")}
            </Chip>

            {/* Botón borrar (MISMA lógica que antes) */}
            <IconButton
              icon="trash-can-outline"
              iconColor="#C62828"
              onPress={() => {
                // Marcamos que este click es de borrado
                isDeletingRef.current = true;

                // Avisamos al padre
                onDelete?.();
              }}
            />
          </View>
        )}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusChip: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
});
