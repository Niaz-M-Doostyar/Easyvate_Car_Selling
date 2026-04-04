import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, StatusBar, RefreshControl } from 'react-native';
import { openLink } from '../utils/linking';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import publicApiClient from '../api/publicClient';

const PRIMARY = '#1b4965';
const ACCENT = '#c8963e';

function ActionRow({ icon, label, value, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow} disabled={!onPress}>
      <LinearGradient colors={[color + '22', color + '08']} style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </LinearGradient>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={[styles.actionValue, onPress && { color }]}>{value}</Text>
      </View>
      {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />}
    </Pressable>
  );
}

export default function PublicContactScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setError(false);
    try {
      const { data } = await publicApiClient.get('/contact?locale=en');
      const cl = data?.contacts || data || [];
      setContacts(Array.isArray(cl) ? cl : [cl]);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <MaterialCommunityIcons name="wifi-off" size={48} color="#ccc" />
      <Text style={{ color: '#999', marginTop: 12, textAlign: 'center' }}>Could not load contact information.</Text>
      <Pressable onPress={() => { setLoading(true); fetchData(); }} style={{ marginTop: 16, backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d1b2a', PRIMARY]} style={styles.header}>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <Text style={styles.headerSub}>We're here to help you</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[PRIMARY]} />}
      >
        {contacts.map((ct, idx) => (
          <View key={idx} style={styles.card}>
            {ct.branchName && <Text style={styles.branchName}>{ct.branchName}</Text>}

            {ct.phone && (
              <>
                <ActionRow
                  icon="phone" label="Phone" value={ct.phone}
                  color={PRIMARY} onPress={() => openLink(`tel:${ct.phone}`)}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="whatsapp" label="WhatsApp" value={ct.phone}
                  color="#25D366" onPress={() => openLink(`https://wa.me/${ct.phone.replace(/[^0-9]/g, '')}`)}
                />
                <View style={styles.divider} />
              </>
            )}
            {ct.email && (
              <>
                <ActionRow
                  icon="email-outline" label="Email" value={ct.email}
                  color={ACCENT} onPress={() => openLink(`mailto:${ct.email}`)}
                />
                <View style={styles.divider} />
              </>
            )}
            {ct.address && (
              <>
                <ActionRow icon="map-marker-outline" label="Address" value={ct.address} color="#8b5cf6" onPress={null} />
                <View style={styles.divider} />
              </>
            )}
            {ct.weekdays && (
              <>
                <ActionRow icon="clock-outline" label="Weekday Hours" value={ct.weekdays} color="#10b981" onPress={null} />
                {ct.friday && <View style={styles.divider} />}
              </>
            )}
            {ct.friday && (
              <ActionRow icon="clock-outline" label="Friday Hours" value={ct.friday} color="#10b981" onPress={null} />
            )}

            {(ct.facebook || ct.instagram || ct.x || ct.youtube) && (
              <>
                <View style={[styles.divider, { marginTop: 6 }]} />
                <Text style={styles.socialHeading}>Find Us On</Text>
                <View style={styles.socialRow}>
                  {ct.facebook && (
                    <Pressable onPress={() => openLink(ct.facebook)} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#1877f215' }]}>
                        <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
                      </View>
                      <Text style={styles.socialLabel}>Facebook</Text>
                    </Pressable>
                  )}
                  {ct.instagram && (
                    <Pressable onPress={() => openLink(ct.instagram)} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#c1358415' }]}>
                        <MaterialCommunityIcons name="instagram" size={24} color="#c13584" />
                      </View>
                      <Text style={styles.socialLabel}>Instagram</Text>
                    </Pressable>
                  )}
                  {ct.youtube && (
                    <Pressable onPress={() => openLink(ct.youtube)} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#ff000015' }]}>
                        <MaterialCommunityIcons name="youtube" size={24} color="#ff0000" />
                      </View>
                      <Text style={styles.socialLabel}>YouTube</Text>
                    </Pressable>
                  )}
                  {ct.x && (
                    <Pressable onPress={() => openLink(ct.x)} style={styles.socialBtn}>
                      <View style={[styles.socialIcon, { backgroundColor: '#1da1f215' }]}>
                        <MaterialCommunityIcons name="twitter" size={24} color="#1da1f2" />
                      </View>
                      <Text style={styles.socialLabel}>Twitter/X</Text>
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
            <Text style={{ color: '#999', marginTop: 14 }}>No contact info available</Text>
          </View>
        )}

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
});
