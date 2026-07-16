import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Share, Linking, Image, Pressable } from 'react-native';
import { Text } from '../components/LocalizedPaper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusChip from '../components/StatusChip';
import { useAppTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/constants';
import publicApiClient from '../api/publicClient';
import { resolveAssetUrl } from '../api/config';
import { extractContacts, mergeLocalizedContact, phoneUrl, selectPrimaryContact, socialUrl, whatsappUrl } from '../data/publicContent';
import { useLanguage } from '../contexts/LanguageContext';
import { openLink } from '../utils/linking';

const W = Dimensions.get('window').width;

function DetailAction({ icon, label, color, outlined, disabled, onPress, fontFamily, isRTL }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: outlined ? 'transparent' : color, borderColor: color },
        disabled && styles.actionDisabled,
        pressed && !disabled && styles.actionPressed,
      ]}
    >
      <View style={[styles.actionInner, isRTL && styles.rowReverse]}>
        <MaterialCommunityIcons name={icon} size={17} color={outlined ? color : '#fff'} />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          style={[styles.actionText, { color: outlined ? color : '#fff', fontFamily }]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PublicCarDetailScreen({ navigation, route }) {
  const vehicleId = route.params?.vehicleId || route.params?.vehicle?.id;
  const initialVehicle = route.params?.vehicle;
  const { paperTheme, isDark } = useAppTheme();
  const c = paperTheme.colors;
  const { t, isRTL, fontFamily, textStyle, publicLocale } = useLanguage();

  const [data, setData] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      Promise.all([
        publicApiClient.get(`/vehicles/${vehicleId}?locale=${publicLocale}`),
        publicApiClient.get(`/contact?locale=${publicLocale}`).catch(() => ({ data: {} })),
        publicLocale === 'en'
          ? Promise.resolve({ data: {} })
          : publicApiClient.get('/contact?locale=en').catch(() => ({ data: {} })),
      ])
        .then(([vehicleRes, contactRes, englishContactRes]) => {
          setData(vehicleRes.data?.vehicle || vehicleRes.data || null);
          const localizedContact = selectPrimaryContact(extractContacts(contactRes.data));
          const englishContact = publicLocale === 'en'
            ? localizedContact
            : selectPrimaryContact(extractContacts(englishContactRes.data));
          setContact(mergeLocalizedContact(localizedContact, englishContact));
        })
        .catch(() => setData(initialVehicle || null))
        .finally(() => setLoading(false));
    } else if (initialVehicle) {
      Promise.all([
        publicApiClient.get(`/contact?locale=${publicLocale}`).catch(() => ({ data: {} })),
        publicLocale === 'en'
          ? Promise.resolve({ data: {} })
          : publicApiClient.get('/contact?locale=en').catch(() => ({ data: {} })),
      ])
        .then(([localizedRes, englishRes]) => {
          const localizedContact = selectPrimaryContact(extractContacts(localizedRes.data));
          const englishContact = publicLocale === 'en'
            ? localizedContact
            : selectPrimaryContact(extractContacts(englishRes.data));
          setContact(mergeLocalizedContact(localizedContact, englishContact));
        })
        .catch(() => {})
        .finally(() => { setData(initialVehicle); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [vehicleId, publicLocale]);

  const handleCall = () => {
    const url = phoneUrl(contact?.phone);
    if (url) Linking.openURL(url);
  };
  const handleWhatsApp = () => {
    const url = whatsappUrl(contact?.phone);
    if (url) Linking.openURL(url);
  };
  const handleShare = async () => {
    try {
      const v = data || {};
      const msg = `${v.manufacturer} ${v.model} (${v.year})\n${t('Price')}: ${formatCurrency(v.sellingPrice, v.sellingPriceCurrency || v.baseCurrency)}\n${t('Status')}: ${t(v.status || 'Available')}\n\n${t('Check out our showroom!')}`;
      await Share.share({ message: msg, title: t('Vehicle Details') });
    } catch (e) {}
  };

  if (loading) {
    return (
      <ScreenWrapper title="Vehicle Detail" navigation={navigation} back>
        <View style={styles.loading}>
          <MaterialCommunityIcons name="car" size={48} color={c.primary} />
          <Text style={{ marginTop: 12, color: c.onSurfaceVariant, fontFamily }}>{t('Loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const v = data || initialVehicle;

  if (!v) {
    return (
      <ScreenWrapper title="Vehicle Not Found" navigation={navigation} back>
        <View style={styles.loading}>
          <MaterialCommunityIcons name="car-off" size={48} color={c.error} />
          <Text style={{ marginTop: 12, color: c.onSurfaceVariant, fontFamily }}>{t('Vehicle not found')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const resolveImageUri = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return resolveAssetUrl(img);
    return resolveAssetUrl(img.path || img.imageUrl || img.url || img.filename);
  };
  const images = v.images?.length ? v.images : (v.mainImage ? [v.mainImage] : []);
  const socialActions = [
    contact?.facebook && { icon: 'facebook', color: '#1877f2', url: socialUrl(contact.facebook), label: 'Facebook' },
    contact?.x && { icon: 'alpha-x-box', color: '#111827', url: socialUrl(contact.x), label: 'X' },
    (contact?.tiktok || contact?.tikTok) && { icon: 'music-note', color: '#111827', url: socialUrl(contact.tiktok || contact.tikTok), label: 'TikTok' },
    contact?.instagram && { icon: 'instagram', color: '#c13584', url: socialUrl(contact.instagram), label: 'Instagram' },
    contact?.youtube && { icon: 'youtube', color: '#ef4444', url: socialUrl(contact.youtube), label: 'YouTube' },
  ].filter(Boolean);

  return (
    <ScreenWrapper title={`${v.manufacturer} ${v.model}`} navigation={navigation} back>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {images.length > 0 && (
          <View style={styles.gallery}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.galleryScroller}>
              {images.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: resolveImageUri(img) || undefined }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Hero Info */}
        <LinearGradient colors={[c.primary + '15', c.primary + '05']} style={styles.heroCard}>
        <View style={[styles.heroRow, isRTL && styles.rowReverse]}>
            <View style={[styles.heroText, isRTL && styles.alignEnd]}>
              <Text style={[styles.heroTitle, { color: c.onSurface, fontFamily, ...textStyle }]}>{v.manufacturer} {v.model}</Text>
              <Text style={[styles.heroSub, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>{v.year} • {t(v.category)} • {t(v.color)}</Text>
              <View style={[styles.statusRow, isRTL && styles.rowReverse]}>
              <StatusChip label={v.status || 'Available'} />
              <StatusChip label={v.steering || 'Left'} />
              </View>
            </View>
            <View style={[styles.priceBadge, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.priceVal, { color: c.primary }]}>{formatCurrency(v.sellingPrice, v.sellingPriceCurrency || v.baseCurrency)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Specs Grid */}
        <View style={[styles.specsGrid, isRTL && styles.rowReverse]}>
          {[
            { label: 'Engine', value: `${v.engineType || '-'} / ${v.transmission || '-'}`, icon: 'cog' },
            { label: 'Engine Number', value: v.engineNumber || '-', icon: 'identifier' },
            { label: 'Fuel', value: v.fuelType || '-', icon: 'gas-station' },
            { label: 'Mileage', value: `${v.mileage || 0} km`, icon: 'speedometer' },
            { label: 'Plate', value: v.plateNo || '-', icon: 'card-text' },
            { label: 'Chassis', value: v.chassisNumber || '-', icon: 'car-info' },
            { label: 'License', value: v.vehicleLicense || '-', icon: 'file-document' },
          ].map((spec, i) => (
            <View key={i} style={[styles.specBox, { backgroundColor: c.card }, isRTL && styles.alignEnd]}>
              <MaterialCommunityIcons name={spec.icon} size={20} color={c.primary} />
              <Text style={[styles.specVal, { color: c.onSurface, fontFamily }, textStyle]}>{spec.value}</Text>
              <Text style={[styles.specLbl, { color: c.onSurfaceVariant, fontFamily }, textStyle]}>{t(spec.label)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface, fontFamily, ...textStyle }]}>{t('general_information')}</Text>
          <Text style={[styles.description, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>
            {v.description || t('car_description')}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface, fontFamily, ...textStyle }]}>{t('features_options')}</Text>
          {[
            'Air Conditioning', 'Bluetooth Connectivity', 'Power Windows', 'Central Locking System',
            'Anti-lock Braking System (ABS)', 'Airbags', 'Parking Sensors', 'Rear Camera',
            'Alloy Wheels', 'LED Headlights', 'Electric Side Mirrors', 'Fog Lights',
          ].map(feature => (
            <View key={feature} style={[styles.featureRow, isRTL && styles.rowReverse]}>
              <MaterialCommunityIcons name="check-circle" size={17} color="#10b981" />
              <Text style={[styles.featureText, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>{t(feature)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.onSurface, fontFamily, ...textStyle }]}>{t('vehicle_location')}</Text>
          <Text style={[styles.description, { color: c.onSurfaceVariant, fontFamily, ...textStyle }]}>{t('vehicle_location_text')}</Text>
          {[contact?.branchName, contact?.address, contact?.weekdays, contact?.friday].filter(Boolean).map((value, index) => (
            <Text key={index} style={[styles.locationLine, { color: c.onSurface, fontFamily, ...textStyle }]}>{value}</Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, isRTL && styles.rowReverse]}>
          <DetailAction icon="phone" label={t('Call Now')} color={c.primary} disabled={!phoneUrl(contact?.phone)} onPress={handleCall} fontFamily={fontFamily} isRTL={isRTL} />
          <DetailAction icon="whatsapp" label={t('WhatsApp')} color="#25D366" disabled={!whatsappUrl(contact?.phone)} onPress={handleWhatsApp} fontFamily={fontFamily} isRTL={isRTL} />
          <DetailAction icon="share-variant" label={t('Share')} color={c.primary} outlined onPress={handleShare} fontFamily={fontFamily} isRTL={isRTL} />
        </View>

        {socialActions.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: c.card }]}>
            <Text style={[styles.sectionTitle, { color: c.onSurface, fontFamily }, textStyle]}>{t('Find Us On')}</Text>
            <View style={[styles.socialRow, isRTL && styles.rowReverse]}>
              {socialActions.map(action => (
                <Pressable key={action.label} onPress={() => openLink(action.url)} style={({ pressed }) => [styles.socialButton, pressed && styles.actionPressed]}>
                  <View style={[styles.socialIcon, { backgroundColor: `${action.color}16` }]}>
                    <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text numberOfLines={1} style={[styles.socialLabel, { fontFamily }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gallery: { height: 260, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  galleryScroller: { direction: 'ltr' },
  galleryImage: { width: W - 32, height: 260 },
  heroCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e8ecf0' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroText: { flex: 1 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 2 },
  priceBadge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  priceVal: { fontSize: 16, fontWeight: '900' },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specBox: { width: (W - 52) / 3, borderRadius: 14, padding: 12, alignItems: 'flex-start', gap: 4 },
  specVal: { alignSelf: 'stretch', fontSize: 12, fontWeight: '800' },
  specLbl: { fontSize: 10, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, minWidth: 0, minHeight: 46, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', paddingHorizontal: 7 },
  actionInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  actionText: { flexShrink: 1, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  actionDisabled: { opacity: 0.42 },
  actionPressed: { opacity: 0.72 },
  infoCard: { borderRadius: 16, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  description: { fontSize: 14, lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  featureText: { flex: 1, fontSize: 13 },
  locationLine: { fontSize: 13, fontWeight: '600', paddingTop: 3 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  socialButton: { width: 58, alignItems: 'center', gap: 5 },
  socialIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { alignSelf: 'stretch', color: '#6b7280', fontSize: 9, fontWeight: '700', textAlign: 'center', writingDirection: 'ltr' },
  rowReverse: { flexDirection: 'row-reverse' },
  alignEnd: { alignItems: 'flex-end' },
});
