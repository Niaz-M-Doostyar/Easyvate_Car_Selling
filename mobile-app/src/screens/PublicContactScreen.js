import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, StatusBar, RefreshControl } from 'react-native';
import { openLink } from '../utils/linking';
import { Text, ActivityIndicator } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import publicApiClient from '../api/publicClient';
import { extractContacts, socialUrl } from '../data/publicContent';
import { phoneUrl, whatsappUrl } from '../data/publicContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';

const PRIMARY = '#1b4965';
const ACCENT = '#c8963e';

function ActionRow({ icon, label, value, color, onPress, t, isRTL, fontFamily }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionRow, isRTL && { flexDirection: 'row-reverse' }]} disabled={!onPress}>
      <LinearGradient colors={[color + '22', color + '08']} style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </LinearGradient>
      <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
        <Text style={[styles.actionLabel, { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t(label)}</Text>
        <Text style={[styles.actionValue, { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, onPress && { color }]}>{value}</Text>
      </View>
      {onPress && <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={18} color="#ccc" />}
    </Pressable>
  );
}

export default function PublicContactScreen({ navigation }) {
  const { t, isRTL, fontFamily, textStyle, publicLocale } = useLanguage();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async ({ showLoader = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (showLoader) setLoading(true);
    setError(false);
    try {
      const { data } = await publicApiClient.get('/contact', {
        params: { locale: publicLocale, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (requestId !== requestIdRef.current) return;

      const localizedContacts = extractContacts(data);
      if (!localizedContacts.length) {
        throw new Error(`No contact data returned for locale: ${publicLocale}`);
      }

      setContacts(localizedContacts);
      setError(false);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setContacts([]);
      setError(true);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [publicLocale]);

  useEffect(() => {
    fetchData({ showLoader: true });
    return () => { requestIdRef.current += 1; };
  }, [fetchData]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <MaterialCommunityIcons name="wifi-off" size={48} color="#ccc" />
      <Text style={{ color: '#999', marginTop: 12, textAlign: 'center', fontFamily }}>{t('Could not load contact information.')}</Text>
      <Pressable onPress={() => fetchData({ showLoader: true })} style={{ marginTop: 16, backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontFamily }}>{t('Retry')}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d1b2a', PRIMARY]} style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={[styles.headerTitle, { fontFamily, ...textStyle }]}>{t('Contact Us')}</Text>
        <Text style={[styles.headerSub, { fontFamily, ...textStyle }]}>{t("We're here to help you")}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[PRIMARY]} />}
      >
        {contacts.map((ct, idx) => (
          <View key={ct.id ?? idx} style={styles.card}>
            {ct.branchName && <Text style={[styles.branchName, { fontFamily, ...textStyle }]}>{ct.branchName}</Text>}

            {ct.phone && (
              <>
                <ActionRow
                  icon="phone" label="Phone" value={ct.phone}
                  color={PRIMARY} onPress={() => openLink(phoneUrl(ct.phone))} t={t} isRTL={isRTL} fontFamily={fontFamily}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="whatsapp" label="WhatsApp" value={ct.phone}
                  color="#25D366" onPress={() => openLink(whatsappUrl(ct.phone))} t={t} isRTL={isRTL} fontFamily={fontFamily}
                />
                <View style={styles.divider} />
              </>
            )}
            {ct.email && (
              <>
                <ActionRow
                  icon="email-outline" label="Email" value={ct.email}
                  color={ACCENT} onPress={() => openLink(`mailto:${ct.email}`)} t={t} isRTL={isRTL} fontFamily={fontFamily}
                />
                <View style={styles.divider} />
              </>
            )}
            {ct.address && (
              <>
                <ActionRow icon="map-marker-outline" label="Address" value={ct.address} color="#8b5cf6" onPress={null} t={t} isRTL={isRTL} fontFamily={fontFamily} />
                <View style={styles.divider} />
              </>
            )}
            {ct.weekdays && (
              <>
                <ActionRow icon="clock-outline" label="Weekday Hours" value={ct.weekdays} color="#10b981" onPress={null} t={t} isRTL={isRTL} fontFamily={fontFamily} />
                {ct.friday && <View style={styles.divider} />}
              </>
            )}
            {ct.friday && (
              <ActionRow icon="clock-outline" label="Friday Hours" value={ct.friday} color="#10b981" onPress={null} t={t} isRTL={isRTL} fontFamily={fontFamily} />
            )}

            {(ct.facebook || ct.x || ct.tiktok || ct.tikTok || ct.instagram || ct.youtube) && (
              <>
                <View style={[styles.divider, { marginTop: 6 }]} />
                <Text style={[styles.socialHeading, { fontFamily, ...textStyle }]}>{t('Find Us On')}</Text>
                <View style={[styles.socialRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  {ct.facebook && (
                    <Pressable onPress={() => openLink(socialUrl(ct.facebook))} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#1877f215' }]}>
                        <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
                      </View>
                      <Text style={[styles.socialLabel, { fontFamily }]}>Facebook</Text>
                    </Pressable>
                  )}
                  {ct.x && (
                    <Pressable onPress={() => openLink(socialUrl(ct.x))} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#11111115' }]}> 
                        <MaterialCommunityIcons name="alpha-x-box" size={24} color="#111" />
                      </View>
                      <Text style={[styles.socialLabel, { fontFamily }]}>X</Text>
                    </Pressable>
                  )}
                  {(ct.tiktok || ct.tikTok) && (
                    <Pressable onPress={() => openLink(socialUrl(ct.tiktok || ct.tikTok))} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#11111115' }]}>
                        <MaterialCommunityIcons name="music-note" size={24} color="#111" />
                      </View>
                      <Text style={[styles.socialLabel, { fontFamily }]}>TikTok</Text>
                    </Pressable>
                  )}
                  {ct.instagram && (
                    <Pressable onPress={() => openLink(socialUrl(ct.instagram))} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#c1358415' }]}>
                        <MaterialCommunityIcons name="instagram" size={24} color="#c13584" />
                      </View>
                      <Text style={[styles.socialLabel, { fontFamily }]}>Instagram</Text>
                    </Pressable>
                  )}
                  {ct.youtube && (
                    <Pressable onPress={() => openLink(socialUrl(ct.youtube))} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#ff000015' }]}>
                        <MaterialCommunityIcons name="youtube" size={24} color="#ff0000" />
                      </View>
                      <Text style={[styles.socialLabel, { fontFamily }]}>YouTube</Text>
                    </Pressable>
                  )}

                </View>
              </>
            )}
          </View>
        ))}

        {contacts.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <MaterialCommunityIcons name="phone-off" size={52} color="#ccc" />
            <Text style={{ color: '#999', marginTop: 14, fontFamily }}>{t('No contact info available')}</Text>
          </View>
        )}

        <Pressable onPress={() => navigation.navigate('PrivacyPolicy')} style={styles.privacyLink}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color={PRIMARY} />
          <Text style={{ color: PRIMARY, fontFamily, fontWeight: '700' }}>{t('privacy_title')}</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  scroll: { padding: 14, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6,
  },
  branchName: { fontSize: 16, fontWeight: '800', color: PRIMARY, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  actionIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 10, color: '#aaa', fontWeight: '600', marginBottom: 2 },
  actionValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  socialHeading: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 12, marginTop: 8 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  socialBtn: { alignItems: 'center', gap: 5, minWidth: 60 },
  socialIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  socialLabel: { fontSize: 10, color: '#888', fontWeight: '600' },
  privacyLink: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 8, padding: 12 },
});
