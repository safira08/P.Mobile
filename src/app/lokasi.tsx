/**
 * =========================================================================
 * PENERAPAN WEEK 9 - LOCATION-BASED SERVICES (LBS)
 * =========================================================================
 * File: src/app/lokasi.tsx
 * Halaman Khusus Pelacakan Lokasi & Koordinat Fisik Device Pengguna (GPS).
 * =========================================================================
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Svg, { Circle as SvgCircle, Line, Rect, Text as SvgText } from 'react-native-svg';

import {
  getSavedDeviceLocation,
  performReverseGeocode,
  requestGpsPermission,
  saveDeviceLocation,
} from '../utils/lbsService';

// Import react-native-maps secara kondisional agar aman di Web dan Native
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (err) {
    console.warn('react-native-maps tidak tersedia di platform ini:', err);
  }
}

export default function LokasiScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  // -----------------------------------------------------------------------
  // STATE LOKASI & SENSOR GPS DEVICE
  // -----------------------------------------------------------------------
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(true);

  // Koordinat Device Pengguna
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  }>({
    latitude: -7.922400,
    longitude: 112.598600,
    accuracy: 5,
  });

  // Alamat hasil Reverse Geocoding
  const [currentAddress, setCurrentAddress] = useState<string>('Mendeteksi alamat perangkat...');
  const [mapLayerType, setMapLayerType] = useState<'standard' | 'hybrid'>('standard');
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // -----------------------------------------------------------------------
  // INISIALISASI & PEMBACAAN KOORDINAT GPS DEVICE PENGGUNA
  // -----------------------------------------------------------------------
  const initGpsLocation = useCallback(async () => {
    setIsLoadingGps(true);

    // 1. Coba baca koordinat device yang sebelumnya tersimpan saat login
    try {
      const saved = await getSavedDeviceLocation();
      if (saved && saved.latitude && saved.longitude) {
        setUserCoords({
          latitude: saved.latitude,
          longitude: saved.longitude,
          accuracy: saved.accuracy,
        });
        const addr = await performReverseGeocode(saved.latitude, saved.longitude);
        setCurrentAddress(addr);
      }
    } catch (e) {
      console.warn('Gagal membaca cache lokasi device:', e);
    }

    // 2. Minta izin akses lokasi foreground GPS
    const granted = await requestGpsPermission();
    setHasPermission(granted);

    if (!granted) {
      setIsLoadingGps(false);
      Alert.alert(
        'Izin Lokasi Diperlukan',
        'SIMAK memerlukan izin GPS untuk mendeteksi posisi nyata perangkat Anda.',
        [{ text: 'Mengerti' }]
      );
      return;
    }

    try {
      // 3. Membaca koordinat nyata langsung dari sensor GPS device
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, accuracy } = position.coords;
      setUserCoords({ latitude, longitude, accuracy });

      // Simpan koordinat device terkini
      await saveDeviceLocation(latitude, longitude, accuracy);

      // Terjemahkan koordinat menjadi nama lokasi / alamat asli via Reverse Geocoding
      const addr = await performReverseGeocode(latitude, longitude);
      setCurrentAddress(addr);

      // Geser peta ke posisi device
      panToCoordinates(latitude, longitude);
    } catch (error) {
      console.warn('Gagal membaca sensor GPS langsung:', error);
    } finally {
      setIsLoadingGps(false);
    }
  }, []);

  // Fungsi utilitas menggeser peta ke koordinat tertentu
  const panToCoordinates = (lat: number, lng: number, delta = 0.0035) => {
    if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        },
        600
      );
    }
  };

  // -----------------------------------------------------------------------
  // WATCH POSITION: MEMPERBARUI LOKASI OTOMATIS SAAT DEVICE BERGERAK
  // -----------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function startLocationWatch() {
      if (!hasPermission) return;

      try {
        if (locationSubscription.current) {
          locationSubscription.current.remove();
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 10000,
          },
          async (loc) => {
            if (!isMounted) return;
            const { latitude, longitude, accuracy } = loc.coords;
            setUserCoords({ latitude, longitude, accuracy });
            const addr = await performReverseGeocode(latitude, longitude);
            if (isMounted) {
              setCurrentAddress(addr);
            }
          }
        );
      } catch (err) {
        console.warn('Gagal mengaktifkan watchPosition:', err);
      }
    }

    startLocationWatch();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [hasPermission]);

  useEffect(() => {
    initGpsLocation();
  }, [initGpsLocation]);

  // -----------------------------------------------------------------------
  // RENDER PETA INTERAKTIF DEVICE PENGGUNA
  // -----------------------------------------------------------------------
  const renderInteractiveMap = () => {
    // Platform Android / iOS Native
    if (Platform.OS !== 'web' && MapView) {
      return (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.mapView}
            mapType={mapLayerType}
            initialRegion={{
              latitude: userCoords.latitude,
              longitude: userCoords.longitude,
              latitudeDelta: 0.0035,
              longitudeDelta: 0.0035,
            }}
            showsUserLocation={false}
            showsCompass={true}
            showsTraffic={false}
          >
            {/* MARKER LOKASI DEVICE PENGGUNA */}
            <Marker
              coordinate={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
              }}
              title="Posisi Device Anda"
              description={currentAddress}
              pinColor="#2563EB"
            />
          </MapView>

          {/* Badge Label Lokasi Device */}
          <View style={styles.mapTopFloatingBadge}>
            <Text style={styles.mapTopBadgeText}>📍 Lokasi Device Anda (GPS Real-Time)</Text>
          </View>

          {/* Toggle Layer: Standar vs Satelit */}
          <View style={styles.layerSwitchFloatingWrap}>
            <Pressable
              style={[
                styles.layerBtn,
                mapLayerType === 'standard' && styles.layerBtnActive,
              ]}
              onPress={() => setMapLayerType('standard')}
            >
              <Text
                style={[
                  styles.layerBtnText,
                  mapLayerType === 'standard' && styles.layerBtnTextActive,
                ]}
              >
                Peta
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.layerBtn,
                mapLayerType === 'hybrid' && styles.layerBtnActive,
              ]}
              onPress={() => setMapLayerType('hybrid')}
            >
              <Text
                style={[
                  styles.layerBtnText,
                  mapLayerType === 'hybrid' && styles.layerBtnTextActive,
                ]}
              >
                Satelit
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Platform Web Browser (Google Maps Embed Zoom Presisi z=17)
    return (
      <View style={styles.webMapContainer}>
        {Platform.OS === 'web' ? (
          // @ts-ignore
          <iframe
            key={`${userCoords.latitude.toFixed(5)}-${userCoords.longitude.toFixed(5)}`}
            title="Peta Lokasi Device Saya"
            src={`https://maps.google.com/maps?q=${userCoords.latitude},${userCoords.longitude}&z=17&output=embed`}
            style={{
              width: '100%',
              height: 320,
              border: 'none',
              borderRadius: 16,
            }}
          />
        ) : (
          <Svg width="100%" height={260} viewBox="0 0 360 260">
            <Rect width="360" height="260" fill="#E2E8F0" rx={16} />
            <Line x1="0" y1="130" x2="360" y2="130" stroke="#CBD5E1" strokeWidth="18" />
            <Line x1="180" y1="0" x2="180" y2="260" stroke="#CBD5E1" strokeWidth="18" />
            <SvgCircle cx="180" cy="130" r="16" fill="#2563EB" />
            <SvgText x="180" y="165" textAnchor="middle" fill="#1D4ED8" fontSize="12" fontWeight="bold">
              Titik Koordinat Device
            </SvgText>
          </Svg>
        )}

        <View style={styles.mapTopFloatingBadge}>
          <Text style={styles.mapTopBadgeText}>📍 Peta Live Lokasi Device (Google Maps)</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER NAVIGASI */}
      <View style={styles.headerBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerMainTitle}>Lokasi Device Saya</Text>
          <Text style={styles.headerSubTitle}>Pelacakan GPS & Titik Koordinat Real-Time</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CONTAINER PETA LOKASI DEVICE */}
        {renderInteractiveMap()}

        {/* ========================================================================= */}
        {/* KARTU INFORMASI LOKASI & KOORDINAT DEVICE PENGGUNA                       */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSectionTag}>SISTEM LAYANAN BERBASIS LOKASI (GPS)</Text>
              <Text style={styles.cardMainTitle}>Posisi Perangkat Anda</Text>
            </View>
            <View style={styles.geofenceBadge}>
              <Text style={styles.geofenceBadgeText}>
                {isLoadingGps ? 'Mendeteksi...' : 'GPS Aktif ✓'}
              </Text>
            </View>
          </View>

          {/* KOORDINAT LATITUDE, LONGITUDE, & AKURASI */}
          <View style={styles.coordRow}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Latitude Device</Text>
              <Text style={styles.coordValue}>{userCoords.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Longitude Device</Text>
              <Text style={styles.coordValue}>{userCoords.longitude.toFixed(6)}</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Akurasi GPS</Text>
              <Text style={styles.coordValue}>
                ±{userCoords.accuracy ? Math.round(userCoords.accuracy) : 5} m
              </Text>
            </View>
          </View>

          {/* REVERSE GEOCODING (ALAMAT ASLI TEMPAT PENGGUNA BERADA) */}
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>📍 Alamat (Reverse Geocoding):</Text>
            <Text style={styles.addressText}>{currentAddress}</Text>
          </View>

          {/* TOMBOL AKSI: SEGARKAN LOKASI GPS & BUKA GOOGLE MAPS */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={styles.refreshBtn}
              onPress={initGpsLocation}
              accessibilityRole="button"
              accessibilityLabel="Segarkan Lokasi GPS"
            >
              {isLoadingGps ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.refreshBtnText}>🔄 Segarkan Posisi GPS</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.openGoogleMapsBtn}
              onPress={() =>
                Linking.openURL(
                  `https://maps.google.com/?q=${userCoords.latitude},${userCoords.longitude}`
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Buka di Google Maps Asli"
            >
              <Text style={styles.openGoogleMapsBtnText}>
                🗺️ Buka di Google Maps Asli ↗
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------------------
// STYLING HALAMAN LOKASI DEVICE SAYA
// -------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2850',
  },
  headerTitles: {
    flex: 1,
  },
  headerMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2850',
  },
  headerSubTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 320,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  webMapContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mapTopFloatingBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapTopBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  layerSwitchFloatingWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  layerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerBtnActive: {
    backgroundColor: '#2563EB',
  },
  layerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  layerBtnTextActive: {
    color: '#FFFFFF',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardSectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  cardMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  geofenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  geofenceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  coordRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  coordBox: {
    flex: 1,
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  addressBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 3,
  },
  addressText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionButtonsRow: {
    marginTop: 14,
    gap: 8,
  },
  refreshBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '800',
  },
  openGoogleMapsBtn: {
    backgroundColor: '#0F2850',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  openGoogleMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
