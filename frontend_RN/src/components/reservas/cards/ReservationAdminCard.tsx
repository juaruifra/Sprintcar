import React from 'react';
import { Avatar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Reservation } from '../../../services/vehicles/reservationsService';

type Props = {
  reservation: Reservation;
  userDisplayName: string;
  isCancelling: boolean;
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
  isCancelling,
  onCancel,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const isCancelled = reservation.status === 'CANCELADA';

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
            icon={isCancelled ? 'calendar-remove' : 'calendar-check'}
            style={{ backgroundColor: isCancelled ? theme.colors.errorContainer : theme.colors.primaryContainer }}
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
          icon={isCancelled ? 'close-circle' : 'check-circle'}
          style={{ marginVertical: 10, alignSelf: 'flex-start' }}
        >
          {t('reservations.statusLabel')}: {isCancelled ? t('reservations.status.cancelled') : t('reservations.status.created')}
        </Chip>

        <Button
          mode="outlined"
          onPress={() => onCancel(reservation.id)}
          disabled={isCancelled || isCancelling}
        >
          {t('reservations.cancelAction')}
        </Button>
      </Card.Content>
    </Card>
  );
}
