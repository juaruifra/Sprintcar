import React from 'react';
import { FlatList, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Searchbar,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import {
  ADMIN_STATUS_FILTERS,
  useReservasAdminScreen,
} from '../../hooks/reservas/useReservasAdminScreen';
import ReservationAdminCard from './cards/ReservationAdminCard';

const STATUS_I18N_KEY: Record<'CREADA' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA', string> = {
  CREADA: 'created',
  CONFIRMADA: 'confirmed',
  RECHAZADA: 'rejected',
  CANCELADA: 'cancelled',
};

export default function ReservasAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    reservationsQuery,
    isAnyStatusActionPending,
    SnackbarUI,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    reservations,
    getUserDisplayName,
    handleConfirmReservation,
    handleRejectReservation,
    handleCancelReservation,
  } = useReservasAdminScreen();

  if (reservationsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (reservationsQuery.error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text>{reservationsQuery.error.message}</Text>
          <Button style={{ marginTop: 12 }} mode="contained" onPress={() => reservationsQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader />

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Card style={{ marginBottom: 12 }}>
            <Card.Title
              title={t('reservations.adminHistoryTitle')}
              subtitle={t('reservations.adminHistorySubtitle')}
              left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />}
            />
            <Card.Content style={{ gap: 10 }}>
              <Searchbar
                placeholder={t('reservations.searchReservationPlaceholder')}
                value={search}
                onChangeText={setSearch}
              />

              <SegmentedButtons
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                // Generamos opciones desde una lista única para no repetir estado en varias capas.
                buttons={ADMIN_STATUS_FILTERS.map((status) => ({
                  value: status,
                  label: status === 'all'
                    ? t('reservations.filterAll')
                    : t(`reservations.status.${STATUS_I18N_KEY[status]}`),
                }))}
              />
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text>{t('reservations.emptyAdmin')}</Text>
            </Card.Content>
          </Card>
        }
        renderItem={({ item }) => (
          <ReservationAdminCard
            reservation={item}
            userDisplayName={getUserDisplayName(item)}
            isActionPending={isAnyStatusActionPending}
            onConfirm={handleConfirmReservation}
            onReject={handleRejectReservation}
            onCancel={handleCancelReservation}
          />
        )}
      />

      <SnackbarUI />
    </View>
  );
}
