import React from 'react';
import { Avatar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Incident } from '../../../services/incidents/incidentsService';

type Props = {
  incident: Incident;
  isResolving: boolean;
  onResolve: (incidentId: number) => void;
};

/**
 * Card de incidencia para la vista admin.
 * Muestra datos clave y botón de resolución si está abierta.
 */
export default function IncidentAdminCard({ incident, isResolving, onResolve }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const isOpen = incident.status === 'ABIERTA';

  const statusVisual = isOpen
    ? { icon: 'alert-circle', color: theme.colors.errorContainer }
    : { icon: 'check-circle', color: theme.colors.primaryContainer };

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={`${t('incidents.idLabel')} #${incident.id}`}
        subtitle={`${t('incidents.reservationLabel')} #${incident.reservationId} · ${t('incidents.vehicleLabel')} #${incident.vehicleId}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={statusVisual.icon}
            style={{ backgroundColor: statusVisual.color }}
          />
        )}
      />
      <Card.Content>
        <Chip
          icon={statusVisual.icon}
          style={{ alignSelf: 'flex-start', marginBottom: 8 }}
        >
          {t(`incidents.status.${isOpen ? 'open' : 'resolved'}`)}
        </Chip>

        <Text style={{ marginBottom: 8 }}>{incident.description}</Text>

        <Text variant="bodySmall" style={{ marginBottom: isOpen ? 12 : 0 }}>
          {t('incidents.reportedAtLabel')}: {new Date(incident.createdAt).toLocaleDateString()}
        </Text>

        {incident.resolvedAt ? (
          <Text variant="bodySmall">
            {t('incidents.resolvedAtLabel')}: {new Date(incident.resolvedAt).toLocaleDateString()}
          </Text>
        ) : null}

        {isOpen ? (
          <Button
            mode="contained"
            onPress={() => onResolve(incident.id)}
            disabled={isResolving}
            icon="check-circle-outline"
            style={{ marginTop: 8 }}
          >
            {t('incidents.resolveAction')}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}
