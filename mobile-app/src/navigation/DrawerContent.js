import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Divider, TouchableRipple, Switch, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

export default function DrawerContent(props) {
  const { user, logout } = useAuth();
  const { isDark, toggleDark, paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const initials = (user?.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primaryContainer }]}>
        <Avatar.Text size={56} label={initials} style={{ backgroundColor: c.primary }} labelStyle={{ fontWeight: '700' }} />
        <View style={styles.headerText}>
          <Title style={[styles.name, { color: c.onSurface }]} numberOfLines={1}>{user?.fullName || 'User'}</Title>
          <Caption style={[styles.role, { color: c.primary }]}>{user?.role || 'Viewer'}</Caption>
        </View>
      </View>

      <Divider />

      {/* Nav Items */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <Divider />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableRipple onPress={toggleDark} style={styles.darkRow}>
          <View style={styles.darkRowInner}>
            <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={22} color={c.primary} />
            <Text style={[styles.darkLabel, { color: c.onSurface }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={toggleDark} color={c.primary} />
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={logout} style={styles.logoutRow}>
          <View style={styles.darkRowInner}>
            <MaterialCommunityIcons name="logout" size={22} color={c.error} />
            <Text style={[styles.darkLabel, { color: c.error }]}>Sign Out</Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', marginBottom: -2 },
  role: { fontSize: 13, fontWeight: '600' },
  footer: { paddingBottom: 20 },
  darkRow: { paddingHorizontal: 16, paddingVertical: 12 },
  darkRowInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  darkLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutRow: { paddingHorizontal: 16, paddingVertical: 12 },
});
