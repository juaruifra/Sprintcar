import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  FAB,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AppHeader from '../layout/AppHeader';
import IncidentUserCard from './cards/IncidentUserCard';
import { useIncidentsUserScreen } from '../../hooks/incidencias/useIncidentsUserScreen';

export default function IncidentsUserScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    myIncidentsQuery,
    incidents,
    reportableReservations,
    isModalVisible,
    openModal,
    closeModal,
    selectedReservationId,
    setSelectedReservationId,
    description,
    setDescription,
    handleSubmit,
    isSubmitting,
    SnackbarUI,
  } = useIncidentsUserScreen();

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
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            {t('incidents.myTitle')}
          </Text>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24 }}>
            {t('incidents.emptyListUser')}
          </Text>
        }
        renderItem={({ item }) => <IncidentUserCard incident={item} />}
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
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            {t('incidents.reportTitle')}
          </Text>

          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            {t('incidents.selectReservationLabel')}
          </Text>

          {reportableReservations.length === 0 ? (
            <Text variant="bodySmall" style={{ marginBottom: 12, color: theme.colors.onSurfaceVariant }}>
              {t('incidents.noReportableReservations')}
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {reportableReservations.map((r) => (
                  <Button
                    key={r.id}
                    mode={selectedReservationId === r.id ? 'contained' : 'outlined'}
                    compact
                    onPress={() => setSelectedReservationId(r.id)}
                  >
                    #{r.id} — {r.vehicle?.licensePlate ?? `v#${r.vehicleId}`}
                  </Button>
                ))}
              </View>
            </ScrollView>
          )}

          <TextInput
            label={t('incidents.descriptionLabel')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ marginBottom: 16 }}
          />

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <Button mode="outlined" onPress={closeModal} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={isSubmitting || reportableReservations.length === 0}
              loading={isSubmitting}
            >
              {t('incidents.submitAction')}
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: 'absolute', right: 16, bottom: 24 }}
        onPress={openModal}
        label={t('incidents.reportAction')}
      />

      {SnackbarUI}
    </View>
  );
}
