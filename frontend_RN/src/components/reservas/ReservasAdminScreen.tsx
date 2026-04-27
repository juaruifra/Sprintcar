import React from 'react';
import { FlatList, View, ScrollView } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Searchbar,
  //ScrollView,
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

const STATUS_I18N_KEY: Record<'CREADA' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA' | 'FINALIZADA', string> = {
  CREADA: 'pending',
  CONFIRMADA: 'confirmed',
  RECHAZADA: 'rejected',
  CANCELADA: 'cancelled',
  FINALIZADA: 'finalized',
};

export default function ReservasAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    reservationsQuery,
    isAnyStatusActionPending,
    SnackbarUI,
    statusFilter,
    changeStatusFilter,
    counts,
    page,
    nextPage,
    prevPage,
    limit,
    searchDraft,
    setSearchDraft,
    applySearch,
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
                value={searchDraft}
                onChangeText={setSearchDraft}
              />

              <Button mode="outlined" onPress={applySearch}>{t('common.apply')}</Button>

              {/* Tabs compactas por estado, con pendiente por defecto */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {ADMIN_STATUS_FILTERS.map((status) => {
                  const isSelected = statusFilter === status;
                  const label = status === 'all'
                    ? t('reservations.filterAll')
                    : t(`reservations.status.${STATUS_I18N_KEY[status]}`);

                  const count = status === 'all'
                    ? (counts ? Object.values(counts).reduce((acc, value) => acc + value, 0) : undefined)
                    : counts?.[status];

                  return (
                    <Chip
                      key={status}
                      selected={isSelected}
                      onPress={() => changeStatusFilter(status)}
                      compact
                    >
                      {typeof count === 'number' ? `${label} (${count})` : label}
                    </Chip>
                  );
                })}
              </ScrollView>

              <Text>{t('reservations.pageSummary', { page, limit })}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button mode="outlined" onPress={prevPage} disabled={page <= 1}>
                  {t('common.previous')}
                </Button>
                <Button mode="contained" onPress={nextPage} disabled={Boolean(reservationsQuery.data && page >= reservationsQuery.data.totalPages)}>
                  {t('common.next')}
                </Button>
              </View>
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
