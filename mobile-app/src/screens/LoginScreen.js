import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Dimensions } from 'react-native';
import { TextInput, Button, Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { paperTheme, isDark } = useAppTheme();
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
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={isDark ? ['#0f0f1e', '#1a1a2e'] : [c.primary, c.primary + 'DD']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle1, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={[styles.circle2, { backgroundColor: 'rgba(255,255,255,0.03)' }]} />

      {/* Back button */}
      {navigation?.goBack && (
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backInner}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            <Text style={styles.backText}>Home</Text>
          </View>
        </Pressable>
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo section */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="car-sports" size={44} color="#fff" />
            </View>
            <Text style={styles.appName}>Niazi Khpalwak</Text>
            <Text style={styles.subtitle}>Motor Puranchi — Car Showroom</Text>
          </View>

          {/* Login Card */}
          <View style={[styles.card, { backgroundColor: isDark ? c.card : '#fff' }, paperTheme.shadows?.xl]}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Welcome Back</Text>
            <Text style={[styles.cardSub, { color: c.onSurfaceVariant }]}>Sign in to your account</Text>

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: c.error + '12' }]}>
                <MaterialCommunityIcons name="alert-circle" size={18} color={c.error} />
                <Text style={[styles.errorText, { color: c.error }]}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              label="Username"
              value={username}
              onChangeText={(t) => { setUsername(t); setError(''); }}
              mode="outlined"
              left={<TextInput.Icon icon="account-outline" />}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              outlineColor={c.border}
              activeOutlineColor={c.primary}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              mode="outlined"
              secureTextEntry={!showPw}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showPw ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPw(!showPw)} />}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              outlineColor={c.border}
              activeOutlineColor={c.primary}
              onSubmitEditing={handleLogin}
            />

            <LinearGradient
              colors={c.gradient || [c.primary, c.primary + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                buttonColor="transparent"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </LinearGradient>
          </View>

          <Text style={styles.footer}>Easyvate Car Selling v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 80 },
  circle1: { position: 'absolute', width: W * 0.8, height: W * 0.8, borderRadius: W * 0.4, top: -W * 0.2, right: -W * 0.2 },
  circle2: { position: 'absolute', width: W * 0.6, height: W * 0.6, borderRadius: W * 0.3, bottom: -W * 0.1, left: -W * 0.2 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 36, left: 16, zIndex: 10 },
  backInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  appName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  card: { borderRadius: 24, padding: 24, paddingTop: 28 },
  cardTitle: { fontWeight: '800', fontSize: 24, textAlign: 'center', marginBottom: 4, letterSpacing: -0.5 },
  cardSub: { textAlign: 'center', marginBottom: 24, fontSize: 14 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600' },
  input: { marginBottom: 14, fontSize: 15 },
  inputOutline: { borderRadius: 14, borderWidth: 1.5 },
  gradientBtn: { borderRadius: 14, marginTop: 8, overflow: 'hidden' },
  button: { elevation: 0 },
  buttonContent: { height: 52 },
  buttonLabel: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});
