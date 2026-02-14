import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, StatusBar, Pressable, Linking } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

const BRAND = {
  name: 'Niazi Khpalwak',
  tagline: 'Motor Puranchi',
  description: 'Premium Car Showroom & Dealership Management',
  fullDesc: 'Your trusted destination for buying, selling, and exchanging quality vehicles in Afghanistan. We provide transparent pricing, professional service, and a wide selection of vehicles.',
};

const FEATURES = [
  { icon: 'car-multiple', title: 'Wide Selection', desc: 'Browse our extensive inventory of quality vehicles', color: '#3b82f6' },
  { icon: 'shield-check', title: 'Trusted Deals', desc: 'Transparent pricing with no hidden fees', color: '#10b981' },
  { icon: 'swap-horizontal-bold', title: 'Car Exchange', desc: 'Trade in your old vehicle for a new one', color: '#f59e0b' },
  { icon: 'file-document-outline', title: 'Licensed Cars', desc: 'All vehicles with proper documentation', color: '#8b5cf6' },
  { icon: 'currency-usd', title: 'Multi-Currency', desc: 'Pay in AFN, USD, or PKR', color: '#06b6d4' },
  { icon: 'handshake-outline', title: 'Easy Financing', desc: 'Flexible payment plans and loan options', color: '#ec4899' },
];

const VEHICLE_TYPES = [
  { icon: 'car-side', name: 'Sedans', color: '#3b82f6' },
  { icon: 'car-estate', name: 'SUVs', color: '#10b981' },
  { icon: 'truck', name: 'Trucks', color: '#f59e0b' },
  { icon: 'car-sports', name: 'Sports', color: '#ef4444' },
  { icon: 'van-utility', name: 'Vans', color: '#8b5cf6' },
  { icon: 'car-convertible', name: 'Luxury', color: '#c8963e' },
];

const STATS = [
  { value: '500+', label: 'Vehicles Sold' },
  { value: '1000+', label: 'Happy Customers' },
  { value: '50+', label: 'Brands Available' },
  { value: '10+', label: 'Years Experience' },
];

const SERVICES = [
  { icon: 'magnify', title: 'Vehicle Inspection', desc: 'Complete mechanical and body inspection before purchase' },
  { icon: 'file-certificate', title: 'Documentation', desc: 'Full paperwork handling, registration and transfer' },
  { icon: 'wrench', title: 'After-Sale Service', desc: 'Ongoing support and maintenance guidance' },
  { icon: 'truck-delivery', title: 'Delivery', desc: 'Vehicle delivery to your doorstep across Afghanistan' },
];

