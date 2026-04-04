import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, StatusBar, RefreshControl, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import publicApiClient from '../api/publicClient';
import { resolveAssetUrl } from '../api/config';

const PRIMARY = '#1b4965';
const ACCENT = '#c8963e';

export default function PublicAboutScreen() {
  const [about, setAbout] = useState(null);
  const [logos, setLogos] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setError(false);
    try {
      const [aboutRes, teamRes] = await Promise.all([
        publicApiClient.get('/about?locale=en'),
        publicApiClient.get('/team?locale=en'),
      ]);
      setAbout(aboutRes.data?.about || null);
      setLogos(aboutRes.data?.logos || []);
      setMembers(teamRes.data?.members || []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fb' }}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f7fb' }}>
      <MaterialCommunityIcons name="wifi-off" size={48} color="#ccc" />
      <Text style={{ color: '#999', marginTop: 12, textAlign: 'center' }}>Could not load content. Check your connection.</Text>
      <Pressable onPress={() => { setLoading(true); fetchData(); }} style={{ marginTop: 16, backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d1b2a', PRIMARY]} style={styles.header}>
        <Text style={styles.headerTitle}>About Us</Text>
        <Text style={styles.headerSub}>Niazi Khpalwak Motor Puranchi</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[PRIMARY]} />}
      >
        {/* About text */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{about?.title || 'About Niazi Khpalwak'}</Text>
          {about?.subtitle ? <Text style={styles.cardSubtitle}>{about.subtitle}</Text> : null}
          <View style={styles.divider} />
          <Text style={styles.cardDesc}>
            {about?.description || 'Your trusted destination for buying, selling, and exchanging quality vehicles in Afghanistan.'}
          </Text>
        </View>

        {/* Brand logos */}
        {logos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Our Brands</Text>
            <View style={styles.logosGrid}>
              {logos.map(logo => (
                <View key={logo.id} style={styles.logoBox}>
                  <Image
                    source={{ uri: resolveAssetUrl(logo.path) }}
                    style={styles.logoImg}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Why choose us */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          {[
            { icon: 'shield-check', title: 'Trusted & Licensed', color: '#10b981', desc: 'All vehicles with proper documentation and legal verification.' },
            { icon: 'cash-multiple', title: 'Transparent Pricing', color: '#3b82f6', desc: 'Clear pricing in AFN, USD, and PKR — no hidden fees.' },
            { icon: 'swap-horizontal-bold', title: 'Car Exchange', color: '#f59e0b', desc: 'Trade in your vehicle for a better one with fair valuation.' },
            { icon: 'handshake-outline', title: 'Easy Financing', color: '#8b5cf6', desc: 'Flexible installment plans and loan options available.' },
            { icon: 'wrench', title: 'After-Sale Support', color: '#ec4899', desc: 'Ongoing support and maintenance guidance after purchase.' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <LinearGradient colors={[item.color + '22', item.color + '08']} style={styles.featureIcon}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Team */}
        {members.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <View style={styles.teamGrid}>
              {members.map(m => (
                <View key={m.id} style={styles.memberCard}>
                  {m.image ? (
                    <Image source={{ uri: resolveAssetUrl(m.image) }} style={styles.memberImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>{(m.name || '?')[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                  <Text style={styles.memberPosition} numberOfLines={2}>{m.position}</Text>
                </View>
              ))}
            </View>
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
  scroll: { padding: 14, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  cardSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  cardDesc: { fontSize: 14, color: '#444', lineHeight: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  logosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  logoBox: {
    width: 68, height: 68, borderRadius: 12,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 6,
  },
  logoImg: { width: '100%', height: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  featureIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 3 },
  featureDesc: { fontSize: 12, color: '#666', lineHeight: 17 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  memberCard: { width: '30%', alignItems: 'center' },
  memberImg: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  memberAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: PRIMARY + '14', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  memberInitial: { fontSize: 22, fontWeight: '800', color: PRIMARY },
  memberName: { fontSize: 12, fontWeight: '700', color: '#222', textAlign: 'center' },
  memberPosition: { fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2, lineHeight: 14 },
});
