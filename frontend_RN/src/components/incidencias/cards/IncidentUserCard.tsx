import React from 'react';
import { View } from 'react-native';
import { Avatar, Card, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Incident } from '../../../services/incidents/incidentsService';

type Props = {
  incident: Incident;
};

/**
 * Card de incidencia para la vista del usuario.
 * Solo muestra datos (el usuario no puede resolver).
 */
export default function IncidentUserCard({ incident }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const isOpen = incident.status === 'ABIERTA';

  const statusVisual = isOpen
    ? { icon: 'alert-circle', color: theme.colors.errorContainer }
    : { icon: 'check-circle', color: theme.colors.primaryContainer };

  const vehicleLabel = incident.vehicle
    ? `${incident.vehicle.brand} ${incident.vehicle.model} · ${incident.vehicle.licensePlate}`
    : `${t('incidents.vehicleLabel')} #${incident.vehicleId}`;

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={vehicleLabel}
        subtitle={`${t('incidents.idLabel')} #${incident.id} · ${t('incidents.reservationLabel')} #${incident.reservationId}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={statusVisual.icon}
            style={{ backgroundColor: statusVisual.color }}
          />
        )}
        right={() => (
          <Chip
            compact
            icon={statusVisual.icon}
            style={{ marginRight: 12, backgroundColor: statusVisual.color }}
          >
            {t(`incidents.status.${isOpen ? 'open' : 'resolved'}`)}
          </Chip>
        )}
      />

      <Card.Content>
        <Text
          variant="bodyMedium"
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        >
          {incident.description}
        </Text>

        <Divider style={{ marginBottom: 10 }} />

        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('incidents.reportedAtLabel')}:
            </Text>
            <Text variant="bodySmall">
              {new Date(incident.createdAt).toLocaleString()}
            </Text>
          </View>

          {incident.resolvedAt ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('incidents.resolvedAtLabel')}:
              </Text>
              <Text variant="bodySmall">
                {new Date(incident.resolvedAt).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}
