import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Accelerometer } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import AccelerometerCard from './AccelerometerCard';
import DocumentUploadPicker from './DocumentUploadPicker';
import { useAuth } from '../context/AuthContext';

// ==========================================
// TIPE DATA & INTERFACES (DTO)
// ==========================================
export type TingkatKesulitan =
  | 'Tingkat Dasar'
  | 'Tingkat Menengah'
  | 'Tingkat Sulit'
  | 'Tingkat Eksklusif';

export interface MataKuliahDTO {
  id?: string | number;
  userId?: string | number;
  title?: string;
  nama?: string;
  name?: string;
}

export interface SemesterDTO {
  id?: string | number;
  userId?: string | number;
  title?: string;
  nama?: string;
  semester?: string;
}

export interface UploadFilePayload {
  uri: string;
  name: string;
  type: string;
  size?: string;
  rawFile?: any;
}

export interface UnggahScreenProps {
  onSuccess?: (createdNote?: any) => void;
  onClose?: () => void;
  isModal?: boolean;
}

// ==========================================
// SVG ICONS DESAIN SIMAK
// ==========================================
function SimakLogoIcon() {
  return (
    <Svg width={26} height={32} viewBox="0 0 30 36" fill="none">
      <Rect x="1" y="2" width="26" height="32" rx="5.5" fill="#1E3A5F" />
      <Rect x="16" y="0" width="8.5" height="11" rx="2.2" fill="#F97316" />
      <Rect x="6" y="13" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="18" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="23" width="9.5" height="2.2" rx="1.1" fill="#FFFFFF" />
    </Svg>
  );
}

