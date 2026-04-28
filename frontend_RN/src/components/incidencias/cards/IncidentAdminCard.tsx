import React, { useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Incident } from '../../../services/incidents/incidentsService';
import IncidentCommentsModal from '../IncidentCommentsModal';

type Props = {
  incident: Incident;
  isResolving: boolean;
  onResolve: (incidentId: number) => void;
};

function getReporterDisplayName(incident: Incident): string {
  const firstName = incident.reporter?.name?.trim() ?? '';
  const lastName = incident.reporter?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || incident.reporter?.email || `#${incident.reportedByUserId}`;
}

// Colores de fondo del badge según la prioridad.
// Los definimos aquí para no depender del tema (los colores de semáforo son universales).
const PRIORITY_COLORS: Record<string, string> = {
  BAJA: '#d4edda',
  MEDIA: '#fff3cd',
  ALTA: '#f8d7da',
};

/**
 * Card de incidencia para la vista admin.
 * Muestra vehículo, usuario, prioridad, descripción,
 * botón de resolución y acceso al log de comentarios.
 */
export default function IncidentAdminCard({ incident, isResolving, onResolve }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  // Controla si el modal de comentarios está abierto para esta card concreta.
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
          {/* Badge de prioridad — ayuda al admin a ver de un vistazo la urgencia */}
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

          {/* Descripción */}
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

          {/* Datos de trazabilidad */}
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('incidents.reportedByLabel')}:
              </Text>
              <Text variant="bodySmall">{getReporterDisplayName(incident)}</Text>
            </View>

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

          {/* Fila de acciones al pie de la card */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {/* Botón para abrir el log de comentarios — siempre visible */}
            <Button
              mode="outlined"
              icon="comment-text-multiple-outline"
              onPress={() => setShowComments(true)}
              style={{ flex: 1 }}
            >
              {t('incidents.comments.openButton')}
            </Button>

            {/* Botón de resolución — solo si la incidencia está abierta */}
            {isOpen ? (
              <Button
                mode="contained"
                onPress={() => onResolve(incident.id)}
                disabled={isResolving}
                icon="check-circle-outline"
                style={{ flex: 1 }}
              >
                {t('incidents.resolveAction')}
              </Button>
            ) : null}
          </View>
        </Card.Content>
      </Card>

      {/* Modal de comentarios — se monta fuera del Card para que el Portal lo eleve al nivel raíz */}
      <IncidentCommentsModal
        incidentId={showComments ? incident.id : null}
        title={vehicleLabel}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}
