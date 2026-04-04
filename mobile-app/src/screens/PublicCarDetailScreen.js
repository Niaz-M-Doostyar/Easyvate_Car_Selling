import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, Image, Dimensions,
  Pressable, StatusBar,
} from 'react-native';
import { openLink } from '../utils/linking';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import publicApiClient from '../api/publicClient';
import { resolveAssetUrl } from '../api/config';
import { formatCurrency } from '../utils/constants';

const { width: W } = Dimensions.get('window');
const PRIMARY = '#1b4965';
const ACCENT = '#c8963e';

export default function PublicCarDetailScreen({ navigation, route }) {
  const vehicleId = route.params?.vehicleId;
  const [vehicle, setVehicle] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setError(false);
    Promise.all([
      publicApiClient.get(`/vehicles/${vehicleId}`),
      publicApiClient.get('/contact?locale=en'),
    ])
      .then(([vRes, cRes]) => {
        setVehicle(vRes.data.vehicle);
        const cl = cRes.data?.contacts || cRes.data || [];
        setContact(Array.isArray(cl) ? cl[0] : cl);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fb' }}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <MaterialCommunityIcons name="wifi-off" size={48} color="#ccc" />
      <Text style={{ color: '#999', marginTop: 12, textAlign: 'center' }}>Could not load vehicle details.</Text>
      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: PRIMARY, borderRadius: 20 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
      </Pressable>
    </View>
  );

  const images = vehicle.images || [];
  const imgUris = images.length > 0
    ? images.map(img => resolveAssetUrl(img.path || img)).filter(Boolean)
    : [];

  const specs = [
    ['Manufacturer', vehicle.manufacturer], ['Model', vehicle.model],
    ['Year', vehicle.year], ['Category', vehicle.category],
    ['Color', vehicle.color], ['Fuel Type', vehicle.fuelType],
    ['Transmission', vehicle.transmission], ['Engine Type', vehicle.engineType],
    ['Mileage', vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : null],
    ['Steering', vehicle.steering], ['Plate No', vehicle.plateNo],
    ['Status', vehicle.status],
  ].filter(([, v]) => v);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View style={styles.gallery}>
          {imgUris.length > 0 ? (
            <>
              <ScrollView
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
              >
                {imgUris.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
                ))}
              </ScrollView>
              {imgUris.length > 1 && (
                <View style={styles.dotRow}>
                  {imgUris.map((_, i) => (
                    <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
                  ))}
                </View>
              )}
              <View style={styles.imgCounter}>
                <Text style={{ color: '#fff', fontSize: 11 }}>{imgIndex + 1}/{imgUris.length}</Text>
              </View>
            </>
          ) : (
            <View style={[styles.galleryImg, styles.galleryPlaceholder]}>
              <MaterialCommunityIcons name="car-side" size={72} color="#ccc" />
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>{vehicle.manufacturer} {vehicle.model}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>
              {vehicle.year} • {vehicle.category} • {vehicle.color}
            </Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{formatCurrency(vehicle.sellingPrice)}</Text>
          </View>
        </View>

        {/* Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specItem}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact CTA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interested? Contact Us</Text>
          <View style={{ gap: 10 }}>
            {contact?.phone && (
              <Pressable onPress={() => openLink(`tel:${contact.phone}`)}>
                <LinearGradient colors={[PRIMARY, PRIMARY + 'CC']} style={styles.ctaBtn}>
                  <MaterialCommunityIcons name="phone" size={18} color="#fff" />
                  <Text style={styles.ctaBtnText}>Call Us: {contact.phone}</Text>
                </LinearGradient>
              </Pressable>
            )}
            {contact?.phone && (
              <Pressable onPress={() => openLink(`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`)}>
                <LinearGradient colors={['#25D366', '#1da851']} style={styles.ctaBtn}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
                  <Text style={styles.ctaBtnText}>Chat on WhatsApp</Text>
                </LinearGradient>
              </Pressable>
            )}
            {contact?.email && (
              <Pressable onPress={() => openLink(`mailto:${contact.email}?subject=Inquiry: ${vehicle.manufacturer} ${vehicle.model}`)}>
                <LinearGradient colors={[ACCENT, '#b8862e']} style={styles.ctaBtn}>
                  <MaterialCommunityIcons name="email-outline" size={18} color="#fff" />
                  <Text style={styles.ctaBtnText}>Send Email</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute', top: 50, left: 16, zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 22, padding: 9,
  },
  gallery: { width: W, height: 270, backgroundColor: '#1a1a2e' },
  galleryImg: { width: W, height: 270 },
  galleryPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  dotRow: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#fff', width: 16 },
  imgCounter: {
    position: 'absolute', bottom: 12, right: 14,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  titleCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    padding: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  vehicleName: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  priceTag: {
    backgroundColor: PRIMARY + '12', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 12, marginLeft: 10,
  },
  priceText: { fontSize: 14, fontWeight: '800', color: PRIMARY },
  section: {
    backgroundColor: '#fff', padding: 16, marginBottom: 10, borderRadius: 14,
    marginHorizontal: 12, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specItem: { width: '48%', backgroundColor: '#f8f9fb', padding: 10, borderRadius: 10 },
  specLabel: { fontSize: 10, color: '#888', fontWeight: '600', marginBottom: 2 },
  specValue: { fontSize: 13, fontWeight: '700', color: '#333' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
  },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 },
});
