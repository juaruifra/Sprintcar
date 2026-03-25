import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AuthHeader from '../AuthHeader';
import { createRegisterSchema, RegisterFormValues } from './register.schema';
import { FormAuthTextInput } from '../form/FormAuthTextInput';
import { FormPasswordInput } from '../form/FormPasswordInput';
import { useAuth } from '../../context/AuthContext';

// Componente visual real de la pantalla de registro.
// Las rutas de Expo solo lo renderizan para mantener el patrón del proyecto.
const RegisterScreen: React.FC = () => {
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const theme = useTheme();
  const { t } = useTranslation();
  const { register } = useAuth();

  const registerSchema = createRegisterSchema(t);

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await register(data.email, data.password);
      router.replace('/home');
    } catch (error: any) {
      setAuthError(error?.message ?? t('common.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AuthHeader title={t('register.title')} subtitle={t('register.subtitle')} />

      <FormAuthTextInput
        control={control}
        name="email"
        label={t('common.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email" />}
      />

      <FormPasswordInput control={control} name="password" label={t('common.password')} />
      <FormPasswordInput
        control={control}
        name="confirmPassword"
        label={t('password.confirmPassword')}
      />

      {authError && (
        <Text
          style={{
            color: theme.colors.error,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {authError}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {t('register.submit')}
      </Button>

      <Text style={styles.loginText}>
        {t('register.haveAccount')}{' '}
        <Text
          style={[styles.loginLink, { color: theme.colors.primary }]}
          onPress={() => router.push('/login')}
        >
          {t('register.goToLogin')}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  button: {
    marginBottom: 24,
  },
  loginText: {
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
