import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Avatar, TouchableRipple, Switch, Text } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageMenuButton from '../components/LanguageMenuButton';

export default function DrawerContent(props) {
  const { user, logout } = useAuth();
  const { isDark, setIsDark, paperTheme } = useAppTheme();
  const c = paperTheme.colors;
  const { t, fontFamily, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();

  const initials = (user?.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const renderNavigationItems = () => props.state.routes.map((route, index) => {
    const focused = props.state.index === index;
    const options = props.descriptors[route.key]?.options || {};
    const color = focused ? c.primary : c.onSurfaceVariant;
    const label = options.title || route.name;

    return (
      <TouchableRipple
        key={route.key}
        onPress={() => {
          if (!focused) props.navigation.navigate(route.name);
          props.navigation.closeDrawer();
        }}
        style={[styles.navItem, focused && { backgroundColor: c.primary + '14' }]}
        borderless
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
      >
        <View style={[styles.navItemInner, isRTL && styles.rowReverse]}>
          <View style={styles.navIcon}>
            {options.drawerIcon?.({ color, size: 22, focused })}
          </View>
          <Text
            numberOfLines={1}
            style={[styles.navLabel, { color, fontFamily }, isRTL && styles.rtlText]}
          >
            {label}
          </Text>
        </View>
      </TouchableRipple>
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={c.gradient || [c.primary, c.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 58 }]}
      >
        <LanguageMenuButton light onBeforeChange={() => props.navigation.closeDrawer()} style={[styles.headerLanguage, { top: Math.max(insets.top, 16) + 8 }, isRTL ? { left: 10 } : { right: 10 }]} />
        <View style={[styles.profileRow, isRTL && styles.rowReverse]}>
          <View style={styles.avatarRing}>
            <Avatar.Text
              size={52}
              label={initials}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          </View>
          <View style={[styles.headerText, isRTL && styles.alignEnd]}>
            <Text style={[styles.name, { fontFamily }, isRTL && styles.rtlText]} numberOfLines={1}>{user?.fullName || 'User'}</Text>
            <View style={[styles.roleChip, isRTL && styles.rowReverse]}>
              <MaterialCommunityIcons name="shield-check" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.roleText, { fontFamily }]}>{t(user?.role || 'Viewer')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Nav Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.navContent}
        showsVerticalScrollIndicator={false}
      >
        {renderNavigationItems()}
      </DrawerContentScrollView>

      {/* Premium Footer */}
      <View style={[styles.footer, { borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 12) + 4 }]}> 
        <TouchableRipple onPress={setIsDark} style={styles.footerRow} borderless>
          <View style={[styles.footerInner, isRTL && { flexDirection: 'row-reverse' }]}> 
            <View style={[styles.footerIcon, { backgroundColor: c.primary + '12' }]}>
              <MaterialCommunityIcons
                name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                size={18}
                color={c.primary}
              />
            </View>
            <Text style={[styles.footerLabel, { color: c.onSurface, fontFamily }]}>{t('Dark Mode')}</Text>
            <Switch value={isDark} onValueChange={setIsDark} color={c.primary} />
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={logout} style={styles.footerRow} borderless>
          <View style={[styles.footerInner, isRTL && { flexDirection: 'row-reverse' }]}> 
            <View style={[styles.footerIcon, { backgroundColor: c.error + '12' }]}>
              <MaterialCommunityIcons name="logout" size={18} color={c.error} />
            </View>
            <Text style={[styles.footerLabel, { color: c.error, fontWeight: '600', fontFamily }]}>{t('Sign Out')}</Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerLanguage: { position: 'absolute', transform: [{ scale: 0.9 }] },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: { backgroundColor: 'rgba(255,255,255,0.2)' },
  avatarLabel: { fontWeight: '800', color: '#fff', fontSize: 18 },
  headerText: { flex: 1, minWidth: 0, alignItems: 'flex-start' },
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
  },
  roleText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  navContent: { paddingTop: 8, paddingHorizontal: 10, gap: 3 },
  navItem: { borderRadius: 14, overflow: 'hidden' },
  navItemInner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12 },
  navIcon: { width: 28, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '600', writingDirection: 'ltr', textAlign: 'left' },
  footer: { borderTopWidth: 1 },
  footerRow: { paddingHorizontal: 16, paddingVertical: 11 },
  footerInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  footerLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  rowReverse: { flexDirection: 'row-reverse' },
  alignEnd: { alignItems: 'flex-end' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
