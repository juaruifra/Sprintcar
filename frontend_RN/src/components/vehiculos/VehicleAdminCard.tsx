import React from 'react';
import { View } from 'react-native';
import { Avatar, Card, IconButton, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Vehicle } from '../../types/vehicles/Vehicle';

type Props = {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onToggleAvailability: (vehicle: Vehicle, enabled: boolean) => void;
  isUpdating: boolean;
};

// Card visual de vehículo admin desacoplada de la pantalla para mantener UI limpia.
export default function VehicleAdminCard({
  vehicle,
  onEdit,
  onToggleAvailability,
  isUpdating,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Card.Title
        title={`${vehicle.brand} ${vehicle.model}`}
        subtitle={vehicle.category || t('vehicles.form.category')}
        left={() => (
          <Avatar.Icon
            size={42}
            icon="car-sports"
            color={theme.colors.primary}
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
        )}
        right={() => (
          <IconButton icon="pencil" iconColor={theme.colors.primary} onPress={() => onEdit(vehicle)} />
        )}
      />

      <Card.Content style={{ gap: 10 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: theme.colors.primaryContainer,
          }}
        >
          <Text style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
            {vehicle.licensePlate}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('vehicles.form.year')}
            </Text>
            <Text variant="bodyMedium">{vehicle.year}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('vehicles.form.pricePerDay')}
            </Text>
            <Text variant="bodyMedium">{vehicle.pricePerDay} €</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('vehicles.form.mileage')}
            </Text>
            <Text variant="bodyMedium">{vehicle.mileage ?? '-'}</Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12 }}>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
          {vehicle.status === 'DISPONIBLE' ? t('vehicles.status.available') : t('vehicles.status.unavailable')}
        </Text>
        <Switch
          value={vehicle.status === 'DISPONIBLE'}
          onValueChange={(value) => onToggleAvailability(vehicle, value)}
          disabled={isUpdating}
        />
      </Card.Actions>
    </Card>
  );
}
