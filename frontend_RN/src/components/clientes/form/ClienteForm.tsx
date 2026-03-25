import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Switch, Text, TextInput } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ClienteFormValues } from "./clienteForm.types";
//import { clienteFormSchema } from "./clienteForm.schema";
import { createClienteFormSchema } from "./clienteForm.schema";
import { FormAuthTextInput } from "../../form/FormAuthTextInput";

import { useTranslation } from "react-i18next";

type Props = {
  defaultValues: ClienteFormValues;
  onSubmit: (data: ClienteFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
};



export default function ClienteForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {

  const { t } = useTranslation();

  const clienteFormSchema = createClienteFormSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    defaultValues,
    resolver: zodResolver(clienteFormSchema),
  });

  return (
    <View>

      <FormAuthTextInput
              control={control}
              name="nombre"
              label={t("clients.form.name")}
              //keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="account" />} //email
            />

      <FormAuthTextInput
              control={control}
              name="nifCif"
              label={t("clients.form.nifCif")}
              autoCapitalize="none"
              left={<TextInput.Icon icon="card-account-details-outline" />} 
            />

      <FormAuthTextInput
              control={control}
              name="email"
              label={t("clients.form.email")}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />

      <FormAuthTextInput
              control={control}
              name="telefono"
              label={t("clients.form.phone")}
              keyboardType="phone-pad"
              autoCapitalize="none"
              left={<TextInput.Icon icon="phone" />}
            />

      <FormAuthTextInput
        control={control}
        name="notas"
        label={t("clients.form.notes")}
        autoCapitalize="none"
        multiline
        numberOfLines={3}
        left={<TextInput.Icon icon="note-text-outline" />} 
      />

      {/* Activo */}
      <Controller
        control={control}
        name="activo"
        render={({ field }) => (
          <View style={styles.switchRow}>
            <Text>{t("clients.active")}</Text>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
            />
          </View>
        )}
      />

      {/* Acciones */}
      <View style={styles.actions}>
        <Button onPress={onCancel}>{t("common.cancel")}</Button>
        <Button mode="contained" onPress={handleSubmit(onSubmit)}>
          {submitLabel}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
});
