import React from 'react';
import { Avatar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Reservation } from '../../../services/vehicles/reservationsService';

const STATUS_I18N_KEY: Record<'CREADA' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA', string> = {
  CREADA: 'created',
  CONFIRMADA: 'confirmed',
  RECHAZADA: 'rejected',
  CANCELADA: 'cancelled',
};

type Props = {
  reservation: Reservation;
  isCancelling: boolean;
  onCancel: (reservationId: number) => void;
};

/**
 * Card de historial para reservas de usuario.
 *
 * Componente presentacional: solo pinta datos
 * y dispara callback cuando se pulsa cancelar.
 */
export default function ReservationUserCard({ reservation, isCancelling, onCancel }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  // Derivamos estado visual para mostrar de forma clara el ciclo de la reserva.
  const isCreated = reservation.status === 'CREADA';
  const isConfirmed = reservation.status === 'CONFIRMADA';
  const isRejected = reservation.status === 'RECHAZADA';
  const isCancelled = reservation.status === 'CANCELADA';

  const statusVisual = isCreated
    ? { icon: 'clock-outline', color: theme.colors.tertiaryContainer }
    : isConfirmed
      ? { icon: 'check-circle', color: theme.colors.primaryContainer }
      : isRejected
        ? { icon: 'close-circle', color: theme.colors.errorContainer }
        : { icon: 'calendar-remove', color: theme.colors.errorContainer };

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={reservation.vehicle ? `${reservation.vehicle.brand} ${reservation.vehicle.model}` : `${t('reservations.vehicleIdLabel')} #${reservation.vehicleId}`}
        subtitle={`${reservation.startDate} → ${reservation.endDate}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={statusVisual.icon}
            style={{ backgroundColor: statusVisual.color }}
          />
        )}
      />
      <Card.Content>
        <Text style={{ marginBottom: 6 }}>
          {t('reservations.licensePlateLabel')}: {reservation.vehicle?.licensePlate ?? `#${reservation.vehicleId}`}
        </Text>

        {reservation.vehicle ? (
          <Text style={{ marginBottom: 10 }}>
            {t('reservations.pricePerDayLabel')}: {reservation.vehicle.pricePerDay.toFixed(2)} €
          </Text>
        ) : null}

        <Chip
          icon={statusVisual.icon}
          style={{ alignSelf: 'flex-start', marginBottom: 10 }}
        >
          {t('reservations.statusLabel')}: {t(`reservations.status.${STATUS_I18N_KEY[reservation.status]}`)}
        </Chip>

        <Button
          mode="outlined"
          onPress={() => onCancel(reservation.id)}
          // Si está rechazada o cancelada, la reserva ya está cerrada para el usuario.
          disabled={(isRejected || isCancelled) || isCancelling}
        >
          {t('reservations.cancelAction')}
        </Button>
      </Card.Content>
    </Card>
  );
}
