import React , { useState } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useTranslation } from "react-i18next";

type ConfirmDialogState = {
  visible: boolean;
  title: string;
  message: string;
  variant: "confirm" | "error";
  action?: () => Promise<void> | void;
  onSuccess?: () => void;
};


/**
 * Hook para ejecutar acciones con confirmación
 * usando un modal de Paper
 */
export function useConfirmAction() {

    // Estado interno del diálogo
    const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);

    type ConfirmOptions = {
        title: string;
        message: string;
        action: () => Promise<void> | void;
        onSuccess?: () => void;
    };

    const { t } = useTranslation();

    /**
     * Abre un diálogo de confirmación y,
     * si se acepta, ejecuta la acción.
     */
    const confirm = (options: ConfirmOptions) => {

        setDialog({
            visible: true,
            title: options.title,
            message: options.message,
            variant: "confirm",
            action: options.action,
            onSuccess: options.onSuccess,
        });

    };

    type ErrorOptions = {
        title: string;
        message: string;
    };

    // Abre el diálogo en modo error (informativo)
    const showError = (options: ErrorOptions) => {
        setDialog({
            visible: true,
            title: options.title,
            message: options.message,
            variant: "error",
        });
    };

    /**
     * Componente del diálogo que debe renderizar
     * la pantalla que use el hook
     */
    const ConfirmDialogUI = () => {
        // Si no hay diálogo, no renderizamos nada
        if (!dialog) return null;

        return (
            <ConfirmDialog
            visible={dialog.visible}
            title={dialog.title}
            message={dialog.message}
            variant={dialog.variant}
            confirmText={dialog.variant === "confirm" ? t("common.delete") : t("common.accept")}
            cancelText={t("common.cancel")}
            onConfirm={async () => {

                // Solo en confirmación ejecutamos la acción
                if (dialog.variant === "confirm" && dialog.action) {

                    try {
                        await dialog.action();

                        // Cerramos el diálogo
                        setDialog(null);

                        // Ejecutamos callback de éxito si existe
                        dialog.onSuccess?.();

                    } catch (error) {

                        // Si hay error, mostramos el mismo modal en modo error
                        const message =
                        error instanceof Error
                            ? error.message
                            : t("common.unexpectedError");

                        setDialog({
                            visible: true,
                            title: t("common.error"),
                            message,
                            variant: "error",
                        });
                    }
                } else {
                    // En modo error, aceptar solo cierra
                    setDialog(null);
                }
            }}
            onCancel={() => {
                // Cancelar o cerrar siempre cierra el diálogo
                setDialog(null);
            }}
            />
        );
    };


    return {
        confirm,
        showError,
        ConfirmDialogUI,
    };
}

