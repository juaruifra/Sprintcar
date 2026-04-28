import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import {
  ActivityIndicator,
  Divider,
  IconButton,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIncidentComments } from '../../hooks/incidencias/useIncidentComments';
import { IncidentComment } from '../../services/incidents/incidentsService';

type Props = {
  // ID de la incidencia cuyo log vamos a mostrar. null = modal cerrado.
  incidentId: number | null;
  // Título que aparece en la cabecera del modal (p.ej. "Vehículo · Matrícula").
  title: string;
  onClose: () => void;
};

/**
 * Modal de seguimiento (log de comentarios) de una incidencia.
 *
 * Muestra el hilo de mensajes cronológico y permite añadir nuevas notas.
 * Los mensajes del admin se distinguen visualmente con un fondo diferente.
 * Al abrir el modal, el hook ya carga los comentarios automáticamente.
 */
export default function IncidentCommentsModal({ incidentId, title, onClose }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [newText, setNewText] = useState('');
  // Referencia al FlatList para hacer scroll al final cuando llega un nuevo mensaje.
  const listRef = useRef<FlatList<IncidentComment>>(null);

  const { query, addMutation } = useIncidentComments(incidentId);

  const handleSend = () => {
    const trimmed = newText.trim();
    if (!trimmed || !incidentId) return;

    setNewText('');
    addMutation.mutate(
      { incidentId, text: trimmed },
      {
        // Después de insertar, deslizamos hasta el último mensaje.
        onSuccess: () => {
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        },
      },
    );
  };

  // Cada elemento del hilo de mensajes.
  const renderComment = ({ item }: { item: IncidentComment }) => {
    // Los mensajes del admin tienen un fondo levemente azulado para diferenciarse.
    const bubbleStyle = item.isAdmin
      ? { backgroundColor: theme.colors.primaryContainer, alignSelf: 'flex-start' as const }
      : { backgroundColor: theme.colors.surfaceVariant, alignSelf: 'flex-end' as const };

    return (
      <View style={{ marginBottom: 10 }}>
        <Surface
          style={[
            {
              borderRadius: 12,
              padding: 10,
              maxWidth: '85%',
            },
            bubbleStyle,
          ]}
          elevation={0}
        >
          {/* Nombre del autor con indicador si es admin */}
          <Text
            variant="labelSmall"
            style={{
              color: item.isAdmin ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              marginBottom: 2,
            }}
          >
            {item.authorName}
            {item.isAdmin ? ` · ${t('incidents.comments.adminBadge')}` : ''}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: item.isAdmin ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
          >
            {item.text}
          </Text>
          {/* Fecha y hora del comentario, en pequeño al pie del mensaje */}
          <Text
            variant="labelSmall"
            style={{
              marginTop: 4,
              color: item.isAdmin ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              opacity: 0.7,
            }}
          >
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </Surface>
      </View>
    );
  };

  return (
    <Portal>
      <Modal
        visible={incidentId !== null}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          margin: 20,
          borderRadius: 16,
          padding: 0,
          maxHeight: '80%',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera con título y botón de cerrar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{t('incidents.comments.title')}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {title}
            </Text>
          </View>
          <IconButton icon="close" onPress={onClose} />
        </View>

        <Divider />

        {/* Lista de comentarios */}
        {query.isLoading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={query.data ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            ListEmptyComponent={
              <Text
                variant="bodySmall"
                style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 8 }}
              >
                {t('incidents.comments.empty')}
              </Text>
            }
            renderItem={renderComment}
            // Al montar la lista, posicionamos al final para ver los mensajes más recientes.
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <Divider />

        {/* Caja de texto para escribir un nuevo comentario */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 8,
            }}
          >
            <TextInput
              mode="outlined"
              value={newText}
              onChangeText={setNewText}
              placeholder={t('incidents.comments.placeholder')}
              style={{ flex: 1 }}
              dense
              // Enviar con Enter en teclado físico (web/tablet).
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <IconButton
              icon="send"
              mode="contained"
              onPress={handleSend}
              // Deshabilitado si no hay texto o se está guardando.
              disabled={!newText.trim() || addMutation.isPending}
              loading={addMutation.isPending}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}
