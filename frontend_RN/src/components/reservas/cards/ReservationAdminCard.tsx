import React from 'react';
import { Avatar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Reservation } from '../../../services/vehicles/reservationsService';

const STATUS_I18N_KEY: Record<'CREADA' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA' | 'FINALIZADA', string> = {
  CREADA: 'pending',
  CONFIRMADA: 'confirmed',
  RECHAZADA: 'rejected',
  CANCELADA: 'cancelled',
  FINALIZADA: 'finalized',
};

type Props = {
  reservation: Reservation;
  userDisplayName: string;
  isActionPending: boolean;
  onConfirm: (reservationId: number) => void;
  onReject: (reservationId: number) => void;
  onCancel: (reservationId: number) => void;
};

/**
 * Card de historial para reservas de admin.
 *
 * Componente visual puro para que la pantalla
 * no acumule lógica de render de cada fila.
 */
export default function ReservationAdminCard({
  reservation,
  userDisplayName,
  isActionPending,
  onConfirm,
  onReject,
  onCancel,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  // La reserva solo es accionable si todavía no está cerrada por rechazo/cancelación.
  const isCreated = reservation.status === 'CREADA';
  const isConfirmed = reservation.status === 'CONFIRMADA';
  const isRejected = reservation.status === 'RECHAZADA';
  const isCancelled = reservation.status === 'CANCELADA';
  const isFinalized = reservation.status === 'FINALIZADA';

  // Definimos icono y color para que el estado se entienda en un vistazo.
  const statusVisual = isCreated
    ? { icon: 'clock-outline', color: theme.colors.tertiaryContainer }
    : isConfirmed
      ? { icon: 'check-circle', color: theme.colors.primaryContainer }
      : isRejected
        ? { icon: 'close-circle', color: theme.colors.errorContainer }
        : isCancelled
          ? { icon: 'calendar-remove', color: theme.colors.errorContainer }
          : { icon: 'flag-checkered', color: theme.colors.secondaryContainer };

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={`${t('reservations.reservationIdLabel')} #${reservation.id}`}
        subtitle={reservation.vehicle
          ? `${userDisplayName} · ${reservation.vehicle.brand} ${reservation.vehicle.model}`
          : `${userDisplayName} · ${t('reservations.vehicleIdLabel')} #${reservation.vehicleId}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={statusVisual.icon}
            style={{ backgroundColor: statusVisual.color }}
          />
        )}
      />
      <Card.Content>
        <Text>{`${reservation.startDate} → ${reservation.endDate}`}</Text>

        <Text style={{ marginTop: 6 }}>
          {t('reservations.licensePlateLabel')}: {reservation.vehicle?.licensePlate ?? `#${reservation.vehicleId}`}
        </Text>

        {reservation.vehicle ? (
          <Text style={{ marginTop: 4 }}>
            {t('reservations.pricePerDayLabel')}: {reservation.vehicle.pricePerDay.toFixed(2)} €
          </Text>
        ) : null}

        <Chip
          icon={statusVisual.icon}
          style={{ marginVertical: 10, alignSelf: 'flex-start' }}
        >
          {t('reservations.statusLabel')}: {t(`reservations.status.${STATUS_I18N_KEY[reservation.status]}`)}
        </Chip>

        {/* Si está creada, admin decide confirmar o rechazar en primer paso. */}
        {isCreated ? (
          <>
            <Button
              mode="contained"
              style={{ marginBottom: 8 }}
              onPress={() => onConfirm(reservation.id)}
              disabled={isActionPending}
            >
              {t('reservations.confirmAction')}
            </Button>

            <Button
              mode="outlined"
              style={{ marginBottom: 8 }}
              onPress={() => onReject(reservation.id)}
              disabled={isActionPending}
            >
              {t('reservations.rejectAction')}
            </Button>
          </>
        ) : null}

        {/* Solo cancelamos desde confirmada; rechazadas/canceladas/finalizadas son informativas. */}
        {isConfirmed ? (
          <Button
            mode="outlined"
            onPress={() => onCancel(reservation.id)}
            disabled={isActionPending}
          >
            {t('reservations.cancelAction')}
          </Button>
        ) : null}

      </Card.Content>
    </Card>
  );
}
