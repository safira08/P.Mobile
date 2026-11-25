/**
 * =========================================================================
 * PENERAPAN WEEK 9 - LOCATION-BASED SERVICES (LBS) & GEOFENCING
 * =========================================================================
 * File: src/app/lokasi.tsx
 * Halaman Demonstrasi & Operasional Fitur Berbasis Lokasi di Aplikasi SIMAK.
 * 
 * DAFTAR 7 FITUR PENERAPAN WEEK 9:
 * 1. Mengakses GPS (Request foreground permission via expo-location)
 * 2. Membaca Koordinat (Latitude, Longitude, Akurasi secara real-time)
 * 3. Menampilkan Peta (Render peta interaktif kampus dengan visualisasi area)
 * 4. Menampilkan Marker (Pin lokasi mahasiswa & 5 marker spot materi akademik)
 * 5. Melakukan Reverse Geocoding (Menerjemahkan koordinat GPS menjadi nama jalan & kota)
 * 6. Menguji Geofencing (Radius 150m Gedung Informatika & Pemicu Notifikasi Lonceng)
 * 7. Menjelaskan Optimasi Baterai (Switch Mode Hemat Daya vs Akurasi Tinggi)
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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Svg, { Circle as SvgCircle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import {
  BATTERY_PRESETS,
  BatteryMode,
  CAMPUS_MATERIAL_SPOTS,
  evaluateGeofenceAndSpots,
  GEOFENCE_INFORMATIKA,
  getSavedDeviceLocation,
  MaterialSpot,
  performReverseGeocode,
  requestGpsPermission,
  saveDeviceLocation,
  triggerGeofenceNotification,
} from '../utils/lbsService';

// Import react-native-maps secara kondisional agar aman di lingkungan Web dan Native
let MapView: any = null;
let Marker: any = null;
let MapCircle: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    MapCircle = Maps.Circle;
  } catch (err) {
    console.warn('react-native-maps tidak tersedia di platform ini:', err);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LokasiScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  // -----------------------------------------------------------------------
  // STATE LOKASI & SENSOR GPS
  // -----------------------------------------------------------------------
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simulationName, setSimulationName] = useState<string>('');

  // Koordinat Pengguna (Awalnya diset di sekitar Gedung Informatika)
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  }>({
    latitude: GEOFENCE_INFORMATIKA.latitude,
    longitude: GEOFENCE_INFORMATIKA.longitude,
    accuracy: 5,
  });

  // Alamat hasil Reverse Geocoding
  const [currentAddress, setCurrentAddress] = useState<string>(
    GEOFENCE_INFORMATIKA.addressDefault
  );

  // Status Geofence & Rekomendasi Titik Materi Terdekat
  const [geofenceEval, setGeofenceEval] = useState(() =>
    evaluateGeofenceAndSpots(GEOFENCE_INFORMATIKA.latitude, GEOFENCE_INFORMATIKA.longitude)
  );

  // PENERAPAN WEEK 9 - FITUR 7: Pengaturan Mode Baterai (Hemat Daya vs Akurasi Tinggi)
  const [batteryMode, setBatteryMode] = useState<BatteryMode>('balanced');
  const [mapLayerType, setMapLayerType] = useState<'standard' | 'hybrid'>('standard');
  const [customInputLocation, setCustomInputLocation] = useState<string>('');
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // -----------------------------------------------------------------------
  // PENERAPAN WEEK 9 - FITUR 1: MENGAKSES GPS (PERMISSION CHECK & REQUEST)
  // Menyesuaikan posisi nyata device pengguna saat login / membuka layar
  // -----------------------------------------------------------------------
  const initGpsLocation = useCallback(async () => {
    setIsLoadingGps(true);

    // 1. Coba baca koordinat device yang tersimpan saat login
    try {
      const saved = await getSavedDeviceLocation();
      if (saved && saved.latitude && saved.longitude) {
        setUserCoords({
          latitude: saved.latitude,
          longitude: saved.longitude,
          accuracy: saved.accuracy,
        });
        updateLocationState(saved.latitude, saved.longitude);
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
        'SIMAK memerlukan izin GPS untuk mendeteksi posisi nyata device Anda dan menghitung jarak ke kampus UMM.',
        [{ text: 'Mengerti' }]
      );
      return;
    }

    try {
      // 3. PENERAPAN WEEK 9 - FITUR 2: MEMBACA KOORDINAT DARI SENSOR GPS DEVICE
      const config = BATTERY_PRESETS[batteryMode];
      const position = await Location.getCurrentPositionAsync({
        accuracy: config.accuracy,
      });

      const { latitude, longitude, accuracy } = position.coords;
      setUserCoords({ latitude, longitude, accuracy });
      setIsSimulated(false);
      setSimulationName('');

      // Simpan koordinat device pengguna
      await saveDeviceLocation(latitude, longitude, accuracy);

      // Evaluasi Geofence & 5 Titik Materi
      updateLocationState(latitude, longitude);
    } catch (error) {
      console.warn('Gagal membaca sensor GPS langsung, menggunakan koordinat terakhir:', error);
    } finally {
      setIsLoadingGps(false);
    }
  }, [batteryMode]);

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
  // PROSES EVALUASI GEOFENCE, JARAK HAVERSINE, & REVERSE GEOCODING
  // -----------------------------------------------------------------------
  const updateLocationState = async (lat: number, lng: number) => {
    // PENERAPAN WEEK 9 - FITUR 6: Hitung Status Geofence & Jarak Titik Terdekat
    const evaluation = evaluateGeofenceAndSpots(lat, lng);
    setGeofenceEval(evaluation);

    // PENERAPAN WEEK 9 - FITUR 6: Pemicu Notifikasi Lonceng saat Masuk Geofence
    if (evaluation.isInside) {
      await triggerGeofenceNotification();
    }

    // PENERAPAN WEEK 9 - FITUR 5: Lakukan Reverse Geocoding untuk Mendapatkan Alamat Asli
    const addr = await performReverseGeocode(lat, lng);
    setCurrentAddress(addr);

    // Animasi Peta ke titik baru jika MapView tersedia
    if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0035,
          longitudeDelta: 0.0035,
        },
        600
      );
    }
  };

  // -----------------------------------------------------------------------
  // PENERAPAN WEEK 9 - FITUR 7: OPTIMASI BATERAI (WATCH POSITION SECARA EFISIEN)
  // Menggunakan distanceInterval dan timeInterval sesuai pilihan mode baterai
  // -----------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function startLocationWatch() {
      if (!hasPermission || isSimulated) return;

      const config = BATTERY_PRESETS[batteryMode];

      try {
        if (locationSubscription.current) {
          locationSubscription.current.remove();
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: config.accuracy,
            distanceInterval: config.distanceInterval,
            timeInterval: config.timeInterval,
          },
          (loc) => {
            if (!isMounted || isSimulated) return;
            const { latitude, longitude, accuracy } = loc.coords;
            setUserCoords({ latitude, longitude, accuracy });
            updateLocationState(latitude, longitude);
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
  }, [hasPermission, batteryMode, isSimulated]);

  useEffect(() => {
    initGpsLocation();
  }, [initGpsLocation]);

  // -----------------------------------------------------------------------
  // SIMULATOR UNTUK PENGUJIAN SAAT DEMO DI DEPAN DOSEN
  // -----------------------------------------------------------------------
  const handleSimulatePosition = (type: 'gkb_3_lab' | 'gkb_3_kelas' | 'gkb_2_kelas' | 'gkb_1_kelas' | 'gkb_4_kelas' | 'outside' | 'reset') => {
    if (type === 'reset') {
      initGpsLocation();
      return;
    }

    setIsSimulated(true);

    let targetLat = GEOFENCE_INFORMATIKA.latitude;
    let targetLng = GEOFENCE_INFORMATIKA.longitude;
    let label = '';

    if (type === 'gkb_3_lab') {
      const spot = CAMPUS_MATERIAL_SPOTS[0];
      targetLat = spot.latitude;
      targetLng = spot.longitude;
      label = `${spot.name} (${spot.floor}, ${spot.room})`;
    } else if (type === 'gkb_3_kelas') {
      const spot = CAMPUS_MATERIAL_SPOTS[1];
      targetLat = spot.latitude;
      targetLng = spot.longitude;
      label = `${spot.name} (${spot.floor}, ${spot.room})`;
    } else if (type === 'gkb_2_kelas') {
      const spot = CAMPUS_MATERIAL_SPOTS[2];
      targetLat = spot.latitude;
      targetLng = spot.longitude;
      label = `${spot.name} (${spot.floor}, ${spot.room})`;
    } else if (type === 'gkb_1_kelas') {
      const spot = CAMPUS_MATERIAL_SPOTS[3];
      targetLat = spot.latitude;
      targetLng = spot.longitude;
      label = `${spot.name} (${spot.floor}, ${spot.room})`;
    } else if (type === 'gkb_4_kelas') {
      const spot = CAMPUS_MATERIAL_SPOTS[4];
      targetLat = spot.latitude;
      targetLng = spot.longitude;
      label = `${spot.name} (${spot.floor}, ${spot.room})`;
    } else if (type === 'outside') {
      // 400 meter di luar area geofence
      targetLat = GEOFENCE_INFORMATIKA.latitude + 0.0035;
      targetLng = GEOFENCE_INFORMATIKA.longitude + 0.0035;
      label = 'Di Luar Area Kampus (Rumah/Kost)';
    }

    setSimulationName(label);
    setUserCoords({ latitude: targetLat, longitude: targetLng, accuracy: 4 });
    updateLocationState(targetLat, targetLng);
  };

  // -----------------------------------------------------------------------
  // NAVIGASI LANGSUNG SAAT SPOT DIKLIK: PETA OTOMATIS BERGESER KE LOKASI ITU
  // -----------------------------------------------------------------------
  const handleSelectSpot = (spot: MaterialSpot) => {
    setIsSimulated(true);
    setSimulationName(`${spot.name} (${spot.floor}, ${spot.room})`);
    setUserCoords({
      latitude: spot.latitude,
      longitude: spot.longitude,
      accuracy: 3,
    });
    updateLocationState(spot.latitude, spot.longitude);

    // Animasi peta Native langsung fokus ke gedung & ruangan tersebut
    if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
      mapRef.current.animateToRegion(
        {
          latitude: spot.latitude,
          longitude: spot.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        600
      );
    }
  };

  // -----------------------------------------------------------------------
  // PENANGANAN INPUT PENCARIAN POSISI DI UMM (GKB 3, GKB 4, GKB 1, RUANG)
  // -----------------------------------------------------------------------
  const handleApplyCustomLocation = (queryOverride?: string) => {
    const raw = (queryOverride !== undefined ? queryOverride : customInputLocation).trim().toLowerCase();
    if (!raw) {
      Alert.alert(
        'Masukkan Lokasi',
        'Ketik nama gedung atau ruangan Anda di UMM (contoh: GKB 3, GKB 4, GKB 1, Lab Informatika, Ruang Kelas).'
      );
      return;
    }

    let targetSpot = CAMPUS_MATERIAL_SPOTS.find(
      (s) =>
        s.name.toLowerCase().includes(raw) ||
        s.building.toLowerCase().includes(raw) ||
        s.room.toLowerCase().includes(raw) ||
        s.floor.toLowerCase().includes(raw)
    );

    if (raw.includes('lab') || (raw.includes('3') && raw.includes('lab'))) {
      targetSpot = CAMPUS_MATERIAL_SPOTS[0]; // GKB 3 Lab Pemrograman (Khusus Lab di GKB 3)
    } else if (raw.includes('gkb 2') || raw.includes('2')) {
      targetSpot = CAMPUS_MATERIAL_SPOTS[2]; // GKB 2 Ruang Kelas
    } else if (raw.includes('gkb 1') || raw.includes('1')) {
      targetSpot = CAMPUS_MATERIAL_SPOTS[3]; // GKB 1 Ruang Kelas
    } else if (raw.includes('gkb 4') || raw.includes('4')) {
      targetSpot = CAMPUS_MATERIAL_SPOTS[4]; // GKB 4 Ruang Kelas
    } else if (raw.includes('gkb 3') || raw.includes('3')) {
      targetSpot = raw.includes('kelas') || raw.includes('teori') ? CAMPUS_MATERIAL_SPOTS[1] : CAMPUS_MATERIAL_SPOTS[0];
    }

    if (targetSpot) {
      handleSelectSpot(targetSpot);
      setCustomInputLocation('');
      Alert.alert(
        'Peta Diarahkan ✓',
        `Peta otomatis berpindah ke:\n📍 ${targetSpot.name}\n${targetSpot.building}\n${targetSpot.floor} • ${targetSpot.room}`
      );
    } else {
      Alert.alert(
        'Lokasi Tidak Dikenali',
        `Lokasi "${raw}" tidak ditemukan. Coba ketik "GKB 3", "GKB 4", "GKB 1", atau "Lab Informatika".`
      );
    }
  };

  // -----------------------------------------------------------------------
  // RENDER PETA INTERAKTIF RESMI (GOOGLE MAPS KAMPUS 3 UMM)
  // Menampilkan jalan, bangunan GKB, danau, dan kontur nyata Kampus III UMM
  // -----------------------------------------------------------------------
  const renderInteractiveMap = () => {
    // JIKA PLATFORM MENDUKUNG REACT-NATIVE-MAPS NATIVELY (Android / iOS)
    if (Platform.OS !== 'web' && MapView) {
      return (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.mapView}
            mapType={mapLayerType}
            initialRegion={{
              latitude: GEOFENCE_INFORMATIKA.latitude,
              longitude: GEOFENCE_INFORMATIKA.longitude,
              latitudeDelta: 0.0035,
              longitudeDelta: 0.0035,
            }}
            showsUserLocation={false}
            showsCompass={true}
            showsTraffic={false}
          >
            {/* PENERAPAN WEEK 9 - FITUR 6: LINGKARAN RADIUS GEOFENCE (150 METER) DI GKB III UMM */}
            <MapCircle
              center={{
                latitude: GEOFENCE_INFORMATIKA.latitude,
                longitude: GEOFENCE_INFORMATIKA.longitude,
              }}
              radius={GEOFENCE_INFORMATIKA.radiusMeters}
              fillColor="rgba(37, 99, 235, 0.18)"
              strokeColor="#2563EB"
              strokeWidth={2}
            />

            {/* PENERAPAN WEEK 9 - FITUR 4: MARKER 5 SPOT MATERI AKADEMIK DI KAMPUS III UMM */}
            {CAMPUS_MATERIAL_SPOTS.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                title={spot.name}
                description={`${spot.building} • ${spot.recommendedTitle}`}
                pinColor={spot.color}
              />
            ))}

            {/* PENERAPAN WEEK 9 - FITUR 4: MARKER LOKASI MAHASISWA */}
            <Marker
              coordinate={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
              }}
              title="Lokasi Anda Saat Ini"
              description={geofenceEval.isInside ? 'Dalam Area GKB III UMM ✓' : 'Di Luar Area Kampus UMM'}
              pinColor="#EF4444"
            />
          </MapView>

          {/* Badge Label Area Kampus di atas Peta */}
          <View style={styles.mapTopFloatingBadge}>
            <Text style={styles.mapTopBadgeText}>🏫 GKB III UMM Kampus III (Radius 150m)</Text>
          </View>

          {/* Toggle Layer: Standar vs Satelit Nyata */}
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

    // JIKA DI WEB BROWSER: TAMPILKAN LIVE INTERACTIVE MAP RESMI KAMPUS 3 UMM
    // Menampilkan jalan Jl. Raya Tlogomas, GKB 1, GKB 2, GKB 3, GKB 4, danau UMM, dan kontur kampus asli
    return (
      <View style={styles.webMapContainer}>
        {Platform.OS === 'web' ? (
          // @ts-ignore
          <iframe
            key={`${userCoords.latitude.toFixed(5)}-${userCoords.longitude.toFixed(5)}`}
            title="Peta Kampus III Universitas Muhammadiyah Malang"
            src={`https://maps.google.com/maps?q=${userCoords.latitude},${userCoords.longitude}&z=17&output=embed`}
            style={{
              width: '100%',
              height: 290,
              border: 'none',
              borderRadius: 16,
            }}
          />
        ) : (
          <Svg width="100%" height={260} viewBox="0 0 360 260">
            <Rect width="360" height="260" fill="#E2E8F0" rx={16} />
            <Line x1="0" y1="130" x2="360" y2="130" stroke="#CBD5E1" strokeWidth="18" />
            <Line x1="180" y1="0" x2="180" y2="260" stroke="#CBD5E1" strokeWidth="18" />
            <SvgCircle cx="180" cy="130" r="85" fill="rgba(37, 99, 235, 0.12)" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 4" />
            <SvgText x="180" y="58" textAnchor="middle" fill="#1D4ED8" fontSize="10" fontWeight="bold">
              GKB III Kampus III UMM (150m)
            </SvgText>
          </Svg>
        )}

        <View style={styles.mapTopFloatingBadge}>
          <Text style={styles.mapTopBadgeText}>📍 Peta Live Kampus III UMM (Tlogomas)</Text>
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
          <Text style={styles.headerMainTitle}>Peta Kampus & LBS</Text>
          <Text style={styles.headerSubTitle}>Penerapan Week 9 • Gedung Informatika</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CONTAINER PETA RESMI KAMPUS 3 UMM */}
        {renderInteractiveMap()}

        {/* NAVIGASI CEPAT: DEVICE SAYA VS KAMPUS UMM */}
        <View style={styles.quickNavRow}>
          <Pressable
            style={[styles.quickNavBtn, !isSimulated && styles.quickNavBtnActive]}
            onPress={() => {
              initGpsLocation();
              panToCoordinates(userCoords.latitude, userCoords.longitude);
            }}
            accessibilityRole="button"
            accessibilityLabel="Pusatkan ke Posisi Device Saya"
          >
            <Text style={[styles.quickNavBtnText, !isSimulated && styles.quickNavBtnTextActive]}>
              🎯 Posisi Device Saya
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickNavBtn}
            onPress={() => {
              panToCoordinates(GEOFENCE_INFORMATIKA.latitude, GEOFENCE_INFORMATIKA.longitude);
            }}
            accessibilityRole="button"
            accessibilityLabel="Pusatkan ke Kampus 3 UMM"
          >
            <Text style={styles.quickNavBtnText}>
              🏫 Kampus 3 UMM (GKB 3)
            </Text>
          </Pressable>
        </View>

        {/* TOMBOL PEMBUKTIAN GOOGLE MAPS ASLI KAMPUS 3 UMM */}
        <View style={styles.googleMapsBanner}>
          <Pressable
            style={styles.openGoogleMapsBtn}
            onPress={() => Linking.openURL('https://maps.google.com/?q=-7.922400,112.598600')}
            accessibilityRole="button"
            accessibilityLabel="Buka di Google Maps Asli"
          >
            <Text style={styles.openGoogleMapsBtnText}>
              🗺️ Buka Titik GKB III UMM di Google Maps Asli ↗
            </Text>
          </Pressable>
          <Text style={styles.googleMapsSubNotice}>
            Koordinat Resmi: -7.922400, 112.598600 (GKB III Kampus 3 UMM Tlogomas)
          </Text>
        </View>

        {/* ========================================================================= */}
        {/* KARTU 1: STATUS GEOFENCE & INFORMASI LOKASI PENGGUNA (WEEK 9 - FITUR 2 & 6) */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSectionTag}>PENERAPAN FITUR 2 & 6</Text>
              <Text style={styles.cardMainTitle}>Lokasi Mahasiswa & Geofencing</Text>
              <Text style={styles.campusTargetLabel}>Target: GKB III Kampus 3 UMM (Informatika)</Text>
            </View>
            {/* BADGE GEOFENCE (DI DALAM / DI LUAR AREA) */}
            <View
              style={[
                styles.geofenceBadge,
                geofenceEval.isInside ? styles.badgeInside : styles.badgeOutside,
              ]}
            >
              <Text
                style={[
                  styles.geofenceBadgeText,
                  geofenceEval.isInside ? styles.badgeTextInside : styles.badgeTextOutside,
                ]}
              >
                {geofenceEval.isInside
                  ? 'Dalam Area Geofence UMM ✓'
                  : `Di Luar UMM (${geofenceEval.distanceToCenter >= 1000 ? (geofenceEval.distanceToCenter / 1000).toFixed(1) + ' km' : geofenceEval.distanceToCenter + ' m'})`}
              </Text>
            </View>
          </View>

          {/* KOORDINAT LATITUDE & LONGITUDE */}
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
              <Text style={styles.coordLabel}>Jarak ke UMM</Text>
              <Text style={styles.coordValue}>
                {geofenceEval.distanceToCenter >= 1000
                  ? `${(geofenceEval.distanceToCenter / 1000).toFixed(1)} km`
                  : `${geofenceEval.distanceToCenter} m`}
              </Text>
            </View>
          </View>

          {/* REVERSE GEOCODING (ALAMAT NYATA) */}
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>📍 Alamat (Reverse Geocoding):</Text>
            <Text style={styles.addressText}>{currentAddress}</Text>
          </View>

          {/* NOTIFIKASI LONCENG STATUS GEOFENCE */}
          {geofenceEval.isInside && (
            <View style={styles.notifBannerBox}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifTextWrap}>
                <Text style={styles.notifTitle}>Notifikasi Lonceng Aktif:</Text>
                <Text style={styles.notifBody}>
                  "Kamu di Gedung Informatika. Ada materi untuk semester ini."
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* KARTU 2: REKOMENDASI MATERI DARI TITIK TERDEKAT (WEEK 9 - RUMUS HAVERSINE) */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTag}>REKOMENDASI OTOMATIS (HAVERSINE)</Text>
          <Text style={styles.cardMainTitle}>Titik Materi Terdekat</Text>
          <Text style={styles.cardDesc}>
            Dihitung otomatis tanpa tombol baru menggunakan rumus Haversine ke 5 spot akademik.
          </Text>

          <View style={[styles.spotHighlightCard, { borderColor: geofenceEval.nearestSpot.color }]}>
            <View style={styles.spotHighlightHeader}>
              <View style={[styles.spotBadge, { backgroundColor: geofenceEval.nearestSpot.color }]}>
                <Text style={styles.spotBadgeText}>{geofenceEval.nearestSpot.category}</Text>
              </View>
              <Text style={styles.spotDistanceText}>
                Jarak: {geofenceEval.distanceToSpot} meter
              </Text>
            </View>

            <Text style={styles.spotSpotName}>📍 {geofenceEval.nearestSpot.name}</Text>
            <Text style={styles.spotMaterialTitle}>
              {geofenceEval.nearestSpot.recommendedTitle}
            </Text>
            <Text style={styles.spotMaterialDesc}>
              {geofenceEval.nearestSpot.recommendedDesc}
            </Text>

            <View style={styles.spotFooterRow}>
              <Text style={styles.spotCourseTag}>
                Mata Kuliah: {geofenceEval.nearestSpot.recommendedCourse}
              </Text>
              <Pressable
                style={styles.openNoteBtn}
                onPress={() =>
                  Alert.alert(
                    'Materi Terpilih',
                    `Membuka catatan: "${geofenceEval.nearestSpot.recommendedTitle}" (${geofenceEval.nearestSpot.recommendedCourse}).`
                  )
                }
              >
                <Text style={styles.openNoteBtnText}>Buka Materi</Text>
              </Pressable>
            </View>
          </View>

          {/* DAFTAR 5 TITIK SPOT MATERI (BISA DIKLIK LANGSUNG UNTUK ARAHKAN PETA) */}
          <View style={styles.subListHeaderRow}>
            <Text style={styles.subListHeader}>Daftar 5 Spot Gedung & Ruangan di UMM:</Text>
            <Text style={styles.subListTapHint}>👉 Ketuk item untuk arahkan peta otomatis</Text>
          </View>

          {geofenceEval.allSpotsWithDistance.map((spot) => {
            const isSelected = geofenceEval.nearestSpot.id === spot.id;
            return (
              <Pressable
                key={spot.id}
                style={[
                  styles.spotClickableRow,
                  isSelected && styles.spotClickableRowActive,
                ]}
                onPress={() => handleSelectSpot(spot)}
                accessibilityRole="button"
                accessibilityLabel={`Arahkan peta ke ${spot.name}`}
              >
                <View style={[styles.spotDotIndicator, { backgroundColor: spot.color }]} />
                <View style={styles.spotMiniInfo}>
                  <View style={styles.spotTitleRow}>
                    <Text style={styles.spotMiniTitle}>{spot.name}</Text>
                    {isSelected && (
                      <View style={styles.nearestBadgeWrap}>
                        <Text style={styles.nearestBadgeText}>Posisi Terpilih ✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.spotFloorRoomText}>
                    🏢 {spot.building} • {spot.floor} • {spot.room}
                  </Text>
                  <Text style={styles.spotMiniSub}>
                    {spot.category} • Jarak: {spot.distance}m
                  </Text>
                </View>
                <View style={styles.chevronWrap}>
                  <Text style={styles.chevronText}>→</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ========================================================================= */}
        {/* INPUT MANUAL POSISI MAHASISWA DI UMM (GKB 3, GKB 4, GKB 1, RUANGAN)     */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTag}>NAVIGASI INTERAKTIF KAMPUS UMM</Text>
          <Text style={styles.cardMainTitle}>Input Posisi Anda di Kampus</Text>
          <Text style={styles.cardDesc}>
            Ketik nama gedung, lab, atau ruangan tempat Anda berada di UMM. Peta dan materi otomatis bergerak menunjukkan lokasi Anda:
          </Text>

          <View style={styles.inputSearchWrapper}>
            <TextInput
              style={styles.locationTextInput}
              placeholder="Contoh: GKB 3, GKB 4, GKB 1, Lab Informatika..."
              placeholderTextColor="#94A3B8"
              value={customInputLocation}
              onChangeText={setCustomInputLocation}
              onSubmitEditing={() => handleApplyCustomLocation()}
              returnKeyType="search"
            />
            <Pressable
              style={styles.applyLocationBtn}
              onPress={() => handleApplyCustomLocation()}
              accessibilityRole="button"
              accessibilityLabel="Arahkan Peta"
            >
              <Text style={styles.applyLocationBtnText}>Arahkan</Text>
            </Pressable>
          </View>

          {/* PILIHAN CEPAT TOMBOL POSISI GEDUNG & RUANGAN */}
          <Text style={styles.quickChipLabel}>Pilihan Cepat Posisi Gedung & Ruang:</Text>
          <View style={styles.quickChipsGrid}>
            <Pressable
              style={styles.quickChipBtn}
              onPress={() => handleSelectSpot(CAMPUS_MATERIAL_SPOTS[0])}
            >
              <Text style={styles.quickChipBtnText}>💻 GKB 3 (Lab Pemrograman Lt. 3)</Text>
            </Pressable>
            <Pressable
              style={styles.quickChipBtn}
              onPress={() => handleSelectSpot(CAMPUS_MATERIAL_SPOTS[1])}
            >
              <Text style={styles.quickChipBtnText}>📖 GKB 3 (Ruang Kelas Lt. 2)</Text>
            </Pressable>
            <Pressable
              style={styles.quickChipBtn}
              onPress={() => handleSelectSpot(CAMPUS_MATERIAL_SPOTS[2])}
            >
              <Text style={styles.quickChipBtnText}>🏢 GKB 2 (Ruang Kelas Lt. 3)</Text>
            </Pressable>
            <Pressable
              style={styles.quickChipBtn}
              onPress={() => handleSelectSpot(CAMPUS_MATERIAL_SPOTS[3])}
            >
              <Text style={styles.quickChipBtnText}>🏛️ GKB 1 (Ruang Kelas Lt. 2)</Text>
            </Pressable>
            <Pressable
              style={styles.quickChipBtn}
              onPress={() => handleSelectSpot(CAMPUS_MATERIAL_SPOTS[4])}
            >
              <Text style={styles.quickChipBtnText}>🏫 GKB 4 (Ruang Kelas Lt. 4)</Text>
            </Pressable>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* KARTU 3: SIMULATOR UJI COBA UNTUK DEMO DOSEN (MEMPERMUDAH PENILAIAN) */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTag}>ALAT DEMO PENILAIAN</Text>
          <Text style={styles.cardMainTitle}>Simulasi Pergerakan Mahasiswa</Text>
          <Text style={styles.cardDesc}>
            Uji transisi masuk/keluar geofence dan pergantian rekomendasi materi secara langsung saat demonstrasi.
          </Text>

          <View style={styles.simulatorButtonsRow}>
            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('GKB 3 — Lab') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('gkb_3_lab')}
            >
              <Text style={styles.simBtnText}>💻 GKB 3 (Lab)</Text>
            </Pressable>

            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('GKB 3 — Ruang') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('gkb_3_kelas')}
            >
              <Text style={styles.simBtnText}>📖 GKB 3 (Kelas)</Text>
            </Pressable>

            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('GKB 2') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('gkb_2_kelas')}
            >
              <Text style={styles.simBtnText}>🏢 GKB 2 (Kelas)</Text>
            </Pressable>
          </View>

          <View style={styles.simulatorButtonsRow}>
            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('GKB 1') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('gkb_1_kelas')}
            >
              <Text style={styles.simBtnText}>🏛️ GKB 1 (Kelas)</Text>
            </Pressable>

            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('GKB 4') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('gkb_4_kelas')}
            >
              <Text style={styles.simBtnText}>🏫 GKB 4 (Kelas)</Text>
            </Pressable>

            <Pressable
              style={[
                styles.simBtn,
                simulationName.includes('Luar') && styles.simBtnActive,
              ]}
              onPress={() => handleSimulatePosition('outside')}
            >
              <Text style={styles.simBtnText}>🏠 Luar</Text>
            </Pressable>

            <Pressable
              style={[styles.simBtn, styles.simResetBtn]}
              onPress={() => handleSimulatePosition('reset')}
            >
              <Text style={styles.simResetBtnText}>🔄 Reset</Text>
            </Pressable>
          </View>

          {isSimulated && (
            <Text style={styles.simActiveNotice}>
              Mode Simulasi Aktif: {simulationName}
            </Text>
          )}
        </View>

        {/* ========================================================================= */}
        {/* KARTU 4: OPTIMASI BATERAI (WEEK 9 - FITUR 7) */}
        {/* ========================================================================= */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTag}>PENERAPAN FITUR 7</Text>
          <Text style={styles.cardMainTitle}>Optimasi Baterai & Efisiensi Pelacakan</Text>
          <Text style={styles.cardDesc}>
            Pengaturan mode pelacakan lokasi untuk menjaga daya tahan baterai ponsel mahasiswa saat berada di kampus.
          </Text>

          <View style={styles.batterySwitchRow}>
            <View style={styles.batterySwitchInfo}>
              <Text style={styles.batterySwitchLabel}>
                {batteryMode === 'balanced' ? 'Mode Hemat Baterai (Aktif)' : 'Mode Akurasi Tinggi (Aktif)'}
              </Text>
              <Text style={styles.batterySwitchSub}>
                {BATTERY_PRESETS[batteryMode].description}
              </Text>
            </View>
            <Switch
              value={batteryMode === 'high_accuracy'}
              onValueChange={(val) => setBatteryMode(val ? 'high_accuracy' : 'balanced')}
              trackColor={{ false: '#10B981', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.batteryDetailsRow}>
            <View style={styles.batteryParamBox}>
              <Text style={styles.batteryParamKey}>Interval Jarak:</Text>
              <Text style={styles.batteryParamVal}>{BATTERY_PRESETS[batteryMode].distanceInterval} Meter</Text>
            </View>
            <View style={styles.batteryParamBox}>
              <Text style={styles.batteryParamKey}>Interval Waktu:</Text>
              <Text style={styles.batteryParamVal}>
                {BATTERY_PRESETS[batteryMode].timeInterval / 1000} Detik
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------------------
// STYLING HALAMAN & KOMPONEN LBS WEEK 9
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  headerTitles: {
    flex: 1,
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  mapView: {
    ...StyleSheet.absoluteFill,
  },
  webMapContainer: {
    height: 260,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapTopFloatingBadge: {
    position: 'absolute',
    top: 12,
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
  quickNavRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  quickNavBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickNavBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  quickNavBtnTextActive: {
    color: '#1D4ED8',
  },
  googleMapsBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  openGoogleMapsBtn: {
    backgroundColor: '#0F2850',
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  openGoogleMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  googleMapsSubNotice: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  campusTargetLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
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
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  geofenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeInside: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  badgeOutside: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  geofenceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextInside: {
    color: '#15803D',
  },
  badgeTextOutside: {
    color: '#B91C1C',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  coordBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  coordValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  addressBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  addressText: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 2,
    fontWeight: '600',
  },
  notifBannerBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 10,
  },
  notifIcon: {
    fontSize: 22,
  },
  notifTextWrap: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  notifBody: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
    fontWeight: '600',
  },
  spotHighlightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  spotHighlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spotBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  spotDistanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  spotSpotName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  spotMaterialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  spotMaterialDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  spotFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  spotCourseTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
  },
  openNoteBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  subListHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  subListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  subListTapHint: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  spotClickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  spotClickableRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1.5,
  },
  spotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nearestBadgeWrap: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  nearestBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  spotFloorRoomText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  chevronWrap: {
    paddingLeft: 4,
  },
  chevronText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  inputSearchWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  locationTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  applyLocationBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyLocationBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  quickChipLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  quickChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChipBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickChipBtnText: {
    fontSize: 11.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  spotMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  spotDotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spotMiniInfo: {
    flex: 1,
  },
  spotMiniTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  spotMiniSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  simulatorButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  simBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  simBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  simResetBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  simResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  simActiveNotice: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  batterySwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  batterySwitchInfo: {
    flex: 1,
    marginRight: 10,
  },
  batterySwitchLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  batterySwitchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  batteryDetailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  batteryParamBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batteryParamKey: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  batteryParamVal: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '800',
  },
});
