import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import {
  ADMIN_INCIDENT_FILTERS,
  useIncidentsAdminScreen,
} from '../../hooks/incidencias/useIncidentsAdminScreen';
import IncidentAdminCard from './cards/IncidentAdminCard';
import { IncidentStatus } from '../../services/incidents/incidentsService';

const STATUS_I18N_KEY: Record<IncidentStatus, string> = {
  ABIERTA: 'open',
  RESUELTA: 'resolved',
};

export default function IncidentsAdminScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    incidentsQuery,
    incidents,
    counts,
    statusFilter,
    changeStatusFilter,
    searchDraft,
    setSearchDraft,
    applySearch,
    page,
    limit,
    nextPage,
    prevPage,
    handleResolve,
    isResolving,
    SnackbarUI,
  } = useIncidentsAdminScreen();

  if (incidentsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (incidentsQuery.error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text>{incidentsQuery.error.message}</Text>
          <Button
            style={{ marginTop: 12 }}
            mode="contained"
            onPress={() => incidentsQuery.refetch()}
          >
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
        data={incidents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Card style={{ marginBottom: 12 }}>
            <Card.Title
              title={t('incidents.adminTitle')}
              subtitle={t('incidents.adminSubtitle')}
              left={(props) => <Avatar.Icon {...props} icon="alert-circle-outline" />}
            />
            <Card.Content style={{ gap: 10 }}>
              <Searchbar
                placeholder={t('incidents.searchPlaceholder')}
                value={searchDraft}
                onChangeText={setSearchDraft}
              />

              <Button mode="outlined" onPress={applySearch}>
                {t('common.apply')}
              </Button>

              {/* Tabs de estado con contadores — ABIERTA seleccionada por defecto */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {ADMIN_INCIDENT_FILTERS.map((status) => {
                  const isSelected = statusFilter === status;
                  const label =
                    status === 'all'
                      ? t('incidents.filterAll')
                      : t(`incidents.status.${STATUS_I18N_KEY[status as IncidentStatus]}`);

                  const count =
                    status === 'all'
                      ? counts
                        ? Object.values(counts).reduce((acc, v) => acc + v, 0)
                        : undefined
                      : counts?.[status];

                  return (
                    <Chip
                      key={status}
                      selected={isSelected}
                      onPress={() => changeStatusFilter(status as 'all' | IncidentStatus)}
                      compact
                    >
                      {label}
                      {count !== undefined ? ` (${count})` : ''}
                    </Chip>
                  );
                })}
              </ScrollView>

              {/* Resumen de página + botones Anterior / Siguiente */}
              <Text>{t('reservations.pageSummary', { page, limit })}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button mode="outlined" onPress={prevPage} disabled={page <= 1}>
                  {t('common.previous')}
                </Button>
                <Button
                  mode="contained"
                  onPress={nextPage}
                  disabled={Boolean(incidentsQuery.data && page >= incidentsQuery.data.totalPages)}
                >
                  {t('common.next')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24 }}>
            {t('incidents.emptyList')}
          </Text>
        }
        renderItem={({ item }) => (
          <IncidentAdminCard
            incident={item}
            isResolving={isResolving}
            onResolve={handleResolve}
          />
        )}
      />

      {SnackbarUI}
    </View>
  );
}
