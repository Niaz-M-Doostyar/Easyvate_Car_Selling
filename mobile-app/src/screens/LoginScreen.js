import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { TextInput, Button, Text, Card, HelperText, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: c.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Back to Home */}
      {navigation?.goBack && (
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.onSurface} />
          <Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600', marginLeft: 4 }}>Home</Text>
        </Pressable>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name="car-sports" size={48} color="#fff" />
          </View>
          <Text variant="headlineMedium" style={[styles.appName, { color: c.primary }]}>Niazi Khpalwak</Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: c.onSurfaceVariant }]}>Motor Puranchi — Car Showroom</Text>
        </View>

        {/* Login Card */}
        <Card style={[styles.card, { backgroundColor: c.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: c.onSurface }]}>Sign In</Text>
            <Text variant="bodySmall" style={[styles.cardSub, { color: c.onSurfaceVariant }]}>Enter your credentials to access the dashboard</Text>

            {error ? (
              <Surface style={[styles.errorBanner, { backgroundColor: c.error + '15' }]} elevation={0}>
                <MaterialCommunityIcons name="alert-circle" size={18} color={c.error} />
                <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
              </Surface>
            ) : null}

            <TextInput
              label="Username"
              value={username}
              onChangeText={(t) => { setUsername(t); setError(''); }}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              mode="outlined"
              secureTextEntry={!showPw}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={showPw ? 'eye-off' : 'eye'} onPress={() => setShowPw(!showPw)} />}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
              onSubmitEditing={handleLogin}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={{ height: 48 }}
              labelStyle={{ fontSize: 16, fontWeight: '700' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Card.Content>
        </Card>

        <Text style={[styles.footer, { color: c.onSurfaceVariant }]}>
          Easyvate Car Selling Management System v1.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  appName: { fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { marginTop: 4, fontSize: 14 },
  card: { borderRadius: 16, elevation: 3 },
  cardTitle: { fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  cardSub: { textAlign: 'center', marginBottom: 20 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '500' },
  input: { marginBottom: 14, fontSize: 15 },
  button: { marginTop: 8, borderRadius: 12 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 56, left: 16, zIndex: 10, padding: 8 },
});
