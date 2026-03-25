import { MD3Theme } from "react-native-paper";
import { EstadoPedido } from "../data/mockApi";

type EstadoPedidoUI = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

export function getEstadoPedidoUI(
  estado: EstadoPedido,
  theme: MD3Theme
): EstadoPedidoUI {
  switch (estado) {
    case "FINALIZADO":
      return {
        label: "FINALIZADO",
        backgroundColor: theme.colors.primaryContainer,
        textColor: theme.colors.onPrimaryContainer,
      };

    case "PREPARADO":
      return {
        label: "PREPARADO",
        backgroundColor: theme.colors.tertiaryContainer,
        textColor: theme.colors.onTertiaryContainer,
      };

    case "ENTREGADO":
      return {
        label: "ENTREGADO",
        backgroundColor: theme.colors.secondaryContainer,
        textColor: theme.colors.onSecondaryContainer,
      };

    case "PENDIENTE_REVISION":
      return {
        label: "PENDIENTE",
        backgroundColor: theme.colors.surfaceVariant,
        textColor: theme.colors.onSurfaceVariant,
      };

    case "DEVUELTO":
      return {
        label: "DEVUELTO",
        backgroundColor: theme.colors.errorContainer,
        textColor: theme.colors.onErrorContainer,
      };

    default:
      return {
        label: estado,
        backgroundColor: theme.colors.surfaceVariant,
        textColor: theme.colors.onSurfaceVariant,
      };
  }
}
