import React from 'react';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
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

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={`${t('incidents.idLabel')} #${incident.id}`}
        subtitle={`${t('incidents.reservationLabel')} #${incident.reservationId}`}
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

        <Text variant="bodySmall">
          {t('incidents.reportedAtLabel')}: {new Date(incident.createdAt).toLocaleDateString()}
        </Text>

        {incident.resolvedAt ? (
          <Text variant="bodySmall">
            {t('incidents.resolvedAtLabel')}: {new Date(incident.resolvedAt).toLocaleDateString()}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}