const ACCENT = '#c8963e';
const DARK = '#0d1b2a';
const PRIMARY = '#1b4965';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ===== HERO ===== */}
        <LinearGradient colors={[DARK, PRIMARY + 'dd']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }}>
          {/* Decorative circles */}
          <View style={[styles.decoCircle, { top: 30, right: -30, width: 120, height: 120, backgroundColor: ACCENT + '08' }]} />
          <View style={[styles.decoCircle, { bottom: 60, left: -40, width: 160, height: 160, backgroundColor: '#fff' + '05' }]} />

          <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialCommunityIcons name="car-sports" size={48} color="#fff" />
            </Animated.View>
            <Text style={styles.heroTitle}>{BRAND.name}</Text>
            <Text style={styles.heroTagline}>{BRAND.tagline}</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroDesc}>{BRAND.description}</Text>

            <View style={styles.heroBtnRow}>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <LinearGradient colors={[ACCENT, '#b8862e']} style={styles.heroBtnPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <MaterialCommunityIcons name="login" size={18} color="#fff" />
                  <Text style={styles.heroBtnPrimaryText}>Sign In</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Login')} style={styles.heroBtnSecondary}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#fff" />
                <Text style={styles.heroBtnSecondaryText}>Learn More</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={[styles.heroDecoRow, { opacity: fadeAnim }]}>
            {['car-side', 'car-estate', 'truck', 'car-sports'].map((icon, i) => (
              <MaterialCommunityIcons key={i} name={icon} size={24} color="rgba(255,255,255,0.1)" />
            ))}
          </Animated.View>
        </LinearGradient>

        {/* ===== STATS ===== */}
        <LinearGradient colors={[PRIMARY, PRIMARY + 'e6']} style={styles.statsBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {STATS.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* ===== ABOUT ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={[PRIMARY + '20', PRIMARY + '08']} style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="information-outline" size={18} color={PRIMARY} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>About Us</Text>
          </View>
          <Text style={styles.aboutText}>{BRAND.fullDesc}</Text>
          <View style={styles.aboutChips}>
            {[
              { icon: 'map-marker-outline', text: 'Kabul, Afghanistan' },
              { icon: 'clock-outline', text: 'Open 7 Days' },
              { icon: 'phone-outline', text: '+93 700 000 000' },
            ].map((c, i) => (
              <View key={i} style={styles.aboutChip}>
                <MaterialCommunityIcons name={c.icon} size={14} color={PRIMARY} />
                <Text style={styles.aboutChipText}>{c.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== FEATURES ===== */}
        <View style={[styles.section, { backgroundColor: '#f5f7fb' }]}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={[ACCENT + '25', ACCENT + '08']} style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="star-four-points" size={18} color={ACCENT} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <Animated.View key={i} style={[styles.featureCard, { opacity: fadeAnim }]}>
                <LinearGradient colors={[f.color + '18', f.color + '06']} style={styles.featureIcon}>
                  <MaterialCommunityIcons name={f.icon} size={24} color={f.color} />
                </LinearGradient>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ===== VEHICLE TYPES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={[PRIMARY + '20', PRIMARY + '08']} style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="car-multiple" size={18} color={PRIMARY} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Vehicle Categories</Text>
          </View>
          <Text style={styles.sectionSubtitle}>We deal in all types of vehicles to match your needs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleTypesRow}>
            {VEHICLE_TYPES.map((vt, i) => (
              <Pressable key={i} style={styles.vehicleTypeCard}>
                <LinearGradient colors={[vt.color + '15', vt.color + '05']} style={styles.vehicleTypeIcon}>
                  <MaterialCommunityIcons name={vt.icon} size={32} color={vt.color} />
                </LinearGradient>
                <Text style={[styles.vehicleTypeName, { color: vt.color }]}>{vt.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ===== SERVICES ===== */}
        <View style={[styles.section, { backgroundColor: '#f5f7fb' }]}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={[PRIMARY + '20', PRIMARY + '08']} style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="cog-outline" size={18} color={PRIMARY} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>
          {SERVICES.map((svc, i) => (
            <View key={i} style={styles.serviceCard}>
              <LinearGradient colors={[PRIMARY + '15', PRIMARY + '05']} style={styles.serviceIcon}>
                <MaterialCommunityIcons name={svc.icon} size={22} color={PRIMARY} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{svc.title}</Text>
                <Text style={styles.serviceDesc}>{svc.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ===== SALE TYPES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={[ACCENT + '25', ACCENT + '08']} style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="tag-multiple-outline" size={18} color={ACCENT} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Sale Types</Text>
          </View>
          <Text style={styles.sectionSubtitle}>We offer multiple ways to buy and sell vehicles</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {[
              { name: 'Container One Key', desc: 'Direct purchase with single key handover — simple and fast', icon: 'key-variant', color: '#f59e0b' },
              { name: 'Exchange Car', desc: 'Trade your current vehicle and pay the difference', icon: 'swap-horizontal-bold', color: '#3b82f6' },
              { name: 'Licensed Car', desc: 'Full documentation with traffic department transfer', icon: 'file-certificate-outline', color: '#10b981' },
            ].map((st, i) => (
              <View key={i} style={styles.saleTypeCard}>
                <LinearGradient colors={[st.color + '18', st.color + '06']} style={styles.saleTypeIcon}>
                  <MaterialCommunityIcons name={st.icon} size={24} color={st.color} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.saleTypeName, { color: st.color }]}>{st.name}</Text>
                  <Text style={styles.saleTypeDesc}>{st.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== CTA ===== */}
        <LinearGradient colors={[PRIMARY, DARK]} style={styles.ctaSection} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.ctaIconCircle}>
            <MaterialCommunityIcons name="account-lock-outline" size={32} color={ACCENT} />
          </View>
          <Text style={styles.ctaTitle}>Staff Portal</Text>
          <Text style={styles.ctaDesc}>Sign in to access the full management dashboard — vehicles, sales, inventory, reports and more.</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
              <MaterialCommunityIcons name="login" size={18} color={PRIMARY} />
              <Text style={styles.ctaBtnText}>Sign In to Dashboard</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <MaterialCommunityIcons name="car-sports" size={22} color={ACCENT} />
            <Text style={styles.footerBrand}>Niazi Khpalwak Motor Puranchi</Text>
          </View>
          <View style={[styles.footerDivider, { marginVertical: 14 }]} />
          <View style={styles.footerLinks}>
            <Pressable style={styles.footerLink}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#777" />
              <Text style={styles.footerLinkText}>Kabul, Afghanistan</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => Linking.openURL('tel:+93700000000')}>
              <MaterialCommunityIcons name="phone-outline" size={14} color="#777" />
              <Text style={styles.footerLinkText}>+93 700 000 000</Text>
            </Pressable>
            <Pressable style={styles.footerLink}>
              <MaterialCommunityIcons name="email-outline" size={14} color="#777" />
              <Text style={styles.footerLinkText}>info@easyvate.com</Text>
            </Pressable>
          </View>
          <View style={[styles.footerDivider, { marginVertical: 14 }]} />
          <Text style={styles.footerCopy}>{new Date().getFullYear()} Easyvate Car Selling Platform</Text>
          <Text style={styles.footerDev}>Developed by Niaz Mohammad Doostyar</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },

  // Hero
  hero: { paddingTop: 70, paddingBottom: 30, paddingHorizontal: 24, minHeight: H * 0.6, justifyContent: 'center' },
  decoCircle: { position: 'absolute', borderRadius: 999, },
  heroContent: { alignItems: 'center', zIndex: 2 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: ACCENT, marginBottom: 20, shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  heroTitle: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 0.5, textAlign: 'center' },
  heroTagline: { fontSize: 16, fontWeight: '700', color: ACCENT, letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' },
  heroLine: { width: 50, height: 3, backgroundColor: ACCENT, borderRadius: 2, marginVertical: 16 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  heroBtnRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  heroBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  heroBtnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  heroBtnSecondary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  heroBtnSecondaryText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  heroDecoRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingHorizontal: 20, zIndex: 2 },

  // Stats
  statsBar: { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: ACCENT },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center', fontWeight: '500' },

  // Section
  section: { paddingVertical: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: DARK, letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: 13, color: '#888', marginBottom: 8, lineHeight: 19 },

  // About
  aboutText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 14 },
  aboutChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aboutChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY + '0c', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  aboutChipText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  featureCard: { width: (W - 50) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 3, letterSpacing: -0.1 },
  featureDesc: { fontSize: 11, color: '#888', lineHeight: 16 },

  // Vehicle Types
  vehicleTypesRow: { paddingVertical: 8, gap: 10 },
  vehicleTypeCard: { width: 96, height: 108, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  vehicleTypeIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  vehicleTypeName: { fontSize: 12, fontWeight: '700' },

  // Services
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  serviceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: DARK },
  serviceDesc: { fontSize: 12, color: '#888', lineHeight: 17, marginTop: 2 },

  // Sale Types
  saleTypeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  saleTypeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saleTypeName: { fontSize: 14, fontWeight: '700' },
  saleTypeDesc: { fontSize: 12, color: '#888', lineHeight: 17, marginTop: 2 },

  // CTA
  ctaSection: { paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' },
  ctaIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: ACCENT + '30' },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 14, letterSpacing: -0.3 },
  ctaDesc: { fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, marginTop: 8, maxWidth: 300 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, paddingHorizontal: 28, paddingVertical: 15, borderRadius: 14 },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: PRIMARY },

  // Footer
  footer: { backgroundColor: DARK, paddingVertical: 28, paddingHorizontal: 24 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBrand: { fontSize: 14, fontWeight: '700', color: ACCENT },
  footerDivider: { height: 1, backgroundColor: '#1a2a3a' },
  footerLinks: { gap: 10 },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLinkText: { fontSize: 13, color: '#777' },
  footerCopy: { fontSize: 11, color: '#556', textAlign: 'center', marginTop: 4 },
  footerDev: { fontSize: 10, color: '#445', textAlign: 'center', marginTop: 4 },
});
