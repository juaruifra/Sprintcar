import React, { useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Incident } from '../../../services/incidents/incidentsService';
import IncidentCommentsModal from '../IncidentCommentsModal';

type Props = {
  incident: Incident;
};

// Colores de fondo del badge según la prioridad (mismo criterio que en la card admin).
const PRIORITY_COLORS: Record<string, string> = {
  BAJA: '#d4edda',
  MEDIA: '#fff3cd',
  ALTA: '#f8d7da',
};

/**
 * Card de incidencia para la vista del usuario.
 * Muestra datos + prioridad y permite abrir el log de comentarios.
 */
export default function IncidentUserCard({ incident }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  // Controla si el modal de comentarios está abierto para esta incidencia.
  const [showComments, setShowComments] = useState(false);

  const isOpen = incident.status === 'ABIERTA';

  const statusVisual = isOpen
    ? { icon: 'alert-circle', color: theme.colors.errorContainer }
    : { icon: 'check-circle', color: theme.colors.primaryContainer };

  const vehicleLabel = incident.vehicle
    ? `${incident.vehicle.brand} ${incident.vehicle.model} · ${incident.vehicle.licensePlate}`
    : `${t('incidents.vehicleLabel')} #${incident.vehicleId}`;

  return (
    <>
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
          {/* Badge de prioridad — el usuario ve el nivel que asignó al reportar */}
          <Chip
            compact
            icon="flag"
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              backgroundColor: PRIORITY_COLORS[incident.priority] ?? theme.colors.surfaceVariant,
            }}
          >
            {t(`incidents.priority.${incident.priority === 'BAJA' ? 'low' : incident.priority === 'MEDIA' ? 'medium' : 'high'}`)}
          </Chip>

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

          {/* Botón de seguimiento: muestra el nº de comentarios si hay alguno */}
          <Button
            mode="outlined"
            icon="comment-text-multiple-outline"
            onPress={() => setShowComments(true)}
            style={{ marginTop: 12 }}
          >
            {t('incidents.comments.openButton')}
            {incident.commentCount > 0 ? ` (${incident.commentCount})` : ''}
          </Button>
        </Card.Content>
      </Card>

      {/* Modal de comentarios elevado fuera del Card via Portal */}
      <IncidentCommentsModal
        incidentId={showComments ? incident.id : null}
        title={vehicleLabel}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}

