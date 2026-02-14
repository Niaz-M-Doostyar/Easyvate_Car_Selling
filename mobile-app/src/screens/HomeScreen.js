import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, StatusBar, Pressable, Linking } from 'react-native';
import { Text, Button, Card, Surface, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

const BRAND = {
  name: 'Niazi Khpalwak',
  tagline: 'Motor Puranchi',
  description: 'Premium Car Showroom & Dealership Management',
  fullDesc: 'Your trusted destination for buying, selling, and exchanging quality vehicles in Afghanistan. We provide transparent pricing, professional service, and a wide selection of vehicles.',
};

const FEATURES = [
  { icon: 'car-multiple', title: 'Wide Selection', desc: 'Browse our extensive inventory of quality vehicles', color: '#1565c0' },
  { icon: 'shield-check', title: 'Trusted Deals', desc: 'Transparent pricing with no hidden fees', color: '#2e7d32' },
  { icon: 'swap-horizontal-bold', title: 'Car Exchange', desc: 'Trade in your old vehicle for a new one', color: '#e65100' },
  { icon: 'file-document-outline', title: 'Licensed Cars', desc: 'All vehicles with proper documentation', color: '#7b1fa2' },
  { icon: 'currency-usd', title: 'Multi-Currency', desc: 'Pay in AFN, USD, or PKR', color: '#00695c' },
  { icon: 'handshake-outline', title: 'Easy Financing', desc: 'Flexible payment plans and loan options', color: '#c2185b' },
];

const VEHICLE_TYPES = [
  { icon: 'car-side', name: 'Sedans', color: '#1565c0' },
  { icon: 'car-estate', name: 'SUVs', color: '#2e7d32' },
  { icon: 'truck', name: 'Trucks', color: '#e65100' },
  { icon: 'car-sports', name: 'Sports', color: '#c2185b' },
  { icon: 'van-utility', name: 'Vans', color: '#7b1fa2' },
  { icon: 'car-convertible', name: 'Luxury', color: '#00695c' },
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

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Subtle pulse on the logo
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

        {/* ===== HERO SECTION ===== */}
        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialCommunityIcons name="car-sports" size={56} color="#fff" />
            </Animated.View>
            <Text style={styles.heroTitle}>{BRAND.name}</Text>
            <Text style={styles.heroTagline}>{BRAND.tagline}</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroDesc}>{BRAND.description}</Text>

            <View style={styles.heroBtnRow}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={styles.heroBtnPrimary}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}
                icon="login"
              >
                Sign In
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Login')}
                style={styles.heroBtnSecondary}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 14, fontWeight: '600', color: '#fff' }}
                textColor="#fff"
                icon="information-outline"
              >
                Learn More
              </Button>
            </View>
          </Animated.View>

          {/* Decorative car silhouettes */}
          <View style={styles.heroDecoRow}>
            {['car-side', 'car-estate', 'truck', 'car-sports'].map((icon, i) => (
              <Animated.View key={i} style={{ opacity: fadeAnim }}>
                <MaterialCommunityIcons name={icon} size={28} color="rgba(255,255,255,0.15)" />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ===== STATS BAR ===== */}
        <View style={styles.statsBar}>
          {STATS.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ===== ABOUT SECTION ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={22} color="#1b4965" />
            <Text style={styles.sectionTitle}>About Us</Text>
          </View>
          <Text style={styles.aboutText}>{BRAND.fullDesc}</Text>
          <View style={styles.aboutChips}>
            <Chip icon="map-marker" style={styles.aboutChip} textStyle={styles.aboutChipText}>Kabul, Afghanistan</Chip>
            <Chip icon="clock-outline" style={styles.aboutChip} textStyle={styles.aboutChipText}>Open 7 Days</Chip>
            <Chip icon="phone" style={styles.aboutChip} textStyle={styles.aboutChipText}>+93 700 000 000</Chip>
          </View>
        </View>

        {/* ===== FEATURES GRID ===== */}
        <View style={[styles.section, { backgroundColor: '#f0f4f8' }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-four-points" size={22} color="#1b4965" />
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <Animated.View key={i} style={[styles.featureCard, { opacity: fadeAnim }]}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '15' }]}>
                  <MaterialCommunityIcons name={f.icon} size={28} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ===== VEHICLE TYPES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="car-multiple" size={22} color="#1b4965" />
            <Text style={styles.sectionTitle}>Vehicle Categories</Text>
          </View>
          <Text style={styles.sectionSubtitle}>We deal in all types of vehicles to match your needs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleTypesRow}>
            {VEHICLE_TYPES.map((vt, i) => (
              <Pressable key={i} style={[styles.vehicleTypeCard, { borderColor: vt.color + '40' }]}>
                <View style={[styles.vehicleTypeIcon, { backgroundColor: vt.color + '12' }]}>
                  <MaterialCommunityIcons name={vt.icon} size={36} color={vt.color} />
                </View>
                <Text style={[styles.vehicleTypeName, { color: vt.color }]}>{vt.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ===== SERVICES ===== */}
        <View style={[styles.section, { backgroundColor: '#f0f4f8' }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={22} color="#1b4965" />
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>
          {SERVICES.map((svc, i) => (
            <Card key={i} style={styles.serviceCard} mode="elevated">
              <Card.Content style={styles.serviceContent}>
                <View style={[styles.serviceIcon, { backgroundColor: '#1b4965' + '12' }]}>
                  <MaterialCommunityIcons name={svc.icon} size={24} color="#1b4965" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>{svc.title}</Text>
                  <Text style={styles.serviceDesc}>{svc.desc}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* ===== SALE TYPES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="tag-multiple" size={22} color="#1b4965" />
            <Text style={styles.sectionTitle}>Sale Types</Text>
          </View>
          <Text style={styles.sectionSubtitle}>We offer multiple ways to buy and sell vehicles</Text>
          <View style={{ gap: 12, marginTop: 8 }}>
            {[
              { name: 'Container One Key', desc: 'Direct purchase with single key handover — simple and fast', icon: 'key', color: '#e65100' },
              { name: 'Exchange Car', desc: 'Trade your current vehicle and pay the difference', icon: 'swap-horizontal-bold', color: '#1565c0' },
              { name: 'Licensed Car', desc: 'Full documentation with traffic department transfer', icon: 'file-certificate', color: '#2e7d32' },
            ].map((st, i) => (
              <Card key={i} style={[styles.saleTypeCard, { borderLeftColor: st.color, borderLeftWidth: 4 }]} mode="elevated">
                <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={[styles.saleTypeIcon, { backgroundColor: st.color + '15' }]}>
                    <MaterialCommunityIcons name={st.icon} size={28} color={st.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.saleTypeName, { color: st.color }]}>{st.name}</Text>
                    <Text style={styles.saleTypeDesc}>{st.desc}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* ===== CTA SECTION ===== */}
        <View style={styles.ctaSection}>
          <MaterialCommunityIcons name="account-lock" size={40} color="#fff" />
          <Text style={styles.ctaTitle}>Staff Portal</Text>
          <Text style={styles.ctaDesc}>Sign in to access the full management dashboard — vehicles, sales, inventory, reports and more.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.ctaBtn}
            contentStyle={{ height: 52 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
            buttonColor="#fff"
            textColor="#1b4965"
            icon="login"
          >
            Sign In to Dashboard
          </Button>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <MaterialCommunityIcons name="car-sports" size={24} color="#c8963e" />
            <Text style={styles.footerBrand}>Niazi Khpalwak Motor Puranchi</Text>
          </View>
          <Divider style={{ backgroundColor: '#333', marginVertical: 12 }} />
          <View style={styles.footerLinks}>
            <Pressable style={styles.footerLink}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#999" />
              <Text style={styles.footerLinkText}>Kabul, Afghanistan</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => Linking.openURL('tel:+93700000000')}>
              <MaterialCommunityIcons name="phone" size={16} color="#999" />
              <Text style={styles.footerLinkText}>+93 700 000 000</Text>
            </Pressable>
            <Pressable style={styles.footerLink}>
              <MaterialCommunityIcons name="email" size={16} color="#999" />
              <Text style={styles.footerLinkText}>info@easyvate.com</Text>
            </Pressable>
          </View>
          <Divider style={{ backgroundColor: '#333', marginVertical: 12 }} />
          <Text style={styles.footerCopy}>© {new Date().getFullYear()} Easyvate Car Selling Platform</Text>
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
  hero: { backgroundColor: '#0d1b2a', paddingTop: 70, paddingBottom: 30, paddingHorizontal: 24, minHeight: H * 0.6, justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13, 27, 42, 0.85)' },
  heroContent: { alignItems: 'center', zIndex: 2 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1b4965', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#c8963e', marginBottom: 20, shadowColor: '#c8963e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1, textAlign: 'center' },
  heroTagline: { fontSize: 18, fontWeight: '600', color: '#c8963e', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  heroLine: { width: 60, height: 3, backgroundColor: '#c8963e', borderRadius: 2, marginVertical: 16 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  heroBtnRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  heroBtnPrimary: { borderRadius: 12, backgroundColor: '#c8963e', minWidth: 130 },
  heroBtnSecondary: { borderRadius: 12, borderColor: 'rgba(255,255,255,0.4)', minWidth: 130 },
  heroDecoRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingHorizontal: 20, zIndex: 2 },

  // Stats
  statsBar: { flexDirection: 'row', backgroundColor: '#1b4965', paddingVertical: 18, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#c8963e' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2, textAlign: 'center', fontWeight: '500' },

  // Section
  section: { paddingVertical: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0d1b2a', letterSpacing: 0.3 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 19 },

  // About
  aboutText: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 14 },
  aboutChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aboutChip: { backgroundColor: '#e3effb' },
  aboutChipText: { fontSize: 12, color: '#1b4965' },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  featureCard: { width: (W - 52) / 2, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#0d1b2a', marginBottom: 3 },
  featureDesc: { fontSize: 11, color: '#666', lineHeight: 16 },

  // Vehicle Types
  vehicleTypesRow: { paddingVertical: 8, gap: 12 },
  vehicleTypeCard: { width: 100, height: 110, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  vehicleTypeIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  vehicleTypeName: { fontSize: 13, fontWeight: '700' },

  // Services
  serviceCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10 },
  serviceContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serviceIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: '#0d1b2a' },
  serviceDesc: { fontSize: 12, color: '#666', lineHeight: 17, marginTop: 2 },

  // Sale Types
  saleTypeCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 1 },
  saleTypeIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saleTypeName: { fontSize: 15, fontWeight: '700' },
  saleTypeDesc: { fontSize: 12, color: '#666', lineHeight: 17, marginTop: 2 },

  // CTA
  ctaSection: { backgroundColor: '#1b4965', paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 12 },
  ctaDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, marginTop: 8, maxWidth: 300 },
  ctaBtn: { marginTop: 20, borderRadius: 12, minWidth: 220 },

  // Footer
  footer: { backgroundColor: '#0d1b2a', paddingVertical: 28, paddingHorizontal: 24 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBrand: { fontSize: 14, fontWeight: '700', color: '#c8963e' },
  footerLinks: { gap: 10 },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLinkText: { fontSize: 13, color: '#999' },
  footerCopy: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 },
  footerDev: { fontSize: 10, color: '#555', textAlign: 'center', marginTop: 4 },
});
