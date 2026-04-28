import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import IncidentUserCard from './cards/IncidentUserCard';
import {
  USER_INCIDENT_FILTERS,
  useIncidentsUserScreen,
} from '../../hooks/incidencias/useIncidentsUserScreen';
import { Incident, IncidentPriority, IncidentStatus } from '../../services/incidents/incidentsService';

// Etiquetas i18n para los chips de filtro de estado del usuario.
const STATUS_I18N_KEY: Record<IncidentStatus, string> = {
  ABIERTA: 'open',
  RESUELTA: 'resolved',
};

// Configuración visual de cada nivel de prioridad:
// icono material, color de fondo cuando está seleccionado.
const PRIORITY_OPTIONS: { value: IncidentPriority; labelKey: string; color: string }[] = [
  { value: 'BAJA', labelKey: 'incidents.priority.low', color: '#d4edda' },
  { value: 'MEDIA', labelKey: 'incidents.priority.medium', color: '#fff3cd' },
  { value: 'ALTA', labelKey: 'incidents.priority.high', color: '#f8d7da' },
];

export default function IncidentsUserScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    myIncidentsQuery,
    incidents,
    page,
    limit,
    nextPage,
    prevPage,
    statusFilter,
    changeStatusFilter,
    reportableReservations,
    isModalVisible,
    openModal,
    closeModal,
    selectedReservationId,
    setSelectedReservationId,
    description,
    setDescription,
    priority,
    setPriority,
    handleSubmit,
    isSubmitting,
    SnackbarUI,
  } = useIncidentsUserScreen();

  // Total de páginas que devuelve el backend (o 1 si aún no hay datos).
  const totalPages = myIncidentsQuery.data?.totalPages ?? 1;

  if (myIncidentsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
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
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                {t('incidents.myTitle')}
              </Text>

              {/* Chips de filtro por estado — igual que en la vista admin */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 10 }}
              >
                {USER_INCIDENT_FILTERS.map((status) => {
                  const isSelected = statusFilter === status;
                  const label =
                    status === 'all'
                      ? t('incidents.filterAll')
                      : t(`incidents.status.${STATUS_I18N_KEY[status as IncidentStatus]}`);
                  return (
                    <Chip
                      key={status}
                      selected={isSelected}
                      onPress={() => changeStatusFilter(status)}
                      compact
                    >
                      {label}
                    </Chip>
                  );
                })}
              </ScrollView>

              {/* Resumen de página + botones Anterior / Siguiente */}
              <Text style={{ marginBottom: 6 }}>
                {t('reservations.pageSummary', { page, limit })}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button mode="outlined" onPress={prevPage} disabled={page <= 1}>
                  {t('common.previous')}
                </Button>
                <Button
                  mode="contained"
                  onPress={nextPage}
                  disabled={page >= totalPages}
                >
                  {t('common.next')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24, color: theme.colors.onSurfaceVariant }}>
            {t('incidents.emptyListUser')}
          </Text>
        }
        renderItem={({ item }: { item: Incident }) => <IncidentUserCard incident={item} />}
      />

      {/* Modal para reportar incidencia */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={closeModal}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 20,
            borderRadius: 16,
            padding: 20,
            maxHeight: '85%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
              {t('incidents.reportTitle')}
            </Text>

            <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
              {t('incidents.selectReservationLabel')}
            </Text>

            {reportableReservations.length === 0 ? (
              <Surface
                style={{
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 16,
                  backgroundColor: theme.colors.surfaceVariant,
                }}
                elevation={0}
              >
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('incidents.noReportableReservations')}
                </Text>
              </Surface>
            ) : (
              <View style={{ gap: 8, marginBottom: 16 }}>
                {reportableReservations.map((r) => {
                  const isSelected = selectedReservationId === r.id;
                  const vehicleLabel = r.vehicle
                    ? `${r.vehicle.brand} ${r.vehicle.model} · ${r.vehicle.licensePlate}`
                    : `#${r.vehicleId}`;
                  return (
                    <Surface
                      key={r.id}
                      style={{
                        borderRadius: 10,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.outlineVariant,
                        backgroundColor: isSelected
                          ? theme.colors.primaryContainer
                          : theme.colors.surface,
                        overflow: 'hidden',
                      }}
                      elevation={0}
                    >
                      <TouchableRipple
                        onPress={() => setSelectedReservationId(r.id)}
                        style={{ padding: 12 }}
                        borderless
                      >
                        <View>
                          <Text
                            variant="bodyMedium"
                            style={{ color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
                          >
                            {vehicleLabel}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}
                          >
                            {t('incidents.reservationLabel')} #{r.id} · {r.startDate} → {r.endDate}
                          </Text>
                        </View>
                      </TouchableRipple>
                    </Surface>
                  );
                })}
              </View>
            )}

            <TextInput
              label={t('incidents.descriptionLabel')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ marginBottom: 16 }}
            />

            {/* Selector de prioridad: 3 botones tipo toggle, uno por nivel */}
            <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
              {t('incidents.priorityLabel')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <TouchableRipple
                    key={opt.value}
                    onPress={() => setPriority(opt.value)}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                      backgroundColor: isSelected ? opt.color : theme.colors.surface,
                      padding: 10,
                      alignItems: 'center',
                    }}
                    borderless
                  >
                    <Text
                      variant="labelMedium"
                      style={{ color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant }}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </TouchableRipple>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Button mode="outlined" onPress={closeModal} disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={isSubmitting || reportableReservations.length === 0 || !selectedReservationId}
                loading={isSubmitting}
              >
                {t('incidents.submitAction')}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: 'absolute', right: 16, bottom: 24 }}
        onPress={openModal}
        label={t('incidents.reportAction')}
      />

      {SnackbarUI && <SnackbarUI />}
    </View>
  );
}
