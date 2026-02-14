import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Card, Text, Switch, Divider, List, Chip } from 'react-native-paper';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAppTheme, ACCENT_PRESETS } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { paperTheme, isDark, setIsDark, accentKey, setAccentKey } = useAppTheme();
  const { user, logout } = useAuth();
  const c = paperTheme.colors;

  return (
    <ScreenWrapper title="Settings" navigation={navigation}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Info */}
        <Card style={[styles.card, { backgroundColor: c.primary }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 24, color: '#fff', fontWeight: '700' }}>
                {(user?.fullName || user?.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: '#fff', marginTop: 8 }}>{user?.fullName || user?.username}</Text>
            <Chip style={{ marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)' }} textStyle={{ color: '#fff', fontSize: 11 }}>
              {user?.role || 'User'}
            </Chip>
          </Card.Content>
        </Card>

        {/* Appearance */}
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 12 }}>Appearance</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface }}>Dark Mode</Text>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>Switch between light and dark theme</Text>
              </View>
              <Switch value={isDark} onValueChange={setIsDark} />
            </View>

            <Divider style={{ marginBottom: 12 }} />
            <Text variant="bodyMedium" style={{ fontWeight: '600', color: c.onSurface, marginBottom: 8 }}>Accent Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                <Pressable key={key} style={{ alignItems: 'center' }} onPress={() => setAccentKey(key)}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: preset.primary },
                      accentKey === key && { borderWidth: 3, borderColor: c.onSurface },
                    ]}
                  />
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant, fontSize: 8, marginTop: 2 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: '700', color: c.onSurface, marginBottom: 12 }}>About</Text>
            <List.Item title="App Name" description="Niazi Khpalwak Motor Puranchi"
              left={props => <List.Icon {...props} icon="car-sports" />} />
            <Divider />
            <List.Item title="Version" description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />} />
            <Divider />
            <List.Item title="Platform" description="React Native (Expo)"
              left={props => <List.Icon {...props} icon="cellphone" />} />
            <Divider />
            <List.Item title="Developer" description="Niaz Mohammad Doostyar"
              left={props => <List.Icon {...props} icon="account" />} />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={[styles.card, { backgroundColor: '#ffebee' }]} onPress={logout}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
            <List.Icon icon="logout" color="#c62828" />
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: '#c62828' }}>Sign Out</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { borderRadius: 12, elevation: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
});