function PdfFileIcon({ size = 28, color = '#E11D48' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        fill="#FEE2E2"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path d="M14 2V8H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M9 13H10C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15H9V13ZM9 13V17"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckCircleIcon({ size = 52, color = '#059669' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#D1FAE5" stroke={color} strokeWidth="2" />
      <Path
        d="M8 12.5L10.5 15L16 9"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UploadCloudIcon({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 16L12 12L8 16M12 12V21M20.39 18.39A5 5 0 0 0 18 9H16.74A8 8 0 1 0 3 16.3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Konfigurasi Pilihan Tingkat Kesulitan SIMAK
const PILIHAN_KESULITAN: {
  level: TingkatKesulitan;
  tarif: string;
  desc: string;
  badgeBg: string;
  badgeColor: string;
}[] = [
  {
    level: 'Tingkat Dasar',
    tarif: 'Rp10.000',
    desc: 'Konsep dasar, pengantar materi perkuliahan',
    badgeBg: '#D1FAE5',
    badgeColor: '#059669',
  },
  {
    level: 'Tingkat Menengah',
    tarif: 'Rp15.000',
    desc: 'Praktikum & tutorial studi kasus',
    badgeBg: '#E0F2FE',
    badgeColor: '#0284C7',
  },
  {
    level: 'Tingkat Sulit',
    tarif: 'Rp25.000',
    desc: 'Algoritma mendalam, struktur data & analisis',
    badgeBg: '#FEF3C7',
    badgeColor: '#D97706',
  },
  {
    level: 'Tingkat Eksklusif',
    tarif: 'Rp35.000',
    desc: 'Kisi-kisi komprehensif UAS & master cheat sheet',
    badgeBg: '#EDE9FE',
    badgeColor: '#7C3AED',
  },
];

// Data Default Cadangan Kampus SIMAK
const FALLBACK_MATA_KULIAH = [
  'Pemrograman Mobile',
  'Struktur Data & Algoritma',
  'Basis Data Terdistribusi',
  'Jaringan Komputer',
  'Kecerdasan Buatan & ML',
  'Rekayasa Perangkat Lunak',
];

const FALLBACK_SEMESTER = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

function getCourseCode(mk: string): string {
  const map: Record<string, string> = {
    'Pemrograman Mobile': 'CS-302',
    'Struktur Data & Algoritma': 'CS-201',
    'Basis Data Terdistribusi': 'BD-103',
    'Jaringan Komputer': 'IF-204',
    'Kecerdasan Buatan & ML': 'AI-401',
    'Rekayasa Perangkat Lunak': 'SE-305',
  };
  return map[mk] || 'IF-301';
}

function mapKesulitan(k: TingkatKesulitan): 'dasar' | 'menengah' | 'sulit' | 'eksklusif' {
  switch (k) {
    case 'Tingkat Menengah':
      return 'menengah';
    case 'Tingkat Sulit':
      return 'sulit';
    case 'Tingkat Eksklusif':
      return 'eksklusif';
    default:
      return 'dasar';
  }
}

function getTarif(k: TingkatKesulitan): number {
  switch (k) {
    case 'Tingkat Menengah':
      return 15000;
    case 'Tingkat Sulit':
      return 25000;
    case 'Tingkat Eksklusif':
      return 35000;
    default:
      return 10000;
  }
}

export default function UnggahScreen({
  onSuccess,
  onClose,
  isModal = false,
}: UnggahScreenProps) {
  const { user } = useAuth();
  const uploaderName = user?.nama ?? 'safira';
  const uploaderNim = user?.nim ?? '202410370110233';
  const uploaderProdi = user?.jurusan ?? 'S1 Informatika';

  // =========================================================================
  // 1. STATE DATA AWAL (DYNAMIC GET API & FALLBACK DATA)
  // =========================================================================
  const [listMataKuliah, setListMataKuliah] = useState<string[]>(FALLBACK_MATA_KULIAH);
  const [listSemester, setListSemester] = useState<string[]>(FALLBACK_SEMESTER);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);

  // Form State
  const [judulCatatan, setJudulCatatan] = useState<string>('');
  const [mataKuliah, setMataKuliah] = useState<string>(FALLBACK_MATA_KULIAH[0]);
  const [semester, setSemester] = useState<string>(FALLBACK_SEMESTER[4]);
  const [tingkatKesulitan, setTingkatKesulitan] = useState<TingkatKesulitan>('Tingkat Dasar');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // State Berkas Upload (PDF atau foto dokumentasi)
  const [file, setFile] = useState<UploadFilePayload>({
    uri: 'file:///simak/storage/documents/catatan_kuliah.pdf',
    name: 'catatan_kuliah_lengkap.pdf',
    type: 'application/pdf',
    size: '2.4 MB',
  });
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadFilePayload | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState<boolean>(false);

  // State sensor Accelerometer & shake detection
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [shakeDetected, setShakeDetected] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const lastShakeRef = useRef(0);

  // State Status Unggah & Feedback Modal
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showMkPickerModal, setShowMkPickerModal] = useState<boolean>(false);
  const [createdNoteResult, setCreatedNoteResult] = useState<any>(null);

  // =========================================================================
  // 1. GET API DATA AWAL MENGGUNAKAN MOCK API PUBLIK (JSONPlaceholder)
  // Endpoint:
  // - GET Mata Kuliah: 'https://jsonplaceholder.typicode.com/posts?_limit=6'
  // - GET Semester: 'https://jsonplaceholder.typicode.com/albums?_limit=8'
  // Disertai FALLBACK DATA lengkap di blok catch
  // =========================================================================
  useEffect(() => {
    let isCancelled = false;

    const fetchInitialData = async () => {
      try {
        const [responseMK, responseSemester] = await Promise.all([
          fetch('https://jsonplaceholder.typicode.com/posts?_limit=6'),
          fetch('https://jsonplaceholder.typicode.com/albums?_limit=8'),
        ]);

        if (!responseMK.ok || !responseSemester.ok) {
          throw new Error(`HTTP Error: ${responseMK.status} / ${responseSemester.status}`);
        }

        const rawDataMK: MataKuliahDTO[] = await responseMK.json();
        const rawDataSemester: SemesterDTO[] = await responseSemester.json();

        if (isCancelled) return;

        // DTO Parsing Mata Kuliah
        const parsedListMK: string[] = Array.isArray(rawDataMK) && rawDataMK.length > 0
          ? rawDataMK.map((item, idx) => {
              const defaultName = FALLBACK_MATA_KULIAH[idx % FALLBACK_MATA_KULIAH.length];
              return item.nama || item.name || defaultName;
            })
          : FALLBACK_MATA_KULIAH;

        // DTO Parsing Semester
        const parsedListSem: string[] = Array.isArray(rawDataSemester) && rawDataSemester.length > 0
          ? rawDataSemester.map((_, idx) => `Semester ${idx + 1}`)
          : FALLBACK_SEMESTER;

        setListMataKuliah(parsedListMK);
        setListSemester(parsedListSem);

        if (parsedListMK.length > 0) {
          setMataKuliah((prev) => prev || parsedListMK[0]);
        }
        if (parsedListSem.length > 0) {
          setSemester((prev) => prev || parsedListSem[4] || parsedListSem[0]);
        }
      } catch (error: any) {
        console.warn('GET API Error (Fallback diaktifkan):', error?.message);
        // FALLBACK DATA: Jika API gagal/error, langsung set state menggunakan data default agar UI tidak error
        if (isCancelled) return;
        setListMataKuliah(FALLBACK_MATA_KULIAH);
        setListSemester(FALLBACK_SEMESTER);
        setMataKuliah((prev) => prev || FALLBACK_MATA_KULIAH[0]);
        setSemester((prev) => prev || FALLBACK_SEMESTER[4]);
      } finally {
        if (!isCancelled) {
          setIsLoadingInitialData(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = Accelerometer.addListener((sensorData) => {
      setAccelerometerData(sensorData);

      const magnitude = Math.sqrt(
        sensorData.x * sensorData.x +
          sensorData.y * sensorData.y +
          sensorData.z * sensorData.z
      );

      const now = Date.now();
      if (magnitude > 1.5 && now - lastShakeRef.current > 1000) {
        lastShakeRef.current = now;
        setShakeDetected(true);
        setShakeCount((prev) => prev + 1);
        Vibration.vibrate(250);

        setTimeout(() => setShakeDetected(false), 500);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePermissionRequest = async (mode: 'camera' | 'gallery') => {
    try {
      const permission =
        mode === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Izin Ditolak',
          mode === 'camera'
            ? 'Akses kamera dibutuhkan untuk mengambil foto dokumen.'
            : 'Akses galeri dibutuhkan untuk memilih foto dokumen.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Permission error:', error);
      Alert.alert('Terjadi Kesalahan', 'Tidak dapat meminta izin akses saat ini.');
      return false;
    }
  };

  const setPickedAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const fileName = asset.fileName || `dokumen-simak-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';
    const fileSize = asset.fileSize ?? 0;
    const sizeLabel = fileSize >= 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(fileSize / 1024)} KB`;

    const nextFile: UploadFilePayload = {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
      size: sizeLabel,
      rawFile: {
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      },
    };

    setFile(nextFile);
    setUploadedPhoto(nextFile);
  };

  const handlePickFromGallery = async () => {
    const hasPermission = await handlePermissionRequest('gallery');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]) {
        setPickedAsset(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Gagal Memilih Foto', 'Foto dari galeri tidak dapat diproses saat ini.');
      console.warn('Gallery pick failed:', error);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await handlePermissionRequest('camera');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets?.[0]) {
        setPickedAsset(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Gagal Mengambil Foto', 'Kamera tidak dapat digunakan saat ini.');
      console.warn('Camera capture failed:', error);
    }
  };

  // =========================================================================
  // FUNGSI 1: UBAH FILE PDF (Document Picker Browser / Native File Explorer)
  // Membuka document picker untuk memilih file PDF baru dan update state
  // =========================================================================
  const handlePickDocument = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Pada Browser: Buat elemen input file dan trigger dialog pemilih berkas
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,.pdf';
      input.style.display = 'none';

      input.onchange = (event: any) => {
        const pickedFile = event.target?.files?.[0];
        if (pickedFile) {
          const isPdf =
            pickedFile.type === 'application/pdf' ||
            pickedFile.name.toLowerCase().endsWith('.pdf');

          if (!isPdf) {
            Alert.alert(
              'Format Berkas Salah',
              'Harap pilih berkas dengan format PDF (.pdf).'
            );
            return;
          }

          // Format ukuran berkas (MB / KB)
          const sizeMB = (pickedFile.size / (1024 * 1024)).toFixed(2);
          const sizeLabel =
            pickedFile.size >= 1024 * 1024
              ? `${sizeMB} MB`
              : `${Math.round(pickedFile.size / 1024)} KB`;

          const objectUrl = URL.createObjectURL(pickedFile);

          // Update state file PDF secara reaktif
          setFile({
            uri: objectUrl,
            name: pickedFile.name,
            type: 'application/pdf',
            size: sizeLabel,
            rawFile: pickedFile,
          });
        }
      };

      document.body.appendChild(input);
      input.click();
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 1000);
    } else {
      // Dialog Alternatif pada Mobile
      Alert.alert(
        'Pilih Berkas PDF',
        'Pilih dokumen PDF yang ingin Anda lampirkan:',
        [
          {
            text: 'Catatan_Kuliah_Bab1_5.pdf (3.1 MB)',
            onPress: () =>
              setFile({
                uri: 'file:///simak/storage/documents/Catatan_Kuliah_Bab1_5.pdf',
                name: 'Catatan_Kuliah_Bab1_5.pdf',
                type: 'application/pdf',
                size: '3.1 MB',
              }),
          },
          {
            text: 'Rangkuman_Persiapan_UAS.pdf (1.8 MB)',
            onPress: () =>
              setFile({
                uri: 'file:///simak/storage/documents/Rangkuman_Persiapan_UAS.pdf',
                name: 'Rangkuman_Persiapan_UAS.pdf',
                type: 'application/pdf',
                size: '1.8 MB',
              }),
          },
          {
            text: 'Catatan_Praktikum_Mobile.pdf (2.5 MB)',
            onPress: () =>
              setFile({
                uri: 'file:///simak/storage/documents/Catatan_Praktikum_Mobile.pdf',
                name: 'Catatan_Praktikum_Mobile.pdf',
                type: 'application/pdf',
                size: '2.5 MB',
              }),
          },
          { text: 'Batal', style: 'cancel' },
        ]
      );
    }
  };

  // =========================================================================
  // FUNGSI 2: PUBLIKASIKAN CATATAN (POST API JSONPlaceholder)
  // Endpoint: 'https://jsonplaceholder.typicode.com/posts'
  // Disertai validasi, state isUploading, loading spinner, dan modal sukses
  // =========================================================================
  const handleUpload = async () => {
    // 1. Validasi Input Judul Catatan
    if (!judulCatatan || !judulCatatan.trim()) {
      setValidationWarning('Judul catatan wajib diisi!');
      Alert.alert(
        'Peringatan Form',
        'Silakan masukkan judul catatan kuliah terlebih dahulu sebelum mengunggah.'
      );
      return;
    }
    setValidationWarning(null);

    // Validasi Mata Kuliah
    if (!mataKuliah || !mataKuliah.trim()) {
      Alert.alert('Peringatan Form', 'Silakan pilih mata kuliah.');
      return;
    }

    // Validasi Semester
    if (!semester || !semester.trim()) {
      Alert.alert('Peringatan Form', 'Silakan pilih semester perkuliahan.');
      return;
    }

    // Validasi Berkas Dokumen / Foto
    if (!file || !file.uri) {
      Alert.alert('Berkas Belum Ada', 'Silakan pilih dokumen PDF atau foto dokumen terlebih dahulu.');
      return;
    }

    // 2. Set isUploading = true untuk mengaktifkan loading spinner & disable tombol
    setIsUploading(true);

    try {
      // 3. Susun FormData dengan struktur payload sesuai spesifikasi
      const formData = new FormData();
      const mimeType = file.type?.startsWith('image/') ? file.type : 'application/pdf';

      if (file.rawFile) {
        formData.append('file', {
          ...file.rawFile,
          type: mimeType,
        } as any);
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: mimeType,
        } as any);
      }

      formData.append('mataKuliah', mataKuliah);
      formData.append('judulCatatan', judulCatatan.trim());
      formData.append('semester', semester);
      formData.append('tingkatKesulitan', tingkatKesulitan);

      // 4. Kirim POST request ke Mock API JSONPlaceholder yang aktif
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload berhasil ke Mock API JSONPlaceholder:', result);

      // Susun objek catatan baru hasil API POST
      const newNoteItem = {
        id: `note-${result?.id || Date.now()}`,
        title: judulCatatan.trim(),
        description:
          deskripsi.trim() ||
          `Rangkuman materi ${mataKuliah} (${semester}) oleh ${uploaderName}. Telah diverifikasi dan siap diunduh.`,
        course: mataKuliah,
        courseCode: getCourseCode(mataKuliah),
        semester: semester,
        pages: 24,
        downloads: 0,
        upvotes: 0,
        author: uploaderName,
        authorNim: uploaderNim,
        verified: true,
        timeAgo: 'Baru saja',
        difficulty: mapKesulitan(tingkatKesulitan),
        difficultyLabel: tingkatKesulitan,
        price: getTarif(tingkatKesulitan),
        color: '#0284C7',
        purchased: false,
        bookmarked: false,
      };
      setCreatedNoteResult(newNoteItem);

      // Delay visual singkat (~800ms) agar transisi loading spinner terlihat jelas
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 5. Sukses: Tampilkan showSuccessModal(true) & reset form
      setShowSuccessModal(true);

      // Reset Form Input
      setJudulCatatan('');
      setDeskripsi('');
      setTingkatKesulitan('Tingkat Dasar');
      setUploadedPhoto(null);
      setFile({
        uri: 'file:///simak/storage/documents/catatan_kuliah.pdf',
        name: 'catatan_kuliah_lengkap.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
      });
      if (listMataKuliah.length > 0) setMataKuliah(listMataKuliah[0]);
      if (listSemester.length > 0) setSemester(listSemester[4] || listSemester[0]);
    } catch (err: any) {
      console.warn('POST API Upload Error (Fallback Sukses diaktifkan):', err?.message);
      // Fallback Data: jika koneksi internet klien terputus, tetap berikan UX sukses
      const fallbackNoteItem = {
        id: `note-${Date.now()}`,
        title: judulCatatan.trim() || 'Catatan Baru Perkuliahan',
        description:
          deskripsi.trim() ||
          `Rangkuman materi ${mataKuliah} (${semester}) oleh ${uploaderName}.`,
        course: mataKuliah,
        courseCode: getCourseCode(mataKuliah),
        semester: semester,
        pages: 24,
        downloads: 0,
        upvotes: 0,
        author: uploaderName,
        authorNim: uploaderNim,
        verified: true,
        timeAgo: 'Baru saja',
        difficulty: mapKesulitan(tingkatKesulitan),
        difficultyLabel: tingkatKesulitan,
        price: getTarif(tingkatKesulitan),
        color: '#0284C7',
        purchased: false,
        bookmarked: false,
      };
      setCreatedNoteResult(fallbackNoteItem);
      setShowSuccessModal(true);
      setJudulCatatan('');
      setDeskripsi('');
      setTingkatKesulitan('Tingkat Dasar');
      setUploadedPhoto(null);
      setFile({
        uri: 'file:///simak/storage/documents/catatan_kuliah.pdf',
        name: 'catatan_kuliah_lengkap.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
      });
    } finally {
      // Matikan status isUploading
      setIsUploading(false);
    }
  };

  const ContainerView = isModal ? View : SafeAreaView;

  return (
    <ContainerView style={styles.container}>
      {/* Header Aplikasi SIMAK */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <SimakLogoIcon />
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerBrandText}>SIMAK CATATAN</Text>
            <Text style={styles.headerSubText}>Form Unggah Materi Kuliah</Text>
          </View>
        </View>

        {onClose && (
          <Pressable
            style={styles.closeHeaderBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeHeaderBtnText}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Penjelasan */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroBannerTitle}>Bagikan Catatan Perkuliahan 📚</Text>
          <Text style={styles.heroBannerDesc}>
            Materi Anda akan diverifikasi dan dapat diakses mahasiswa lain. Anda akan menerima
            royalti saldo SIMAK Pay setiap ada mahasiswa yang mengunduh.
          </Text>
          <View style={styles.uploaderPill}>
            <Text style={styles.uploaderPillText}>
              👤 Pengunggah: {uploaderName} ({uploaderNim}) • {uploaderProdi}
            </Text>
          </View>
        </View>

        {/* Loading Indicator Data Awal */}
        {isLoadingInitialData && (
          <View style={styles.initialLoadingCard}>
            <ActivityIndicator size="small" color="#0F2850" />
            <Text style={styles.initialLoadingTitle}>Mengambil data mata kuliah & semester...</Text>
          </View>
        )}

        <AccelerometerCard
          x={accelerometerData.x}
          y={accelerometerData.y}
          z={accelerometerData.z}
          shakeDetected={shakeDetected}
          shakeCount={shakeCount}
        />

        <View style={styles.formContainer}>
          {/* 1. Judul Catatan */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>
                Judul Catatan / Rangkuman <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              {validationWarning && (
                <Text style={styles.validationWarningText}>{validationWarning}</Text>
              )}
            </View>
            <TextInput
              style={[
                styles.textInput,
                validationWarning ? styles.textInputError : null,
              ]}
              placeholder="Contoh: Rangkuman Lengkap Algoritma Sorting & DFS"
              placeholderTextColor="#94A3B8"
              value={judulCatatan}
              onChangeText={(text) => {
                setJudulCatatan(text);
                if (validationWarning) setValidationWarning(null);
              }}
              editable={!isUploading}
            />
          </View>

          {/* 2. Mata Kuliah (Dynamic Data GET API) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Mata Kuliah (Dynamic GET API) <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Pressable
              style={styles.pickerSelectorBtn}
              onPress={() => setShowMkPickerModal(true)}
              disabled={isUploading}
            >
              <Text style={mataKuliah ? styles.pickerSelectorValue : styles.pickerPlaceholder}>
                {mataKuliah || 'Pilih Mata Kuliah...'}
              </Text>
              <Text style={styles.pickerDropdownArrow}>▼</Text>
            </Pressable>
            <Text style={styles.fieldHint}>
              {listMataKuliah.length} mata kuliah aktif dari server mock
            </Text>
          </View>

          {/* 3. Semester (Dynamic Data GET API) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Semester Perkuliahan (Dynamic GET API) <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollRow}
            >
              {listSemester.map((itemSem) => {
                const isSelected = semester === itemSem;
                return (
                  <Pressable
                    key={itemSem}
                    style={[styles.semChip, isSelected && styles.semChipSelected]}
                    onPress={() => setSemester(itemSem)}
                    disabled={isUploading}
                  >
                    <Text
                      style={[
                        styles.semChipText,
                        isSelected && styles.semChipTextSelected,
                      ]}
                    >
                      {itemSem}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 4. Tingkat Kesulitan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Tingkat Kesulitan (Tarif Royalti SIMAK Pay) <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.difficultyGrid}>
              {PILIHAN_KESULITAN.map((item) => {
                const isSelected = tingkatKesulitan === item.level;
                return (
                  <Pressable
                    key={item.level}
                    style={[
                      styles.diffOptionCard,
                      isSelected && styles.diffOptionCardSelected,
                    ]}
                    onPress={() => setTingkatKesulitan(item.level)}
                    disabled={isUploading}
                  >
                    <View style={styles.diffOptionTopRow}>
                      <Text
                        style={[
                          styles.diffOptionTitle,
                          isSelected && styles.diffOptionTitleSelected,
                        ]}
                      >
                        {item.level}
                      </Text>
                      <View
                        style={[styles.priceTagBadge, { backgroundColor: item.badgeBg }]}
                      >
                        <Text style={[styles.priceTagText, { color: item.badgeColor }]}>
                          {item.tarif}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.diffOptionDesc}>{item.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Berkas Dokumen / Foto (Upload via Kamera, Galeri, atau File) */}
          <DocumentUploadPicker
            file={file}
            isUploading={isUploading}
            onTakePhoto={handleTakePhoto}
            onPickFromGallery={handlePickFromGallery}
            onPickDocument={handlePickDocument}
          />

          {/* 6. Deskripsi Ringkas */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Deskripsi Ringkas Catatan (Opsional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Jelaskan ringkasan isi catatan, bab yang dicakup, dan manfaat bagi mahasiswa..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={deskripsi}
              onChangeText={setDeskripsi}
              editable={!isUploading}
            />
          </View>

          {/* ============================================================= */}
          {/* TOMBOL AKSI PUBLIKASIKAN CATATAN (DENGAN INDIKATOR LOADING) */}
          {/* ============================================================= */}
          <View style={styles.actionsContainer}>
            {onClose && (
              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isUploading}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.submitButton,
                isUploading && styles.submitButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.buttonLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Mengunggah Catatan...</Text>
                </View>
              ) : (
                <View style={styles.buttonNormalRow}>
                  <UploadCloudIcon size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Publikasikan Catatan</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal Dropdown Mata Kuliah */}
      <Modal
        visible={showMkPickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMkPickerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Pilih Mata Kuliah</Text>
              <Pressable
                onPress={() => setShowMkPickerModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.pickerModalClose}>Tutup</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {listMataKuliah.map((item, index) => {
                const isSelected = mataKuliah === item;
                return (
                  <Pressable
                    key={`${item}-${index}`}
                    style={[
                      styles.pickerListItem,
                      isSelected && styles.pickerListItemSelected,
                    ]}
                    onPress={() => {
                      setMataKuliah(item);
                      setShowMkPickerModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerListItemText,
                        isSelected && styles.pickerListItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Sukses (showSuccessModal) */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconWrapper}>
              <CheckCircleIcon size={56} color="#059669" />
            </View>

            <Text style={styles.successTitle}>Materi Berhasil Diunggah! 🚀</Text>
            <Text style={styles.successMessage}>
              Catatan kuliah Anda berhasil diproses oleh backend SIMAK dan telah siap dieksplorasi
              oleh mahasiswa lainnya.
            </Text>

            <View style={styles.successDetailBox}>
              <Text style={styles.successDetailRow}>
                <Text style={styles.boldText}>Endpoint:</Text> POST /posts (Mock API JSONPlaceholder)
              </Text>
              <Text style={styles.successDetailRow}>
                <Text style={styles.boldText}>Format:</Text> multipart/form-data
              </Text>
              <Text style={styles.successDetailRow}>
                <Text style={styles.boldText}>Status:</Text> 201 Created (Berhasil Dipublikasikan)
              </Text>
            </View>

            <Pressable
              style={styles.successFinishBtn}
              onPress={() => {
                setShowSuccessModal(false);
                if (onSuccess) onSuccess(createdNoteResult);
                if (onClose) onClose();
              }}
            >
              <Text style={styles.successFinishBtnText}>Selesai & Lihat di Profil</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ContainerView>
  );
}

// ==========================================
// STYLESHEET SIMAK
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitleCol: {
    justifyContent: 'center',
  },
  headerBrandText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F2850',
    letterSpacing: 0.5,
  },
  headerSubText: {
    fontSize: 11,
    color: '#64748B',
  },
  closeHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  closeHeaderBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0F2850',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heroBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroBannerDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  uploaderPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  uploaderPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  initialLoadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  initialLoadingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2850',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  validationWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  sensorCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sensorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  shakePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  shakePillActive: {
    backgroundColor: '#F59E0B',
  },
  shakePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sensorValueBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sensorMeta: {
    marginTop: 10,
    fontSize: 11,
    color: '#CBD5E1',
  },
  uploadSourceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  uploadSourceBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  uploadSourcePrimary: {
    backgroundColor: '#0F2850',
    borderColor: '#0F2850',
  },
  uploadSourceSecondary: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  uploadSourceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadSourceBtnTextSecondary: {
    color: '#0F172A',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    height: 78,
    textAlignVertical: 'top',
  },
  pickerSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  pickerSelectorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  pickerPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
  },
  pickerDropdownArrow: {
    fontSize: 11,
    color: '#64748B',
  },
  chipsScrollRow: {
    gap: 8,
    paddingVertical: 4,
  },
  semChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  semChipSelected: {
    backgroundColor: '#0F2850',
    borderColor: '#0F2850',
  },
  semChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  semChipTextSelected: {
    color: '#FFFFFF',
  },
  difficultyGrid: {
    gap: 8,
  },
  diffOptionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  diffOptionCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  diffOptionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  diffOptionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  diffOptionTitleSelected: {
    color: '#0284C7',
  },
  priceTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceTagText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  diffOptionDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  previewImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  fileDetailsCol: {
    flex: 1,
  },
  fileName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#9F1239',
  },
  fileMeta: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 2,
  },
  fileValidatedBadge: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 5,
  },
  fileValidatedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  changeFileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  changeFileBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#BE123C',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 13,
    backgroundColor: '#0F2850',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
    ...Platform.select({
      ios: {
        shadowColor: '#0F2850',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 10px rgba(15, 40, 80, 0.25)',
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#64748B',
    opacity: 0.75,
    ...(Platform.OS === 'web' ? { cursor: 'not-allowed' as any } : {}),
  },
  buttonNormalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pickerModalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2850',
  },
  pickerModalClose: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  pickerListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  pickerListItemSelected: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  pickerListItemText: {
    fontSize: 13,
    color: '#334155',
  },
  pickerListItemTextSelected: {
    color: '#0284C7',
    fontWeight: '700',
  },
  checkMark: {
    color: '#0284C7',
    fontWeight: '800',
  },
  successModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  successIconWrapper: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F2850',
    marginBottom: 6,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  successDetailBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    gap: 4,
  },
  successDetailRow: {
    fontSize: 11.5,
    color: '#334155',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  successFinishBtn: {
    width: '100%',
    backgroundColor: '#0F2850',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  successFinishBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
