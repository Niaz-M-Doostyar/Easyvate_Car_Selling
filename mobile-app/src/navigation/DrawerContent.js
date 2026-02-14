import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Divider, TouchableRipple, Switch, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

export default function DrawerContent(props) {
  const { user, logout } = useAuth();
  const { isDark, setIsDark, paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const initials = (user?.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={c.gradient || [c.primary, c.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarRing}>
          <Avatar.Text
            size={52}
            label={initials}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{user?.fullName || 'User'}</Text>
          <View style={styles.roleChip}>
            <MaterialCommunityIcons name="shield-check" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.roleText}>{user?.role || 'Viewer'}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Nav Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.navContent}
        showsVerticalScrollIndicator={false}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Premium Footer */}
      <View style={[styles.footer, { borderTopColor: c.border }]}>
        <TouchableRipple onPress={setIsDark} style={styles.footerRow} borderless>
          <View style={styles.footerInner}>
            <View style={[styles.footerIcon, { backgroundColor: c.primary + '12' }]}>
              <MaterialCommunityIcons
                name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                size={18}
                color={c.primary}
              />
            </View>
            <Text style={[styles.footerLabel, { color: c.onSurface }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={setIsDark} color={c.primary} />
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={logout} style={styles.footerRow} borderless>
          <View style={styles.footerInner}>
            <View style={[styles.footerIcon, { backgroundColor: c.error + '12' }]}>
              <MaterialCommunityIcons name="logout" size={18} color={c.error} />
            </View>
            <Text style={[styles.footerLabel, { color: c.error, fontWeight: '600' }]}>Sign Out</Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: { backgroundColor: 'rgba(255,255,255,0.2)' },
  avatarLabel: { fontWeight: '800', color: '#fff', fontSize: 18 },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  navContent: { paddingTop: 6 },
  footer: { paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1 },
  footerRow: { paddingHorizontal: 16, paddingVertical: 11 },
  footerInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  footerLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});
