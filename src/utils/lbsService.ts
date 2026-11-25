/**
 * =========================================================================
 * PENERAPAN WEEK 9 - LOCATION-BASED SERVICES (LBS) & GEOFENCING
 * =========================================================================
 * Dokumen Modul: Sistem Layanan Berbasis Lokasi & Geofencing Kampus SIMAK
 * 
 * 7 DAFTAR FITUR YANG DIIMPLEMENTASIKAN:
 * 1. Mengakses GPS (Izin Akses Lokasi Foreground / Permissions)
 * 2. Membaca Koordinat (Latitude, Longitude, Akurasi secara Real-time)
 * 3. Menampilkan Peta Interaktif (Visualisasi Map & Tracking)
 * 4. Menampilkan Marker (Pin Lokasi Pengguna & 5 Titik Spot Materi Akademik)
 * 5. Melakukan Reverse Geocoding (Menerjemahkan Koordinat -> Nama Jalan/Kota)
 * 6. Menguji Geofencing (Radius 150m Gedung Informatika & Pemicu Notifikasi Lonceng)
 * 7. Optimasi Baterai (Akurasi Seimbang vs Akurasi Tinggi & Pengaturan Interval)
 * =========================================================================
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------------------------------
// DATA TITIK PUSAT GEOFENCE: GKB III UNIVERSITAS MUHAMMADIYAH MALANG (UMM KAMPUS III)
// Titik Valid Google Maps: -7.922400, 112.598600
// -------------------------------------------------------------------------
export const GEOFENCE_INFORMATIKA = {
  id: 'gedung-informatika-umm',
  name: 'Gedung Informatika (GKB III UMM)',
  campusName: 'Universitas Muhammadiyah Malang (Kampus III)',
  faculty: 'Fakultas Teknik - Informatika UMM',
  latitude: -7.922400,
  longitude: 112.598600,
  radiusMeters: 150, // Radius 150 meter sesuai konsep geofence
  addressDefault: 'Jl. Raya Tlogomas No. 246, Babatan, Lowokwaru, Kota Malang, Jawa Timur 65144',
  googleMapsUrl: 'https://maps.google.com/?q=-7.922400,112.598600',
};

// -------------------------------------------------------------------------
// SEED DATA 5 TITIK SPOT MATERI VALID DI KAMPUS III UMM (GKB 3, GKB 4, GKB 1, LAB & RUANG KELAS)
// -------------------------------------------------------------------------
export interface MaterialSpot {
  id: string;
  name: string;
  building: string;
  floor: string;
  room: string;
  category: string;
  latitude: number;
  longitude: number;
  color: string;
  iconName: string;
  recommendedCourse: string;
  recommendedTitle: string;
  recommendedDesc: string;
  samplePrice: number;
}

export const CAMPUS_MATERIAL_SPOTS: MaterialSpot[] = [
  {
    id: 'spot-gkb-3-lab',
    name: 'GKB 3 — Lab Pemrograman Informatika',
    building: 'Gedung Kuliah Bersama 3 UMM',
    floor: 'Lantai 3',
    room: 'R. 3.12 (Lab Pemrograman Mobile & Komputasi)',
    category: 'Laboratorium Komputer (Khusus GKB 3)',
    latitude: -7.922300,
    longitude: 112.598550,
    color: '#2563EB', // Biru
    iconName: 'code-slash',
    recommendedCourse: 'Pemrograman Mobile & Algoritma',
    recommendedTitle: 'Modul Praktikum React Native & State Management',
    recommendedDesc: 'Panduan sintaks Java/Kotlin, React Native Hooks, dan navigasi Expo Router.',
    samplePrice: 15000,
  },
  {
    id: 'spot-gkb-3-kelas',
    name: 'GKB 3 — Ruang Kelas Teori',
    building: 'Gedung Kuliah Bersama 3 UMM',
    floor: 'Lantai 2',
    room: 'R. 3.05 (Ruang Kelas Kuliah Teori)',
    category: 'Ruang Kelas Perkuliahan',
    latitude: -7.922450,
    longitude: 112.598680,
    color: '#059669', // Hijau
    iconName: 'easel',
    recommendedCourse: 'Kecerdasan Buatan & Basis Data',
    recommendedTitle: 'Konsep Machine Learning Dasar & Normalisasi Database',
    recommendedDesc: 'Rangkuman persiapan ujian akhir semester mata kuliah Artificial Intelligence.',
    samplePrice: 12000,
  },
  {
    id: 'spot-gkb-2-kelas',
    name: 'GKB 2 — Ruang Kelas Teori',
    building: 'Gedung Kuliah Bersama 2 UMM',
    floor: 'Lantai 3',
    room: 'R. 2.08 (Ruang Kelas Teori Bersama)',
    category: 'Ruang Kelas Perkuliahan',
    latitude: -7.921800,
    longitude: 112.597800,
    color: '#7C3AED', // Ungu
    iconName: 'easel',
    recommendedCourse: 'Matematika Diskrit & Logika',
    recommendedTitle: 'Rangkuman Teori Graf, Automata & Aljabar Boolean',
    recommendedDesc: 'Catatan tulisan tangan rapi materi aljabar boolean dan diagram pohon keputusan.',
    samplePrice: 10000,
  },
  {
    id: 'spot-gkb-1-kelas',
    name: 'GKB 1 — Ruang Kuliah Bersama',
    building: 'Gedung Kuliah Bersama 1 UMM',
    floor: 'Lantai 2',
    room: 'R. 1.04 (Ruang Kuliah Teori Bersama)',
    category: 'Ruang Kelas Perkuliahan',
    latitude: -7.920800,
    longitude: 112.597600,
    color: '#D97706', // Amber/Emas
    iconName: 'book',
    recommendedCourse: 'Etika Profesi & Pemrograman Web',
    recommendedTitle: 'Rangkuman Etika Rekayasa & Standar Industri Software',
    recommendedDesc: 'Panduan tata kelola proyek perangkat lunak dan etika profesi insinyur komputer.',
    samplePrice: 10000,
  },
  {
    id: 'spot-gkb-4-kelas',
    name: 'GKB 4 — Ruang Kelas Terpadu',
    building: 'Gedung Kuliah Bersama 4 UMM',
    floor: 'Lantai 4',
    room: 'R. 4.06 (Ruang Kuliah Teori Terpadu)',
    category: 'Ruang Kelas Perkuliahan',
    latitude: -7.923200,
    longitude: 112.599200,
    color: '#EA580C', // Oranye
    iconName: 'easel',
    recommendedCourse: 'Rekayasa Perangkat Lunak',
    recommendedTitle: 'Dokumentasi SRS, Diagram UML, dan Desain Arsitektur',
    recommendedDesc: 'Studi kasus perancangan sistem informasi akademik menggunakan Use Case & ERD.',
    samplePrice: 12000,
  },
];

// -------------------------------------------------------------------------
// PENERAPAN WEEK 9 - FITUR 1: MENGAKSES GPS (REQUEST PERMISSION)
// -------------------------------------------------------------------------
export async function requestGpsPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Gagal meminta izin GPS:', error);
    return false;
  }
}

// -------------------------------------------------------------------------
// PENERAPAN WEEK 9 - FITUR 6 & MATEMATIKA: RUMUS HAVERSINE UNTUK JARAK AKURAT
// Menghitung jarak garis lengkung bumi dalam satuan meter
// -------------------------------------------------------------------------
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam satuan meter (~6.371 km)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Mengembalikan nilai bulat dalam meter
}

// -------------------------------------------------------------------------
// PENERAPAN WEEK 9 - FITUR 5: REVERSE GEOCODING RESMI
// Menerjemahkan koordinat latitude/longitude menjadi nama jalan, kecamatan, dan kota device
// -------------------------------------------------------------------------
export async function performReverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (addresses && addresses.length > 0) {
      const addr = addresses[0];
      const street = addr.street || addr.name || '';
      const subdistrict = addr.district || addr.subregion || '';
      const city = addr.city || addr.region || '';
      
      const elements = [street, subdistrict, city].filter(Boolean);
      if (elements.length > 0) {
        return elements.join(', ');
      }
    }
  } catch (err) {
    console.warn('Gagal reverse geocode, menggunakan koordinat:', err);
  }
  return `Koordinat Device: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

// -------------------------------------------------------------------------
// MANAJEMEN PENYIMPANAN LOKASI DEVICE PENGGUNA SAAT LOGIN
// -------------------------------------------------------------------------
export const USER_DEVICE_LOCATION_KEY = 'simak_user_device_location_v1';

export async function saveDeviceLocation(
  latitude: number,
  longitude: number,
  accuracy?: number | null
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      USER_DEVICE_LOCATION_KEY,
      JSON.stringify({ latitude, longitude, accuracy, timestamp: Date.now() })
    );
  } catch (e) {
    console.warn('Gagal menyimpan lokasi device:', e);
  }
}

export async function getSavedDeviceLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp?: number;
} | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_DEVICE_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------------------
// PENERAPAN WEEK 9 - FITUR 6: LOGIKA GEOFENCING & NOTIFIKASI LONCENG
// -------------------------------------------------------------------------
export interface GeofenceEvaluation {
  isInside: boolean;
  distanceToCenter: number;
  nearestSpot: MaterialSpot;
  distanceToSpot: number;
  allSpotsWithDistance: Array<MaterialSpot & { distance: number }>;
}

export function evaluateGeofenceAndSpots(
  userLat: number,
  userLng: number
): GeofenceEvaluation {
  // Hitung jarak ke pusat Gedung Informatika (Geofence utama)
  const distanceToCenter = calculateHaversineDistance(
    userLat,
    userLng,
    GEOFENCE_INFORMATIKA.latitude,
    GEOFENCE_INFORMATIKA.longitude
  );

  const isInside = distanceToCenter <= GEOFENCE_INFORMATIKA.radiusMeters;

  // Hitung jarak otomatis ke semua 5 spot materi
  const spotsWithDistance = CAMPUS_MATERIAL_SPOTS.map((spot) => ({
    ...spot,
    distance: calculateHaversineDistance(userLat, userLng, spot.latitude, spot.longitude),
  })).sort((a, b) => a.distance - b.distance);

  return {
    isInside,
    distanceToCenter,
    nearestSpot: spotsWithDistance[0],
    distanceToSpot: spotsWithDistance[0].distance,
    allSpotsWithDistance: spotsWithDistance,
  };
}

// Simpan notifikasi lonceng saat pengguna memasuki geofence
const GEOFENCE_NOTIF_STORAGE_KEY = 'simak_geofence_notification_v1';

export async function triggerGeofenceNotification(): Promise<void> {
  try {
    const notifData = {
      id: 'geofence-gedung-informatika',
      title: 'Gedung Informatika (LBS Week 9)',
      message: 'Kamu di Gedung Informatika. Ada materi untuk semester ini.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    await AsyncStorage.setItem(GEOFENCE_NOTIF_STORAGE_KEY, JSON.stringify(notifData));
  } catch (error) {
    console.warn('Gagal menyimpan notifikasi geofence:', error);
  }
}

export async function getGeofenceNotification(): Promise<{
  title: string;
  message: string;
  timestamp: string;
} | null> {
  try {
    const saved = await AsyncStorage.getItem(GEOFENCE_NOTIF_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------------------
// PENERAPAN WEEK 9 - FITUR 7: OPTIMASI BATERAI (BATTERY EFFICIENCY)
// -------------------------------------------------------------------------
export type BatteryMode = 'balanced' | 'high_accuracy';

export interface BatteryConfig {
  accuracy: Location.Accuracy;
  distanceInterval: number; // Meter minimum sebelum GPS refresh
  timeInterval: number;     // Milidetik minimum polling
  label: string;
  description: string;
}

export const BATTERY_PRESETS: Record<BatteryMode, BatteryConfig> = {
  balanced: {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 10,  // Hanya refresh jika bergerak minimal 10 meter
    timeInterval: 10000,   // Polling tiap 10 detik (hemat baterai & CPU)
    label: 'Mode Hemat Daya (Optimal)',
    description: 'Menggunakan triangulasi seluler & Wi-Fi. Efisien baterai untuk penggunaan harian di kampus.',
  },
  high_accuracy: {
    accuracy: Location.Accuracy.High,
    distanceInterval: 3,   // Refresh tiap pergeseran 3 meter
    timeInterval: 3000,    // Polling tiap 3 detik (akurasi tinggi GPS satelit)
    label: 'Mode Akurasi Tinggi (GPS Satelit)',
    description: 'Mengaktifkan sensor satelit GPS penuh. Sangat presisi namun mengonsumsi daya baterai lebih tinggi.',
  },
};

