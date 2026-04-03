import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, FlatList, Image,
  Dimensions, Pressable, RefreshControl, StatusBar, TextInput,
  TouchableOpacity, Platform, Modal, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import publicApiClient from '../api/publicClient';
import { resolveAssetUrl } from '../api/config';
import { formatCurrency } from '../utils/constants';
import { openLink } from '../utils/linking';

const { width: W } = Dimensions.get('window');
const ACCENT = '#c8963e';
const PRIMARY = '#1b4965';
const DARK = '#0d1b2a';

const CATEGORY_TABS = [
  { key: 'all', label: 'All Cars', icon: 'car-multiple' },
  { key: 'container', label: 'Container', icon: 'package-variant-closed' },
  { key: 'licensed', label: 'Licensed', icon: 'card-account-details' },
];

const WHY_CHOOSE = [
  { icon: 'shield-check', title: 'Verified Cars', desc: 'All vehicles inspected & certified', color: '#3b82f6' },
  { icon: 'tag-outline', title: 'Best Prices', desc: 'Competitive market rates guaranteed', color: '#10b981' },
  { icon: 'headset', title: '24/7 Support', desc: 'Expert team always here for you', color: '#f59e0b' },
  { icon: 'file-document-outline', title: 'Easy Docs', desc: 'Full documentation & transfer help', color: '#8b5cf6' },
];

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [homeData, setHomeData] = useState({ cars: { all: [], container: [], licensed: [] }, carousel: [], testimonials: [], chooseVideo: null });
  const [about, setAbout] = useState(null);
  const [contact, setContact] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const vehiclesIndexRef = useRef(null);
  const debounceRef = useRef(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const carouselRef = useRef(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setError(false);
    try {
      const [homeRes, aboutRes, contactRes] = await Promise.all([
        publicApiClient.get('/home-cars?locale=en').catch(() => ({ data: {} })),
        publicApiClient.get('/about?locale=en').catch(() => ({ data: {} })),
        publicApiClient.get('/contact?locale=en').catch(() => ({ data: {} })),
      ]);
      setHomeData(homeRes.data || {});
      setAbout(homeRes.data?.about != null ? homeRes.data.about : (aboutRes.data?.about || null));
      const cl = contactRes.data?.contacts || contactRes.data || [];
      setContact(Array.isArray(cl) ? cl[0] : cl);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const carousel = homeData.carousel || [];
  const carsByTab = {
    all: homeData.cars?.all || [],
    container: homeData.cars?.container || [],
    licensed: homeData.cars?.licensed || [],
  };
  const activeCars = carsByTab[activeTab];
  const testimonials = homeData.testimonials || [];
  const chooseVideo = homeData.chooseVideo;
  const videoUri = chooseVideo?.videoPath ? resolveAssetUrl(chooseVideo.videoPath) : null;
  const totalCars = (carsByTab.all.length) + (carsByTab.container.length) + (carsByTab.licensed.length);

  // Video player — muted loop for inline preview; unmuted when modal opens
  const videoPlayer = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.muted = true;
    if (videoUri) player.play();
  });

  useEffect(() => {
    if (!videoPlayer || !videoUri) return;
    if (videoVisible) {
      videoPlayer.muted = false;
    } else {
      videoPlayer.muted = true;
      videoPlayer.play();
    }
  }, [videoVisible, videoUri]);

  useEffect(() => {
    if (carousel.length < 2) return;
    timerRef.current = setInterval(() => {
      setCarouselIndex(i => {
        const next = (i + 1) % carousel.length;
        carouselRef.current?.scrollTo({ x: next * W, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [carousel.length]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleSearch = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    navigation.navigate('Cars', { initialSearch: searchQuery.trim() });
  };

  const onChangeSearch = (text) => {
    setSearchQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = String(text || '').trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // Load vehicles index once (public endpoint)
        if (!vehiclesIndexRef.current) {
          setLoadingSuggestions(true);
          const res = await publicApiClient.get('/vehicles').catch(() => ({ data: { vehicles: [] } }));
          vehiclesIndexRef.current = res.data?.vehicles || res.data || [];
          setLoadingSuggestions(false);
        }
        const list = (vehiclesIndexRef.current || []).filter(v => {
          const s = q.toLowerCase();
          return [v.vehicleId, v.manufacturer, v.model, v.year, v.color]
            .filter(Boolean)
            .some(f => String(f).toLowerCase().includes(s));
        }).slice(0, 6);
        setSuggestions(list);
      } catch (err) {
        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.loadingView}>
        <StatusBar barStyle="light-content" />
        <MaterialCommunityIcons name="car-sports" size={64} color={ACCENT} />
        <Text style={styles.loadingText}>Loading Showroom...</Text>
        <ActivityIndicator color={ACCENT} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorView}>
        <StatusBar barStyle="light-content" />
        <MaterialCommunityIcons name="wifi-off" size={64} color={ACCENT} />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorSub}>Could not connect to the server.{'\n'}Please check your internet connection.</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchData(); }} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
        stickyHeaderIndices={[0]}
      >
        {/* TOP BAR (modern standard) */}
        <SafeAreaView style={styles.topBarStandard}>
          

          <View style={styles.headerRight}>
            <View style={styles.headerCenter} >
            <MaterialCommunityIcons name="car-sports" size={22} color={ACCENT} />
            <Text style={styles.brandNameStandard}>Niazi Khpalwak</Text>
          </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.adminIconBtn} accessibilityLabel="Admin">
              <View style={styles.adminAvatarAlt}>
                <MaterialCommunityIcons name="account" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* HERO CAROUSEL */}
        {carousel.length > 0 ? (
          <View style={styles.heroCarousel}>
            <ScrollView
              ref={carouselRef}
              horizontal pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={e => setCarouselIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
            >
              {carousel.map((item, idx) => (
                <View key={item.id || idx} style={styles.carouselSlide}>
                  <Image
                    source={{ uri: resolveAssetUrl(item.image) || undefined }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                    defaultSource={require('../../assets/placeholder.png')}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                    style={styles.carouselOverlay}
                  >
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>PREMIUM</Text>
                    </View>
                    <Text style={styles.carouselTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.carouselModel}>{item.model}</Text>
                    <View style={styles.carouselPriceRow}>
                      <MaterialCommunityIcons name="tag" size={14} color={ACCENT} />
                      <Text style={styles.carouselPrice}>{formatCurrency(item.price)} AFN</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
            <View style={styles.dotRow}>
              {carousel.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => { setCarouselIndex(i); carouselRef.current?.scrollTo({ x: i * W, animated: true }); }}
                  style={[styles.dot, i === carouselIndex && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        ) : (
          <LinearGradient colors={[DARK, PRIMARY + 'dd']} style={styles.heroBanner}>
            <MaterialCommunityIcons name="car-sports" size={72} color={ACCENT} />
            <Text style={styles.heroBannerTitle}>Niazi Khpalwak</Text>
            <Text style={styles.heroBannerSub}>Premium Car Showroom & Dealership</Text>
          </LinearGradient>
        )}

        {/* SEARCH BAR */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search brand, model, year..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={onChangeSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              onBlur={() => { setTimeout(() => setShowSuggestions(false), 120); }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} activeOpacity={0.85}>
            <LinearGradient colors={[ACCENT, '#a07430']} style={styles.searchBtnInner}>
              <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AUTOCOMPLETE SUGGESTIONS */}
        {showSuggestions && (
          <View style={styles.suggestionsWrap}>
            {loadingSuggestions ? (
              <View style={styles.suggestionLoading}><ActivityIndicator color={ACCENT} /></View>
            ) : suggestions.length === 0 ? (
              <View style={styles.suggestionEmpty}><Text style={{ color: '#777' }}>No matches</Text></View>
            ) : (
              suggestions.map(item => {
                const img = resolveAssetUrl(item.mainImage || item.images?.[0]);
                return (
                  <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => { setShowSuggestions(false); setSuggestions([]); navigation.navigate('CarDetail', { vehicleId: item.id }); }}>
                    {img ? <Image source={{ uri: img }} style={styles.suggestionImage} /> : (
                      <View style={[styles.suggestionImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialCommunityIcons name="car" size={20} color="#bbb" />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.suggestionTitle}>{item.manufacturer} {item.model}</Text>
                      <Text style={styles.suggestionMeta}>{item.vehicleId} • {item.year}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* STATS BAR */}
        <LinearGradient colors={[PRIMARY, DARK]} style={styles.statsBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {[
            { value: totalCars > 0 ? `${totalCars}+` : '10+', label: 'In Stock', icon: 'car-key' },
            { value: '500+', label: 'Cars Sold', icon: 'handshake' },
            { value: '1000+', label: 'Happy Clients', icon: 'emoticon-happy-outline' },
            { value: '10+', label: 'Yrs Experience', icon: 'star-circle' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <MaterialCommunityIcons name={s.icon} size={20} color={ACCENT} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* VEHICLES BY CATEGORY */}
        <View style={styles.section}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Our Vehicles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cars')}>
              <Text style={styles.viewAllLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabBar}>
            {CATEGORY_TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialCommunityIcons name={tab.icon} size={14} color={activeTab === tab.key ? '#fff' : '#555'} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                {carsByTab[tab.key].length > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab.key && { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab.key && { color: '#fff' }]}>
                      {carsByTab[tab.key].length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {activeCars.length === 0 ? (
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="car-off" size={44} color="#ccc" />
              <Text style={styles.emptyText}>No vehicles in this category</Text>
            </View>
          ) : (
            <FlatList
              data={activeCars.slice(0, 8)}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14 }}
              renderItem={({ item }) => {
                const imgUri = resolveAssetUrl(item.mainImage || item.images?.[0]);
                return (
                  <TouchableOpacity
                    style={styles.carCard}
                    onPress={() => navigation.navigate('CarDetail', { vehicleId: item.id })}
                    activeOpacity={0.88}
                  >
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.carCardImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.carCardImage, styles.carCardImagePlaceholder]}>
                        <MaterialCommunityIcons name="car-side" size={36} color="#ddd" />
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={styles.carCardOverlay}
                    >
                      <View style={styles.carStatusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: item.status === 'Available' ? '#22c55e' : '#f59e0b' }]} />
                        <Text style={styles.carStatusText}>{item.status}</Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.carCardBody}>
                      <Text style={styles.carCardTitle} numberOfLines={1}>{item.manufacturer} {item.model}</Text>
                      <View style={styles.carCardMeta}>
                        <MaterialCommunityIcons name="calendar" size={11} color="#888" />
                        <Text style={styles.carCardMetaText}>{item.year}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <MaterialCommunityIcons name="speedometer" size={11} color="#888" />
                        <Text style={styles.carCardMetaText}>{item.transmission || 'Auto'}</Text>
                      </View>
                      <View style={styles.carCardMeta}>
                        <MaterialCommunityIcons name="gas-station" size={11} color="#888" />
                        <Text style={styles.carCardMetaText}>{item.fuelType || 'Petrol'}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <MaterialCommunityIcons name="palette" size={11} color="#888" />
                        <Text style={styles.carCardMetaText}>{item.color || ''}</Text>
                      </View>
                      <Text style={styles.carCardPrice}>{formatCurrency(item.sellingPrice)} AFN</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {activeCars.length > 6 && (
            <TouchableOpacity onPress={() => navigation.navigate('Cars')} style={styles.viewAllBtn}>
              <Text style={styles.viewAllBtnText}>See All {activeCars.length} Vehicles</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={PRIMARY} />
            </TouchableOpacity>
          )}
        </View>

        {/* VIDEO SECTION */}
        {chooseVideo && chooseVideo.videoPath && (
          <LinearGradient colors={[DARK, PRIMARY + 'cc']} style={styles.videoSection}>
            <Text style={styles.videoTitle}>See Our Showroom</Text>
            <Text style={styles.videoSub}>Take a virtual tour of our premium fleet</Text>
            <TouchableOpacity onPress={() => setVideoVisible(true)} activeOpacity={0.88} style={styles.videoPlayWrap}>
              <VideoView
                player={videoPlayer}
                style={styles.videoThumbPlayer}
                contentFit="cover"
              />
              <View style={styles.videoPlayOverlay}>
                <View style={styles.videoPlayCircle}>
                  <MaterialCommunityIcons name="play" size={28} color="#fff" />
                </View>
                <Text style={styles.videoPlayLabel}>Tap to Watch</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* WHY CHOOSE US */}
        <View style={styles.section}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Why Choose Us</Text>
          </View>
          <View style={styles.whyGrid}>
            {WHY_CHOOSE.map((item, idx) => (
              <View key={idx} style={styles.whyCard}>
                <View style={[styles.whyIconWrap, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SERVICES */}
        <LinearGradient colors={[DARK, PRIMARY]} style={styles.servicesSection}>
          <Text style={[styles.secTitle, { color: '#fff', marginBottom: 18 }]}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {[
              { icon: 'magnify', label: 'Inspection', color: '#60a5fa' },
              { icon: 'file-certificate', label: 'Documentation', color: '#34d399' },
              { icon: 'swap-horizontal-bold', label: 'Exchange', color: '#fbbf24' },
              { icon: 'truck-delivery', label: 'Delivery', color: '#a78bfa' },
              { icon: 'currency-usd', label: 'Finance', color: '#f87171' },
              { icon: 'wrench', label: 'After-Sale', color: '#fb923c' },
            ].map((s, i) => (
              <View key={i} style={styles.serviceCard}>
                <View style={[styles.serviceIconWrap, { backgroundColor: s.color + '22' }]}>
                  <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ABOUT SNIPPET */}
        {about && (
          <View style={[styles.section, { backgroundColor: '#fff' }]}>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>About Us</Text>
            </View>
            <View style={styles.aboutCard}>
              <View style={styles.aboutIconRow}>
                <View style={styles.aboutIconWrap}>
                  <MaterialCommunityIcons name="car-sports" size={28} color={ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aboutName}>{about.name || 'Niazi Khpalwak'}</Text>
                  <Text style={{ fontSize: 12, color: '#888' }}>Car Showroom & Dealership</Text>
                </View>
              </View>
              <Text style={styles.aboutDesc} numberOfLines={4}>
                {about.description || 'Your trusted car showroom in Afghanistan, offering premium vehicles at competitive prices.'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.aboutReadMore}>
                <Text style={styles.aboutReadMoreText}>Read More</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TESTIMONIALS */}
        {testimonials.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#f8f9fb' }]}>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Client Reviews</Text>
            </View>
            <FlatList
              data={testimonials}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14 }}
              renderItem={({ item }) => (
                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialStars}>
                    {Array.from({ length: Math.min(5, Math.max(1, Number(item.rating) || 5)) }).map((_, ri) => (
                      <MaterialCommunityIcons key={ri} name="star" size={14} color={ACCENT} />
                    ))}
                    {Array.from({ length: 5 - Math.min(5, Math.max(1, Number(item.rating) || 5)) }).map((_, ri) => (
                      <MaterialCommunityIcons key={`e${ri}`} name="star-outline" size={14} color="#ddd" />
                    ))}
                  </View>
                  {item.title ? <Text style={styles.testimonialTitle} numberOfLines={1}>{item.title}</Text> : null}
                  <Text style={styles.testimonialMsg} numberOfLines={5}>{item.message}</Text>
                  <View style={styles.testimonialAuthor}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialAvatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.testimonialName}>{item.name}</Text>
                      <Text style={styles.testimonialYear}>{item.year}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* CONTACT CTA */}
        <LinearGradient colors={[PRIMARY, DARK]} style={styles.contactSection}>
          <MaterialCommunityIcons name="phone-in-talk" size={36} color={ACCENT} />
          <Text style={styles.contactTitle}>Ready to Find Your Car?</Text>
          <Text style={styles.contactSub}>Contact our experts for the best deal</Text>
          <View style={styles.contactBtns}>
            {contact?.phone ? (
              <>
                <TouchableOpacity
              onChangeText={onChangeSearch}
                  onPress={() => openLink(`tel:${contact.phone}`)}
                >
                  <MaterialCommunityIcons name="phone" size={18} color="#fff" />
                  <Text style={styles.contactBtnText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => openLink(`https://wa.me/${String(contact.phone).replace(/[^0-9]/g, '')}`)}
                >
                  <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
                  <Text style={styles.contactBtnText}>WhatsApp</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: ACCENT }]}
                onPress={() => navigation.navigate('Contact')}
              >
                <MaterialCommunityIcons name="map-marker" size={18} color="#fff" />
                <Text style={styles.contactBtnText}>Find Us</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* VIDEO MODAL */}
      <Modal visible={videoVisible} animationType="slide" onRequestClose={() => { setVideoVisible(false); }}>
        <View style={styles.videoModal}>
          <TouchableOpacity onPress={() => setVideoVisible(false)} style={styles.videoModalClose}>
            <MaterialCommunityIcons name="close-circle" size={34} color="#fff" />
          </TouchableOpacity>
          {videoUri ? (
            <VideoView
              player={videoPlayer}
              style={styles.videoPlayer}
              contentFit="contain"
              nativeControls
              allowsFullscreen
              allowsPictureInPicture
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK },
  loadingText: { color: '#fff', marginTop: 16, fontSize: 16, fontWeight: '700' },
  errorView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK, padding: 24 },
  errorTitle: { color: '#fff', marginTop: 16, fontSize: 20, fontWeight: '800' },
  errorSub: { color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  retryBtn: { marginTop: 28, backgroundColor: ACCENT, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 28 },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  topBar: { paddingTop: Platform.OS === 'ios' ? 52 : 36, paddingBottom: 12, paddingHorizontal: 16 },
  topBarStandard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: PRIMARY, paddingTop: 0, paddingBottom: 12, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 10 },
  brandNameStandard: { color: '#fff', fontSize: 18, fontWeight: '900', marginLeft: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', minWidth: 80 },
  profileBtn: { marginLeft: 8 },
  adminButton: { marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 },
  adminButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  /* avatar-style admin button (standard placement) */
  adminIconBtn: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  adminAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  adminAvatarAlt: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  iconBtnNeutral: { padding: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)' },
  profileBtnNeutral: { marginLeft: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  profileAvatarStandard: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  topBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(200,150,62,0.18)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ACCENT + '50' },
  brandName: { color: ACCENT, fontSize: 16, fontWeight: '900' },
  brandSub: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  adminBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroCarousel: { width: W, height: 260, position: 'relative' },
  carouselSlide: { width: W, height: 260, overflow: 'hidden' },
  carouselImage: { width: W, height: 260 },
  carouselOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 18 },
  carouselBadge: { alignSelf: 'flex-start', backgroundColor: ACCENT, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
  carouselBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  carouselTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  carouselModel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  carouselPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  carouselPrice: { color: ACCENT, fontSize: 16, fontWeight: '800' },
  dotRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: ACCENT, width: 24, borderRadius: 4 },
  heroBanner: { height: 220, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  heroBannerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 12, letterSpacing: -0.5 },
  heroBannerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6 },
  searchWrap: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 46, borderWidth: 1.5, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 14, color: '#222', height: 46 },
  searchBtn: { width: 46, height: 46, borderRadius: 12, overflow: 'hidden' },
  searchBtnInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsBar: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  section: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f5f7fb' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontSize: 18, fontWeight: '800', color: '#1a202c', letterSpacing: -0.3 },
  viewAllLink: { color: PRIMARY, fontSize: 13, fontWeight: '700' },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e8ecf0' },
  tabActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  tabText: { fontSize: 10, fontWeight: '700', color: '#555' },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: '#e8ecf0', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText: { fontSize: 9, fontWeight: '700', color: '#666' },
  carCard: { width: 172, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  carCardImage: { width: '100%', height: 118 },
  carCardImagePlaceholder: { backgroundColor: '#e8ecf0', justifyContent: 'center', alignItems: 'center' },
  carCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 118, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 8 },
  carStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  carStatusText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  carCardBody: { padding: 11 },
  carCardTitle: { fontSize: 13, fontWeight: '800', color: '#1a202c' },
  carCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  carCardMetaText: { fontSize: 10, color: '#888' },
  metaDot: { color: '#ccc', fontSize: 10 },
  carCardPrice: { fontSize: 14, fontWeight: '900', color: PRIMARY, marginTop: 7 },
  emptySection: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { color: '#aaa', fontSize: 14 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: PRIMARY },
  viewAllBtnText: { color: PRIMARY, fontWeight: '700', fontSize: 14 },
  videoSection: { paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  videoTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  videoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, marginBottom: 18 },
  videoPlayWrap: { width: W - 40, height: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  videoThumbPlayer: { width: '100%', height: '100%' },
  videoPlayOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  videoPlayCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  videoPlayLabel: { color: '#fff', fontWeight: '700', fontSize: 13, marginTop: 8, letterSpacing: 0.5 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  whyCard: { width: (W - 44) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  whyIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  whyTitle: { fontSize: 13, fontWeight: '800', color: '#1a202c', marginBottom: 4 },
  whyDesc: { fontSize: 11, color: '#888', lineHeight: 16 },
  servicesSection: { paddingVertical: 24, paddingHorizontal: 16 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: { width: (W - 52) / 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  serviceIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  serviceLabel: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  aboutCard: { backgroundColor: '#f8f9ff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8ecf0' },
  aboutIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aboutIconWrap: { width: 50, height: 50, borderRadius: 14, backgroundColor: ACCENT + '18', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ACCENT + '30' },
  aboutName: { fontSize: 15, fontWeight: '800', color: '#1a202c' },
  aboutDesc: { fontSize: 13, color: '#555', lineHeight: 21, marginBottom: 12 },
  aboutReadMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aboutReadMoreText: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  testimonialCard: { width: W * 0.76, backgroundColor: '#fff', borderRadius: 18, padding: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
  testimonialStars: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  testimonialTitle: { fontSize: 14, fontWeight: '800', color: '#1a202c', marginBottom: 6 },
  testimonialMsg: { fontSize: 12, color: '#666', lineHeight: 19, fontStyle: 'italic' },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  testimonialAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY + '18', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: PRIMARY + '30' },
  testimonialAvatarText: { color: PRIMARY, fontWeight: '800', fontSize: 15 },
  testimonialName: { fontWeight: '700', fontSize: 13, color: '#222' },
  testimonialYear: { fontSize: 11, color: '#888' },
  contactSection: { paddingVertical: 36, paddingHorizontal: 20, alignItems: 'center' },
  contactTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 },
  contactSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, marginBottom: 20 },
  contactBtns: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 24 },
  contactBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  videoModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  videoModalClose: { position: 'absolute', top: Platform.OS === 'ios' ? 52 : 28, right: 20, zIndex: 10 },
  videoPlayer: { width: W, aspectRatio: 16 / 9 },
  suggestionsWrap: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4, zIndex: 50 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, gap: 10 },
  suggestionImage: { width: 56, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6' },
  suggestionImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  suggestionTitle: { fontSize: 13, fontWeight: '800', color: '#1a202c' },
  suggestionMeta: { fontSize: 11, color: '#777', marginTop: 2 },
  suggestionEmpty: { padding: 12, alignItems: 'center' },
});
