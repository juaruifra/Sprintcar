import React from 'react';
import { Avatar, Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Reservation } from '../../../services/vehicles/reservationsService';

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

  const isCancelled = reservation.status === 'CANCELADA';

  return (
    <Card style={{ borderRadius: 16 }}>
      <Card.Title
        title={reservation.vehicle ? `${reservation.vehicle.brand} ${reservation.vehicle.model}` : `${t('reservations.vehicleIdLabel')} #${reservation.vehicleId}`}
        subtitle={`${reservation.startDate} → ${reservation.endDate}`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={isCancelled ? 'calendar-remove' : 'calendar-check'}
            style={{ backgroundColor: isCancelled ? theme.colors.errorContainer : theme.colors.primaryContainer }}
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
          icon={isCancelled ? 'close-circle' : 'check-circle'}
          style={{ alignSelf: 'flex-start', marginBottom: 10 }}
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
