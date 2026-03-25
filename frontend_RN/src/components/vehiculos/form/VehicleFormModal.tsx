import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Modal, Portal, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormAuthTextInput } from '../../form/FormAuthTextInput';
import { VehicleStatus } from '../../../types/vehicles/Vehicle';
import { VehicleFormValues } from './VehicleForm.types';
import { createVehicleFormSchema } from './vehicleForm.schema';

type Props = {
  visible: boolean;
  title: string;
  submitLabel: string;
  defaultValues: VehicleFormValues;
  onDismiss: () => void;
  onSubmit: (data: VehicleFormValues) => void;
  isSubmitting?: boolean;
};

export default function VehicleFormModal({
  visible,
  title,
  submitLabel,
  defaultValues,
  onDismiss,
  onSubmit,
  isSubmitting,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const schema = createVehicleFormSchema(t);

  const { control, handleSubmit, watch, setValue, reset } = useForm<VehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, visible]);

  const status = watch('status');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          margin: 16,
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          maxHeight: '90%',
        }}
      >
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
          {title}
        </Text>

        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <FormAuthTextInput control={control} name="licensePlate" label={t('vehicles.form.licensePlate')} autoCapitalize="characters" left={<TextInput.Icon icon="card-text" />} />
          <FormAuthTextInput control={control} name="brand" label={t('vehicles.form.brand')} left={<TextInput.Icon icon="car-info" />} />
          <FormAuthTextInput control={control} name="model" label={t('vehicles.form.model')} left={<TextInput.Icon icon="car" />} />
          <FormAuthTextInput control={control} name="year" label={t('vehicles.form.year')} keyboardType="number-pad" left={<TextInput.Icon icon="calendar" />} />
          <FormAuthTextInput control={control} name="category" label={t('vehicles.form.category')} left={<TextInput.Icon icon="shape" />} />
          <FormAuthTextInput control={control} name="pricePerDay" label={t('vehicles.form.pricePerDay')} keyboardType="decimal-pad" left={<TextInput.Icon icon="cash" />} />
          <FormAuthTextInput control={control} name="mileage" label={t('vehicles.form.mileage')} keyboardType="number-pad" left={<TextInput.Icon icon="speedometer" />} />
          <FormAuthTextInput control={control} name="color" label={t('vehicles.form.color')} left={<TextInput.Icon icon="palette" />} />
          <FormAuthTextInput control={control} name="fuel" label={t('vehicles.form.fuel')} left={<TextInput.Icon icon="gas-station" />} />

          <Text style={{ marginTop: 8, marginBottom: 4 }}>{t('vehicles.form.status')}</Text>
          <RadioButton.Group
            onValueChange={(value) => setValue('status', value as VehicleStatus)}
            value={status}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton value="DISPONIBLE" />
              <Text>{t('vehicles.status.available')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton value="NO_DISPONIBLE" />
              <Text>{t('vehicles.status.unavailable')}</Text>
            </View>
          </RadioButton.Group>
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button onPress={onDismiss}>{t('common.cancel')}</Button>
          <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}
