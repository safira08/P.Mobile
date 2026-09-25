import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// ==========================================
// TIPE DATA & TINGKAT KESULITAN MATERI
// ==========================================
export type DifficultyLevel = 'dasar' | 'menengah' | 'sulit' | 'eksklusif';

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  semester: string;
  pages: number;
  downloads: string | number;
  upvotes: number;
  author: string;
  authorNim?: string;
  verified: boolean;
  timeAgo: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  price: number; // Minimal Rp10.000,00 sesuai permintaan user
  color: string;
  purchased?: boolean;
  bookmarked?: boolean;
}

// Konfigurasi Tarif Sesuai Tingkat Kesulitan (Paling Murah Rp10.000,00)
export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; price: number; color: string; badgeBg: string; description: string }
> = {
  dasar: {
    label: 'Tingkat Dasar',
    price: 10000, // Tarif terendah Rp10.000,00
    color: '#059669',
    badgeBg: '#D1FAE5',
    description: 'Konsep dasar, pengantar materi, dan catatan fundamental perkuliahan.',
  },
  menengah: {
    label: 'Tingkat Menengah',
    price: 15000,
    color: '#0284C7',
    badgeBg: '#E0F2FE',
    description: 'Rangkuman praktikum, tutorial studi kasus, dan query/sintaks lengkap.',
  },
  sulit: {
    label: 'Tingkat Sulit',
    price: 25000,
    color: '#D97706',
    badgeBg: '#FEF3C7',
    description: 'Algoritma kompleks, struktur data mendalam, dan analisis matematis.',
  },
  eksklusif: {
    label: 'Tingkat Eksklusif',
    price: 35000,
    color: '#7C3AED',
    badgeBg: '#EDE9FE',
    description: 'Paket komprehensif persiapan UAS, kisi-kisi teruji & master cheat sheet.',
  },
};

// ==========================================
// SVG ICONS & AVATAR ILLUSTRATION (TANPA FOTO ORANG)
// ==========================================

// 1. Clean Stylized Student Vector Avatar (Bukan foto orang)
function StudentVectorAvatar({ size = 70 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="avatarBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3A5F" />
          <Stop offset="100%" stopColor="#0F2850" />
        </LinearGradient>
      </Defs>
      {/* Background Bulat */}
      <Circle cx="50" cy="50" r="48" fill="url(#avatarBgGrad)" stroke="#E0E7FF" strokeWidth="3" />
      {/* Efek Cahaya Halus */}
      <Circle cx="50" cy="50" r="45" fill="#3B82F6" opacity="0.15" />
      {/* Baju Polo Navy Mahasiswa */}
      <Path
        d="M20 95 C 22 75, 35 68, 50 68 C 65 68, 78 75, 80 95 Z"
        fill="#1E293B"
      />
      {/* Kerah Baju */}
      <Path d="M42 68 L50 78 L58 68 Z" fill="#F8FAFC" />
      {/* Tali Lanyard UMM Biru */}
      <Path d="M45 68 L48 95" stroke="#38BDF8" strokeWidth="2.5" />
      <Path d="M55 68 L52 95" stroke="#38BDF8" strokeWidth="2.5" />
      {/* Badge Mahasiswa Mini */}
      <Rect x="46" y="82" width="8" height="11" rx="1.5" fill="#F8FAFC" stroke="#0284C7" strokeWidth="0.8" />
      {/* Leher */}
      <Rect x="44" y="54" width="12" height="16" rx="4" fill="#FCD34D" />
      {/* Wajah / Kepala */}
      <Circle cx="50" cy="44" r="18" fill="#FDE68A" />
      {/* Rambut Mahasiswa Rapi */}
      <Path
        d="M32 40 C 32 26, 68 26, 68 40 C 68 36, 66 30, 50 30 C 36 30, 32 35, 32 40 Z"
        fill="#0F172A"
      />
      {/* Kacamata Mahasiswa Keren */}
      <Rect x="38" y="41" width="9" height="7" rx="2" stroke="#1E293B" strokeWidth="1.8" fill="#E2E8F0" opacity="0.6" />
      <Rect x="53" y="41" width="9" height="7" rx="2" stroke="#1E293B" strokeWidth="1.8" fill="#E2E8F0" opacity="0.6" />
      <Path d="M47 44 L53 44" stroke="#1E293B" strokeWidth="1.5" />
      {/* Senyuman */}
      <Path d="M46 53 Q50 56 54 53" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// 2. Mini Header Avatar
function MiniHeaderAvatar() {
  return (
    <View style={styles.miniAvatarWrapper}>
      <StudentVectorAvatar size={34} />
    </View>
  );
}

// 3. Icon Dokumen SIMAK Mini
function SimakMiniIcon() {
  return (
    <Svg width={24} height={28} viewBox="0 0 30 36" fill="none">
      <Rect x="1" y="2" width="26" height="32" rx="5.5" fill="#1E3A5F" />
      <Rect x="16" y="0" width="8.5" height="11" rx="2.2" fill="#F97316" />
      <Rect x="6" y="13" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="18" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="23" width="9.5" height="2.2" rx="1.1" fill="#FFFFFF" />
    </Svg>
  );
}

// 4. Icon Lonceng Notifikasi
function BellIcon({ size = 20, color = '#1F2937' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21A2 2 0 0 1 10.27 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 5. Bottom Nav Icon: Home / Beranda
function HomeNavIcon({ size = 22, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 6. Bottom Nav Icon: Cari MK (Topi Wisuda)
function GraduationCapNavIcon({ size = 22, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill={color} />
      <Path
        d="M5 13.18V17.5C5 19.99 8.13 22 12 22C15.87 22 19 19.99 19 17.5V13.18L12 17L5 13.18Z"
        fill={color}
      />
    </Svg>
  );
}

// 7. Bottom Nav Icon: Bookmark
function BookmarkNavIcon({ size = 20, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 8. Bottom Nav Icon: Profil
function ProfileNavIcon({ size = 22, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 9. Icon Thumbs Up
function ThumbsUpIcon({ size = 15, color = '#F97316' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 9V5A3 3 0 0 0 11 2L7 11V22H18.28A2 2 0 0 0 20.24 20.38L21.84 12.38A2 2 0 0 0 19.88 10H14Z"
        fill={color}
      />
      <Path d="M7 22H4A2 2 0 0 1 2 20V13A2 2 0 0 1 4 11H7" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// 10. Icon Unduhan / Download
function DownloadIcon({ size = 15, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 10L12 15L17 10M12 15V3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 11. Icon Catatan (Double Document)
function NotesStackIcon({ size = 20, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="8" y="2" width="13" height="17" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M4 6H3C2.44772 6 2 6.44772 2 7V21C2 21.5523 2.44772 22 3 22H16C16.5523 22 17 21.5523 17 21V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 7H17M12 11H17M12 15H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// 12. Icon Terverifikasi (Checkmark)
function VerifiedCheckIcon({ size = 13, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 13. Icon Analytics / Chart
function ChartIcon({ size = 16, color = '#4B5563' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3V21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 16L12 10L16 14L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 14. Icon Edit / Square Pen
function EditPenIcon({ size = 16, color = '#4B5563' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5A2.12132 2.12132 0 0 1 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 15. Icon Gembok / Kunci Pembayaran
function LockIcon({ size = 14, color = '#B45309' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M7 11V7A5 5 0 0 1 17 7V11" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// ==========================================
// DATA UTAMA CATATAN & RANGKUMAN KAMPUS
// ==========================================
const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Rangkuman Eksklusif: Binary Search Tree, AVL Tree & Graph Traversal',
    description:
      'Catatan komprehensif struktur data pohon seimbang dan implementasi praktis algoritma DFS/BFS beserta studi kasus ujian.',
    course: 'Struktur Data & Algoritma',
    courseCode: 'CS-201',
    semester: 'Semester 3',
    pages: 36,
    downloads: '1.2k',
    upvotes: 342,
    author: 'martin',
    authorNim: '2206812390',
    verified: true,
    timeAgo: '3 hari lalu',
    difficulty: 'sulit',
    difficultyLabel: 'Tingkat Sulit',
    price: 25000,
    color: '#0284C7',
    purchased: false,
    bookmarked: false,
  },
  {
    id: 'note-2',
    title: 'Modul Praktikum Pemrograman Mobile: Expo SDK 57 & React Native',
    description:
      'Langkah instalasi, panduan komponen native, state management, file-based routing dan pengujian aplikasi di Android/iOS.',
    course: 'Pemrograman Mobile',
    courseCode: 'CS-302',
    semester: 'Semester 4',
    pages: 28,
    downloads: '452',
    upvotes: 184,
    author: 'martin',
    authorNim: '2206812390',
    verified: true,
    timeAgo: '1 minggu lalu',
    difficulty: 'dasar',
    difficultyLabel: 'Tingkat Dasar (Termurah)',
    price: 10000, // Harga paling murah Rp10.000,00
    color: '#1E3A5F',
    purchased: false,
    bookmarked: true,
  },
  {
    id: 'note-3',
    title: 'Panduan Subnetting CIDR, VLSM & Konfigurasi VLAN Cisco Packet Tracer',
    description:
      'Simulasi topologi jaringan komputer lengkap dengan tabel subnetting cepat dan command line interface switch Cisco.',
    course: 'Jaringan Komputer',
    courseCode: 'IF-204',
    semester: 'Semester 4',
    pages: 34,
    downloads: '520',
    upvotes: 219,
    author: 'martin',
    authorNim: '2206812390',
    verified: true,
    timeAgo: '2 minggu lalu',
    difficulty: 'menengah',
    difficultyLabel: 'Tingkat Menengah',
    price: 15000,
    color: '#0D9488',
    purchased: false,
    bookmarked: false,
  },
  {
    id: 'note-4',
    title: 'Rangkuman Normalisasi Basis Data 1NF-BCNF & SQL Query Optimization',
    description:
      'Studi kasus perancangan skema database relasional universitas, indexing, serta benchmarking query join berkecepatan tinggi.',
    course: 'Basis Data Terdistribusi',
    courseCode: 'BD-103',
    semester: 'Semester 3',
    pages: 24,
    downloads: '388',
    upvotes: 165,
    author: 'martin',
    authorNim: '2206812390',
    verified: true,
    timeAgo: '3 minggu lalu',
    difficulty: 'menengah',
    difficultyLabel: 'Tingkat Menengah',
    price: 15000,
    color: '#0284C7',
    purchased: false,
    bookmarked: false,
  },
  {
    id: 'note-5',
    title: 'Master Cheat Sheet: Machine Learning, CNN, & Deep Neural Network',
    description:
      'Rumus matematis backpropagation, konfigurasi layer konvolusi, loss function, dan source code PyTorch siap pakai.',
    course: 'Kecerdasan Buatan',
    courseCode: 'AI-401',
    semester: 'Semester 5',
    pages: 42,
    downloads: '2.1k',
    upvotes: 610,
    author: 'martin',
    authorNim: '2206812390',
    verified: true,
    timeAgo: '1 bulan lalu',
    difficulty: 'eksklusif',
    difficultyLabel: 'Tingkat Eksklusif',
    price: 35000,
    color: '#7C3AED',
    purchased: false,
    bookmarked: false,
  },
];

// Format Rupiah Indonesia
function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

export default function DashboardScreen() {
  const router = useRouter();

  // Active Bottom Navigation Tab: 'beranda' | 'carimk' | 'unggah' | 'bookmark' | 'profil'
  // Default dibuka di 'profil' agar langsung identik persis dengan gambar screenshot user!
  const [activeTab, setActiveTab] = useState<'beranda' | 'carimk' | 'unggah' | 'bookmark' | 'profil'>('profil');

  // Sub-tab di Halaman Profil: 'unggahan' | 'aktivitas' | 'review'
  const [profileSubTab, setProfileSubTab] = useState<'unggahan' | 'aktivitas' | 'review'>('unggahan');

  // State Daftar Catatan
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);

  // State Saldo Mahasiswa SIMAK Pay (bisa dipakai untuk beli unduhan materi)
  const [userBalance, setUserBalance] = useState<number>(65000);

  // State Modal Pembayaran Unduh Materi Berbayar
  const [selectedNoteForPurchase, setSelectedNoteForPurchase] = useState<NoteItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'saldo' | 'qris' | 'va'>('saldo');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // State Modal Unggah Materi Baru (Tombol Tengah Navigasi)
  const [isUploadModalVisible, setIsUploadModalVisible] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourse, setUploadCourse] = useState('Pemrograman Mobile');
  const [uploadCourseCode, setUploadCourseCode] = useState('CS-302');
  const [uploadDifficulty, setUploadDifficulty] = useState<DifficultyLevel>('dasar');
  const [uploadPages, setUploadPages] = useState('20');
  const [uploadDesc, setUploadDesc] = useState('');

  // Filter di Beranda
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'semua' | DifficultyLevel>('semua');

  // ==========================================
  // LOGIKA PEMBAYARAN & UNDUH MATERI BERBAYAR
  // (Harus Berbayar Berdasarkan Tingkat Kesulitan, Paling Murah Rp10.000,00)
  // ==========================================
  const handleInitiateDownload = (note: NoteItem) => {
    if (note.purchased) {
      Alert.alert(
        'Catatan Telah Dibeli',
        `Materi "${note.title}" sudah Anda beli sebelumnya. Mengunduh ulang berkas PDF ke penyimpanan ponsel Anda...`,
        [
          {
            text: 'Buka PDF Sekarang',
            onPress: () => Alert.alert('Sukses', `Berkas PDF "${note.title}.pdf" dibuka di penampil dokumen.`),
          },
          { text: 'Selesai' },
        ]
      );
      return;
    }

    // Tampilkan Modal Pembayaran SIMAK Pay Berbayar
    setSelectedNoteForPurchase(note);
  };

  const handleConfirmPurchase = () => {
    if (!selectedNoteForPurchase) return;

    const price = selectedNoteForPurchase.price;

    if (paymentMethod === 'saldo' && userBalance < price) {
      Alert.alert(
        'Saldo Tidak Mencukupi',
        `Saldo SIMAK Pay Anda (${formatRupiah(userBalance)}) tidak cukup untuk membayar materi ${formatRupiah(price)}. Silakan pilih metode QRIS atau Top Up Saldo.`,
        [
          { text: 'Gunakan QRIS', onPress: () => setPaymentMethod('qris') },
          { text: 'Tutup', style: 'cancel' },
        ]
      );
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      if (paymentMethod === 'saldo') {
        setUserBalance((prev) => prev - price);
      }

      // Tandai catatan sebagai telah dibeli & tambah unduhan
      setNotes((prevNotes) =>
        prevNotes.map((n) => {
          if (n.id === selectedNoteForPurchase.id) {
            const currentDl = typeof n.downloads === 'number' ? n.downloads : parseInt(n.downloads) || 1200;
            return {
              ...n,
              purchased: true,
              downloads: currentDl + 1,
            };
          }
          return n;
        })
      );

      const boughtTitle = selectedNoteForPurchase.title;
      setSelectedNoteForPurchase(null);

      Alert.alert(
        'Pembayaran Berhasil! 🎉',
        `Anda berhasil membeli dan mengunduh "${boughtTitle}" seharga ${formatRupiah(price)}.\n\nBerkas PDF telah tersimpan di memori perangkat dan dapat diakses selamanya di tab Bookmark.`,
        [
          {
            text: 'Lihat di Bookmark',
            onPress: () => setActiveTab('bookmark'),
          },
          { text: 'Oke' },
        ]
      );
    }, 1200);
  };

  // ==========================================
  // LOGIKA UNGGAH MATERI BARU OLEH MAHASISWA
  // ==========================================
  const handlePublishUpload = () => {
    if (!uploadTitle.trim()) {
      Alert.alert('Form Belum Lengkap', 'Silakan masukkan judul catatan/rangkuman kuliah.');
      return;
    }

    const price = DIFFICULTY_CONFIG[uploadDifficulty].price;

    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: uploadTitle,
      description: uploadDesc.trim() || 'Rangkuman lengkap materi kuliah dari mahasiswa UMM.',
      course: uploadCourse,
      courseCode: uploadCourseCode,
      semester: 'Semester 5',
      pages: parseInt(uploadPages) || 18,
      downloads: 0,
      upvotes: 1,
      author: 'martin',
      authorNim: '2206812390',
      verified: true,
      timeAgo: 'Baru saja',
      difficulty: uploadDifficulty,
      difficultyLabel: DIFFICULTY_CONFIG[uploadDifficulty].label,
      price: price,
      color: DIFFICULTY_CONFIG[uploadDifficulty].color,
      purchased: true, // Pembuat otomatis punya akses
      bookmarked: false,
    };

    setNotes((prev) => [newNote, ...prev]);
    setIsUploadModalVisible(false);
    setUploadTitle('');
    setUploadDesc('');

    Alert.alert(
      'Materi Berhasil Diunggah! 🚀',
      `Catatan "${newNote.title}" berhasil dipublikasikan dengan tarif ${formatRupiah(price)} (${DIFFICULTY_CONFIG[uploadDifficulty].label}). Setiap mahasiswa lain yang mengunduh materi ini akan memberikan royalti ke akun Anda!`
    );
  };

  // Toggle Bookmark
  const handleToggleBookmark = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, bookmarked: !n.bookmarked } : n))
    );
  };

  // =========================================================================
  // RENDER KONTEN TAB: PROFIL (PERSIS SESUAI SCREENSHOT USER)
  // =========================================================================
  const renderProfileTab = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* 1. Profil Info Card (Martin) */}
        <View style={styles.profileHeroCard}>
          <View style={styles.profileHeroRow}>
            {/* Avatar Stylized Vector (Tanpa foto orang asli) */}
            <StudentVectorAvatar size={74} />

            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>martin</Text>
              <Text style={styles.profileNim}>NIM 2206812390</Text>
              <Text style={styles.profileMajor}>S1 Teknik Informatika</Text>
              <Text style={styles.profileUniv}>Universitas Muhammadiyah Malang</Text>
            </View>
          </View>

          {/* Badges Row: Semester 5 (Aktif) & Reguler 2024 */}
          <View style={styles.profileBadgesRow}>
            <View style={styles.semesterBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.semesterBadgeText}>Semester 5 (Aktif)</Text>
            </View>

            <View style={styles.regulerBadge}>
              <GraduationCapNavIcon size={14} color="#0284C7" />
              <Text style={styles.regulerBadgeText}>Reguler 2024</Text>
            </View>
          </View>
        </View>

        {/* 2. Card Top Kontributor Gold & XP Progress */}
        <View style={styles.contributorCard}>
          <View style={styles.contributorHeaderRow}>
            <View style={styles.contributorTitleRow}>
              <View style={styles.medalSquircle}>
                <Text style={styles.medalEmoji}>🏅</Text>
              </View>
              <View style={styles.contributorTextCol}>
                <View style={styles.contributorNameRow}>
                  <Text style={styles.contributorTitle}>Top Kontributor Gold</Text>
                  <Text style={styles.contributorInlineMedal}> 🏅</Text>
                </View>
                <Text style={styles.contributorSubtitle}>Pustakawan Kampus Tk. 4</Text>
              </View>
            </View>

            <View style={styles.xpCol}>
              <Text style={styles.xpNumber}>1.420</Text>
              <Text style={styles.xpLabel}>Poin XP</Text>
            </View>
          </View>

          {/* Progress Bar XP */}
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressNextText}>Menuju Tk. 5 (Arsiparis Utama)</Text>
            <Text style={styles.progressCountText}>820 / 2.000 XP</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '41%' }]} />
          </View>
        </View>

        {/* 3. Stats Row (3 Rounded Cards: Catatan, Unduhan, Upvotes) */}
        <View style={styles.statsThreeRow}>
          {/* Card 1: 12 Catatan */}
          <View style={styles.statMiniCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <NotesStackIcon size={18} color="#0284C7" />
            </View>
            <Text style={styles.statMiniNumber}>{notes.length}</Text>
            <Text style={styles.statMiniLabel}>Catatan</Text>
          </View>

          {/* Card 2: 3.8k Unduhan */}
          <View style={styles.statMiniCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <DownloadIcon size={18} color="#0284C7" />
            </View>
            <Text style={styles.statMiniNumber}>3.8k</Text>
            <Text style={styles.statMiniLabel}>Unduhan</Text>
          </View>

          {/* Card 3: 892 Upvotes */}
          <View style={styles.statMiniCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFEDD5' }]}>
              <ThumbsUpIcon size={18} color="#F97316" />
            </View>
            <Text style={styles.statMiniNumber}>892</Text>
            <Text style={styles.statMiniLabel}>Upvotes</Text>
          </View>
        </View>

        {/* 4. Segmented Control / Tabs: Unggahan (12), Aktivitas, Review & Tips */}
        <View style={styles.segmentedTabsContainer}>
          <Pressable
            style={[
              styles.segmentTab,
              profileSubTab === 'unggahan' ? styles.segmentTabActive : styles.segmentTabInactive,
            ]}
            onPress={() => setProfileSubTab('unggahan')}
          >
            <Text
              style={[
                styles.segmentTabText,
                profileSubTab === 'unggahan' ? styles.segmentTabTextActive : styles.segmentTabTextInactive,
              ]}
            >
              Unggahan ({notes.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentTab,
              profileSubTab === 'aktivitas' ? styles.segmentTabActive : styles.segmentTabInactive,
            ]}
            onPress={() => setProfileSubTab('aktivitas')}
          >
            <Text
              style={[
                styles.segmentTabText,
                profileSubTab === 'aktivitas' ? styles.segmentTabTextActive : styles.segmentTabTextInactive,
              ]}
            >
              Aktivitas
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentTab,
              profileSubTab === 'review' ? styles.segmentTabActive : styles.segmentTabInactive,
            ]}
            onPress={() => setProfileSubTab('review')}
          >
            <Text
              style={[
                styles.segmentTabText,
                profileSubTab === 'review' ? styles.segmentTabTextActive : styles.segmentTabTextInactive,
              ]}
            >
              Review & Tips
            </Text>
          </Pressable>
        </View>

        {/* 5. Daftar Unggahan Dokumen & Rangkuman */}
        {profileSubTab === 'unggahan' && (
          <View style={styles.feedWrapper}>
            {notes.map((note) => {
              const diffConfig = DIFFICULTY_CONFIG[note.difficulty];
              return (
                <View key={note.id} style={styles.noteItemCard}>
                  {/* Baris Badge: CS-201, Terverifikasi, Tingkat Kesulitan & Waktu */}
                  <View style={styles.noteCardTopRow}>
                    <View style={styles.badgesGroup}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{note.courseCode}</Text>
                      </View>

                      {note.verified && (
                        <View style={styles.verifiedBadge}>
                          <VerifiedCheckIcon size={12} color="#0369A1" />
                          <Text style={styles.verifiedBadgeText}>Terverifikasi</Text>
                        </View>
                      )}

                      {/* Badge Tingkat Kesulitan Berbayar */}
                      <View style={[styles.difficultyBadge, { backgroundColor: diffConfig.badgeBg }]}>
                        <Text style={[styles.difficultyBadgeText, { color: diffConfig.color }]}>
                          {diffConfig.label} • {formatRupiah(note.price)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.timeAgoText}>{note.timeAgo}</Text>
                  </View>

                  {/* Judul Rangkuman */}
                  <Text style={styles.noteItemTitle}>{note.title}</Text>

                  {/* Deskripsi Singkat */}
                  <Text style={styles.noteItemDesc} numberOfLines={2}>
                    {note.description}
                  </Text>

                  {/* Baris Bawah: Upvotes, Unduhan, Biaya Unduh & Aksi */}
                  <View style={styles.noteCardBottomRow}>
                    <View style={styles.noteStatsGroup}>
                      <View style={styles.noteStatItem}>
                        <ThumbsUpIcon size={14} color="#EA580C" />
                        <Text style={styles.noteStatText}>{note.upvotes}</Text>
                      </View>

                      <View style={styles.noteStatItem}>
                        <DownloadIcon size={14} color="#6B7280" />
                        <Text style={styles.noteStatText}>{note.downloads}</Text>
                      </View>
                    </View>

                    {/* Tombol Unduh Berbayar Sesuai Tingkat Kesulitan */}
                    <View style={styles.noteActionsGroup}>
                      <Pressable
                        style={[
                          styles.paidDownloadBtn,
                          note.purchased ? styles.paidDownloadBtnPurchased : styles.paidDownloadBtnActive,
                        ]}
                        onPress={() => handleInitiateDownload(note)}
                      >
                        {note.purchased ? (
                          <>
                            <VerifiedCheckIcon size={13} color="#059669" />
                            <Text style={styles.paidDownloadPurchasedText}>Unduh (Milik Anda)</Text>
                          </>
                        ) : (
                          <>
                            <LockIcon size={13} color="#FFFFFF" />
                            <Text style={styles.paidDownloadText}>
                              Unduh ({formatRupiah(note.price)})
                            </Text>
                          </>
                        )}
                      </Pressable>

                      {/* Tombol Analytics & Edit */}
                      <Pressable
                        style={styles.iconSquareBtn}
                        onPress={() =>
                          Alert.alert(
                            'Statistik Dokumen',
                            `Dokumen: ${note.title}\nTotal Pembaca: 3.400+\nTotal Unduhan Berbayar: ${note.downloads}\nRating: 4.9/5.0`
                          )
                        }
                      >
                        <ChartIcon size={16} color="#475569" />
                      </Pressable>

                      <Pressable
                        style={styles.iconSquareBtn}
                        onPress={() =>
                          Alert.alert('Opsi Dokumen', 'Pilih opsi yang ingin Anda lakukan:', [
                            { text: 'Bagikan Tautan', onPress: () => Alert.alert('Tautan Tersalin') },
                            { text: 'Edit Deskripsi' },
                            { text: 'Batal', style: 'cancel' },
                          ])
                        }
                      >
                        <EditPenIcon size={16} color="#475569" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Tombol "Lihat 10 Dokumen Lainnya ->" */}
            <Pressable
              style={styles.seeMoreBtn}
              onPress={() =>
                Alert.alert(
                  'Arsip Lengkap Martin',
                  'Memuat 10 dokumen catatan kuliah lainnya dari semester 1 hingga 5.'
                )
              }
            >
              <Text style={styles.seeMoreBtnText}>Lihat 10 Dokumen Lainnya →</Text>
            </Pressable>
          </View>
        )}

        {profileSubTab === 'aktivitas' && (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>Aktivitas Terbaru</Text>
            <Text style={styles.emptyStateDesc}>
              • Kemarin: Mengunggah modul Binary Search Tree (CS-201){'\n'}
              • 3 hari lalu: Menerima 342 upvotes dari mahasiswa Informatika{'\n'}
              • 5 hari lalu: Mencapai peringkat Top Kontributor Gold 🏅
            </Text>
          </View>
        )}

        {profileSubTab === 'review' && (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>Review & Tips Belajar Martin</Text>
            <Text style={styles.emptyStateDesc}>
              "Kunci memahami Struktur Data adalah visualisasi pointer dan rekursi. Catatan yang saya buat selalu dilengkapi contoh tracing kode baris demi baris."
            </Text>
          </View>
        )}
      </View>
    );
  };

  // =========================================================================
  // RENDER KONTEN TAB: BERANDA (HOME)
  // =========================================================================
  const renderBerandaTab = () => {
    const filteredNotes = notes.filter((item) => {
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = difficultyFilter === 'semua' || item.difficulty === difficultyFilter;
      return matchQuery && matchDiff;
    });

    return (
      <View style={styles.tabContentContainer}>
        {/* Wallet / Saldo Card Mahasiswa SIMAK */}
        <View style={styles.walletCard}>
          <View style={styles.walletLeftCol}>
            <Text style={styles.walletLabel}>Saldo SIMAK Pay Mahasiswa</Text>
            <Text style={styles.walletBalance}>{formatRupiah(userBalance)}</Text>
            <Text style={styles.walletSub}>Digunakan untuk membeli & mengunduh materi kuliah</Text>
          </View>
          <Pressable
            style={styles.topUpBtn}
            onPress={() =>
              Alert.alert('Top Up SIMAK Pay', 'Pilih nominal top up saldo:', [
                {
                  text: '+ Rp25.000',
                  onPress: () => {
                    setUserBalance((b) => b + 25000);
                    Alert.alert('Top Up Berhasil', 'Saldo bertambah Rp25.000');
                  },
                },
                {
                  text: '+ Rp50.000',
                  onPress: () => {
                    setUserBalance((b) => b + 50000);
                    Alert.alert('Top Up Berhasil', 'Saldo bertambah Rp50.000');
                  },
                },
                { text: 'Batal', style: 'cancel' },
              ])
            }
          >
            <Text style={styles.topUpBtnText}>+ Isi Saldo</Text>
          </Pressable>
        </View>

        {/* Kotak Pencarian */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi kuliah, rangkuman, kode MK..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tingkat Kesulitan Berbayar */}
        <Text style={styles.filterSectionTitle}>Filter Biaya & Tingkat Kesulitan:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable
            style={[styles.filterChip, difficultyFilter === 'semua' && styles.filterChipActive]}
            onPress={() => setDifficultyFilter('semua')}
          >
            <Text style={[styles.filterChipText, difficultyFilter === 'semua' && styles.filterChipTextActive]}>
              Semua Materi
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, difficultyFilter === 'dasar' && styles.filterChipActive]}
            onPress={() => setDifficultyFilter('dasar')}
          >
            <Text style={[styles.filterChipText, difficultyFilter === 'dasar' && styles.filterChipTextActive]}>
              Dasar (Rp10.000 - Termurah)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, difficultyFilter === 'menengah' && styles.filterChipActive]}
            onPress={() => setDifficultyFilter('menengah')}
          >
            <Text style={[styles.filterChipText, difficultyFilter === 'menengah' && styles.filterChipTextActive]}>
              Menengah (Rp15.000)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, difficultyFilter === 'sulit' && styles.filterChipActive]}
            onPress={() => setDifficultyFilter('sulit')}
          >
            <Text style={[styles.filterChipText, difficultyFilter === 'sulit' && styles.filterChipTextActive]}>
              Sulit (Rp25.000)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, difficultyFilter === 'eksklusif' && styles.filterChipActive]}
            onPress={() => setDifficultyFilter('eksklusif')}
          >
            <Text style={[styles.filterChipText, difficultyFilter === 'eksklusif' && styles.filterChipTextActive]}>
              Eksklusif (Rp35.000)
            </Text>
          </Pressable>
        </ScrollView>

        {/* Daftar Materi Beranda */}
        <View style={styles.feedWrapper}>
          {filteredNotes.map((note) => {
            const diffConfig = DIFFICULTY_CONFIG[note.difficulty];
            return (
              <View key={note.id} style={styles.noteItemCard}>
                <View style={styles.noteCardTopRow}>
                  <View style={styles.badgesGroup}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>{note.courseCode}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: diffConfig.badgeBg }]}>
                      <Text style={[styles.difficultyBadgeText, { color: diffConfig.color }]}>
                        {diffConfig.label} • {formatRupiah(note.price)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.timeAgoText}>{note.semester}</Text>
                </View>

                <Text style={styles.noteItemTitle}>{note.title}</Text>
                <Text style={styles.noteItemDesc} numberOfLines={2}>
                  {note.description}
                </Text>

                <View style={styles.noteCardBottomRow}>
                  <Text style={styles.noteAuthorLabel}>Oleh: {note.author} ({note.pages} Halaman)</Text>

                  <Pressable
                    style={[
                      styles.paidDownloadBtn,
                      note.purchased ? styles.paidDownloadBtnPurchased : styles.paidDownloadBtnActive,
                    ]}
                    onPress={() => handleInitiateDownload(note)}
                  >
                    {note.purchased ? (
                      <>
                        <VerifiedCheckIcon size={13} color="#059669" />
                        <Text style={styles.paidDownloadPurchasedText}>Unduh (Milik Anda)</Text>
                      </>
                    ) : (
                      <>
                        <LockIcon size={13} color="#FFFFFF" />
                        <Text style={styles.paidDownloadText}>
                          Beli & Unduh ({formatRupiah(note.price)})
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // =========================================================================
  // RENDER KONTEN TAB: CARI / MK
  // =========================================================================
  const renderCariMKTab = () => {
    const coursesList = [
      { code: 'CS-201', name: 'Struktur Data & Algoritma', count: 14, minPrice: 25000, level: 'Sulit' },
      { code: 'CS-302', name: 'Pemrograman Mobile', count: 9, minPrice: 10000, level: 'Dasar (Termurah)' },
      { code: 'IF-204', name: 'Jaringan Komputer', count: 11, minPrice: 15000, level: 'Menengah' },
      { code: 'BD-103', name: 'Basis Data Terdistribusi', count: 8, minPrice: 15000, level: 'Menengah' },
      { code: 'AI-401', name: 'Kecerdasan Buatan & ML', count: 7, minPrice: 35000, level: 'Eksklusif' },
    ];

    return (
      <View style={styles.tabContentContainer}>
        <View style={styles.pageHeaderBanner}>
          <GraduationCapNavIcon size={26} color="#0284C7" />
          <Text style={styles.pageHeaderTitle}>Eksplorasi Mata Kuliah</Text>
          <Text style={styles.pageHeaderSub}>
            Pilih mata kuliah untuk menemukan catatan dan rangkuman berbayar sesuai tingkat kesulitan.
          </Text>
        </View>

        {coursesList.map((c) => (
          <Pressable
            key={c.code}
            style={styles.courseCard}
            onPress={() => {
              setSearchQuery(c.name);
              setActiveTab('beranda');
            }}
          >
            <View style={styles.courseCardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{c.code}</Text>
              </View>
              <Text style={styles.courseCardCount}>{c.count} Materi</Text>
            </View>
            <Text style={styles.courseCardName}>{c.name}</Text>
            <View style={styles.courseCardFooter}>
              <Text style={styles.courseLevelText}>Tingkat: {c.level}</Text>
              <Text style={styles.coursePriceStart}>Mulai dari {formatRupiah(c.minPrice)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  // =========================================================================
  // RENDER KONTEN TAB: BOOKMARK & KOLEKSI DIBELI
  // =========================================================================
  const renderBookmarkTab = () => {
    const purchasedNotes = notes.filter((n) => n.purchased);
    const bookmarkedNotes = notes.filter((n) => n.bookmarked);

    return (
      <View style={styles.tabContentContainer}>
        <View style={styles.pageHeaderBanner}>
          <BookmarkNavIcon size={24} color="#0F2850" />
          <Text style={styles.pageHeaderTitle}>Koleksi & Catatan Saya</Text>
          <Text style={styles.pageHeaderSub}>
            Daftar materi yang telah Anda beli dan simpan untuk diakses offline sewaktu-waktu.
          </Text>
        </View>

        <Text style={styles.sectionTitleHeader}>Materi Telah Dibeli (Akses Permanen):</Text>
        {purchasedNotes.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>Belum Ada Materi yang Dibeli</Text>
            <Text style={styles.emptyStateDesc}>
              Beli catatan kuliah di tab Beranda atau Profil untuk mengunduh dan membaca materi secara permanen.
            </Text>
          </View>
        ) : (
          purchasedNotes.map((note) => (
            <View key={note.id} style={styles.noteItemCard}>
              <View style={styles.noteCardTopRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{note.courseCode}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <VerifiedCheckIcon size={12} color="#059669" />
                  <Text style={[styles.verifiedBadgeText, { color: '#059669' }]}>Telah Dibayar & Tersimpan</Text>
                </View>
              </View>

              <Text style={styles.noteItemTitle}>{note.title}</Text>
              <Text style={styles.noteItemDesc}>{note.description}</Text>

              <View style={styles.noteCardBottomRow}>
                <Text style={styles.noteAuthorLabel}>{note.course} • {note.pages} Halaman</Text>
                <Pressable
                  style={[styles.paidDownloadBtn, styles.paidDownloadBtnPurchased]}
                  onPress={() => Alert.alert('Buka PDF', `Membuka file "${note.title}.pdf" di pembaca dokumen.`)}
                >
                  <VerifiedCheckIcon size={13} color="#059669" />
                  <Text style={styles.paidDownloadPurchasedText}>Buka PDF (Offline)</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.screenWrapper}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* ========================================================================= */}
          {/* HEADER PERSIS DENGAN GAMBAR SCREENSHOT USER */}
          {/* SIMAK Document Logo + SIMAK Text | Bell Icon with Dot | Student Avatar */}
          {/* ========================================================================= */}
          <View style={styles.headerRow}>
            {/* Sisi Kiri: Logo SIMAK */}
            <Pressable style={styles.headerBrandRow} onPress={() => setActiveTab('profil')}>
              <SimakMiniIcon />
              <Text style={styles.headerSimakText}>SIMAK</Text>
            </Pressable>

            {/* Sisi Kanan: Bell Notif & Avatar Stylized Mahasiswa (Bukan foto orang) */}
            <View style={styles.headerRightRow}>
              <Pressable
                style={styles.bellBtn}
                onPress={() =>
                  Alert.alert(
                    'Notifikasi SIMAK',
                    '• Catatan CS-201 Anda telah diunduh oleh 1.2k mahasiswa.\n• Royalti SIMAK Pay bertambah Rp35.000.\n• Anda meraih lencana Top Kontributor Gold!'
                  )
                }
              >
                <BellIcon size={22} color="#0F2850" />
                <View style={styles.bellOrangeDot} />
              </Pressable>

              <Pressable onPress={() => setActiveTab('profil')}>
                <MiniHeaderAvatar />
              </Pressable>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* KONTEN UTAMA SESUAI TAB AKTIF (Scrollable) */}
          {/* ========================================================================= */}
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'profil' && renderProfileTab()}
            {activeTab === 'beranda' && renderBerandaTab()}
            {activeTab === 'carimk' && renderCariMKTab()}
            {activeTab === 'bookmark' && renderBookmarkTab()}
          </ScrollView>

          {/* ========================================================================= */}
          {/* BOTTOM NAVIGATION BAR PERSIS DENGAN GAMBAR SCREENSHOT */}
          {/* 1. Beranda (Home) */}
          {/* 2. Cari/MK (Graduation Cap) */}
          {/* 3. Unggah (Center Raised Dark Blue Button with White +) */}
          {/* 4. Bookmark (Bookmark Ribbon) */}
          {/* 5. Profil (User Profile) */}
          {/* ========================================================================= */}
          <View style={styles.bottomNavContainer}>
            {/* Tab 1: Beranda */}
            <Pressable style={styles.navItem} onPress={() => setActiveTab('beranda')}>
              <HomeNavIcon size={22} color={activeTab === 'beranda' ? '#0F2850' : '#64748B'} />
              <Text style={[styles.navLabel, activeTab === 'beranda' && styles.navLabelActive]}>
                Beranda
              </Text>
            </Pressable>

            {/* Tab 2: Cari/MK */}
            <Pressable style={styles.navItem} onPress={() => setActiveTab('carimk')}>
              <GraduationCapNavIcon size={22} color={activeTab === 'carimk' ? '#0F2850' : '#64748B'} />
              <Text style={[styles.navLabel, activeTab === 'carimk' && styles.navLabelActive]}>
                Cari/MK
              </Text>
            </Pressable>

            {/* Tab 3: UNGGAH (Raised Floating Center Dark Navy Button +) */}
            <Pressable
              style={styles.navRaisedCenterBtn}
              onPress={() => setIsUploadModalVisible(true)}
            >
              <View style={styles.raisedCircleButton}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={[styles.navLabel, styles.navLabelUnggah]}>Unggah</Text>
            </Pressable>

            {/* Tab 4: Bookmark */}
            <Pressable style={styles.navItem} onPress={() => setActiveTab('bookmark')}>
              <BookmarkNavIcon size={20} color={activeTab === 'bookmark' ? '#0F2850' : '#64748B'} />
              <Text style={[styles.navLabel, activeTab === 'bookmark' && styles.navLabelActive]}>
                Bookmark
              </Text>
            </Pressable>

            {/* Tab 5: Profil (Aktif seperti pada screenshot) */}
            <Pressable style={styles.navItem} onPress={() => setActiveTab('profil')}>
              <ProfileNavIcon size={22} color={activeTab === 'profil' ? '#0F2850' : '#64748B'} />
              <Text style={[styles.navLabel, activeTab === 'profil' && styles.navLabelActive]}>
                Profil
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>

        {/* ========================================================================= */}
        {/* MODAL PEMBAYARAN MATERI BERBAYAR (Harus Berbayar Sesuai Tingkat Kesulitan) */}
        {/* ========================================================================= */}
        {selectedNoteForPurchase && (
          <Modal
            transparent
            animationType="fade"
            visible={!!selectedNoteForPurchase}
            onRequestClose={() => setSelectedNoteForPurchase(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.paymentModalCard}>
                <View style={styles.paymentModalHeader}>
                  <View style={styles.paymentModalIconBadge}>
                    <LockIcon size={20} color="#0F2850" />
                  </View>
                  <Text style={styles.paymentModalTitle}>Unduh Materi Berbayar</Text>
                  <Text style={styles.paymentModalSubtitle}>
                    Materi ini berbayar sesuai ketentuan tingkat kesulitan dokumen akademik SIMAK.
                  </Text>
                </View>

                {/* Detail Dokumen yang Ingin Diunduh */}
                <View style={styles.paymentDetailBox}>
                  <Text style={styles.paymentDetailTitle}>{selectedNoteForPurchase.title}</Text>
                  <Text style={styles.paymentDetailMeta}>
                    {selectedNoteForPurchase.course} ({selectedNoteForPurchase.courseCode}) • {selectedNoteForPurchase.pages} Halaman
                  </Text>

                  <View style={styles.paymentDifficultyPillRow}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor:
                            DIFFICULTY_CONFIG[selectedNoteForPurchase.difficulty].badgeBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyBadgeText,
                          {
                            color:
                              DIFFICULTY_CONFIG[selectedNoteForPurchase.difficulty].color,
                          },
                        ]}
                      >
                        {DIFFICULTY_CONFIG[selectedNoteForPurchase.difficulty].label}
                      </Text>
                    </View>

                    <Text style={styles.paymentRateDesc}>
                      {DIFFICULTY_CONFIG[selectedNoteForPurchase.difficulty].description}
                    </Text>
                  </View>
                </View>

                {/* Rincian Tarif & Ketentuan Harga (Paling Murah Rp10.000) */}
                <View style={styles.priceBreakdownContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Biaya Unduh Materi</Text>
                    <Text style={styles.priceRowValue}>
                      {formatRupiah(selectedNoteForPurchase.price)}
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Biaya Layanan Kampus UMM</Text>
                    <Text style={[styles.priceRowValue, { color: '#059669' }]}>Rp0 (Disubsidi)</Text>
                  </View>

                  <View style={styles.priceDivider} />

                  <View style={styles.priceRow}>
                    <Text style={styles.priceTotalLabel}>Total Pembayaran</Text>
                    <Text style={styles.priceTotalValue}>
                      {formatRupiah(selectedNoteForPurchase.price)}
                    </Text>
                  </View>
                  <Text style={styles.minPriceNotice}>
                    *Ketentuan SIMAK: Biaya disesuaikan dengan tingkat kesulitan materi (Paling murah: Rp10.000,00).
                  </Text>
                </View>

                {/* Pilihan Metode Pembayaran */}
                <Text style={styles.selectPaymentTitle}>Pilih Metode Pembayaran:</Text>
                <View style={styles.paymentMethodsCol}>
                  <Pressable
                    style={[
                      styles.methodOption,
                      paymentMethod === 'saldo' && styles.methodOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod('saldo')}
                  >
                    <View style={styles.methodRadioCircle}>
                      {paymentMethod === 'saldo' && <View style={styles.methodRadioDot} />}
                    </View>
                    <View style={styles.methodTextCol}>
                      <Text style={styles.methodName}>Saldo SIMAK Pay</Text>
                      <Text style={styles.methodSub}>
                        Saldo Anda: {formatRupiah(userBalance)}{' '}
                        {userBalance < selectedNoteForPurchase.price ? '(Kurang)' : '(Cukup)'}
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.methodOption,
                      paymentMethod === 'qris' && styles.methodOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod('qris')}
                  >
                    <View style={styles.methodRadioCircle}>
                      {paymentMethod === 'qris' && <View style={styles.methodRadioDot} />}
                    </View>
                    <View style={styles.methodTextCol}>
                      <Text style={styles.methodName}>QRIS Kampus UMM</Text>
                      <Text style={styles.methodSub}>BCA, Mandiri, BRI, BNI, Dana, GoPay, ShopeePay</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Tombol Aksi Konfirmasi & Batal */}
                <View style={styles.modalActionsRow}>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => setSelectedNoteForPurchase(null)}
                    disabled={isProcessingPayment}
                  >
                    <Text style={styles.cancelBtnText}>Batal</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.confirmPayBtn,
                      isProcessingPayment && styles.confirmPayBtnDisabled,
                    ]}
                    onPress={handleConfirmPurchase}
                    disabled={isProcessingPayment}
                  >
                    <Text style={styles.confirmPayBtnText}>
                      {isProcessingPayment
                        ? 'Memproses...'
                        : `Bayar & Unduh (${formatRupiah(selectedNoteForPurchase.price)})`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* ========================================================================= */}
        {/* MODAL UNGGAH MATERI BARU (Sesuai Tombol Tengah Navigasi +) */}
        {/* ========================================================================= */}
        <Modal
          transparent
          animationType="slide"
          visible={isUploadModalVisible}
          onRequestClose={() => setIsUploadModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.uploadModalCard}>
              <View style={styles.uploadModalHeader}>
                <Text style={styles.uploadModalTitle}>Unggah Catatan Kuliah</Text>
                <Text style={styles.uploadModalSub}>
                  Bagikan catatan kuliah & rangkuman Anda. Dapatkan royalti setiap ada mahasiswa yang mengunduh!
                </Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.uploadFormScroll}>
                {/* Judul Catatan */}
                <Text style={styles.inputLabel}>Judul Catatan / Rangkuman:</Text>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder="Contoh: Rangkuman Lengkap Algoritma Sorting & DFS"
                  placeholderTextColor="#94A3B8"
                  value={uploadTitle}
                  onChangeText={setUploadTitle}
                />

                {/* Mata Kuliah */}
                <Text style={styles.inputLabel}>Mata Kuliah:</Text>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder="Contoh: Pemrograman Mobile"
                  placeholderTextColor="#94A3B8"
                  value={uploadCourse}
                  onChangeText={setUploadCourse}
                />

                {/* Kode Mata Kuliah */}
                <Text style={styles.inputLabel}>Kode MK:</Text>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder="Contoh: CS-302"
                  placeholderTextColor="#94A3B8"
                  value={uploadCourseCode}
                  onChangeText={setUploadCourseCode}
                />

                {/* Pilihan Tingkat Kesulitan Berbayar (Cheapest Rp10.000) */}
                <Text style={styles.inputLabel}>
                  Tingkat Kesulitan (Menentukan Tarif Unduh Otomatis):
                </Text>
                <View style={styles.difficultyRadioContainer}>
                  {(['dasar', 'menengah', 'sulit', 'eksklusif'] as DifficultyLevel[]).map((level) => {
                    const cfg = DIFFICULTY_CONFIG[level];
                    const isSelected = uploadDifficulty === level;
                    return (
                      <Pressable
                        key={level}
                        style={[
                          styles.diffRadioOption,
                          isSelected && styles.diffRadioOptionSelected,
                        ]}
                        onPress={() => setUploadDifficulty(level)}
                      >
                        <View style={styles.diffRadioRow}>
                          <Text
                            style={[
                              styles.diffRadioTitle,
                              isSelected && styles.diffRadioTitleSelected,
                            ]}
                          >
                            {cfg.label}
                          </Text>
                          <Text style={styles.diffRadioPrice}>
                            {formatRupiah(cfg.price)}
                            {level === 'dasar' ? ' (Paling Murah)' : ''}
                          </Text>
                        </View>
                        <Text style={styles.diffRadioDesc}>{cfg.description}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Deskripsi */}
                <Text style={styles.inputLabel}>Deskripsi Ringkas Catatan:</Text>
                <TextInput
                  style={[styles.textInputStyle, { height: 75, textAlignVertical: 'top' }]}
                  placeholder="Deskripsikan isi catatan dan manfaatnya bagi mahasiswa..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={uploadDesc}
                  onChangeText={setUploadDesc}
                />

                {/* File Dokumen Simulasi */}
                <View style={styles.filePickerBox}>
                  <NotesStackIcon size={24} color="#0284C7" />
                  <Text style={styles.filePickerTitle}>Dokumen PDF Terlampir (2.4 MB)</Text>
                  <Text style={styles.filePickerSub}>Format .pdf tervalidasi siap tayang</Text>
                </View>
              </ScrollView>

              {/* Tombol Aksi Unggah */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setIsUploadModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </Pressable>

                <Pressable style={styles.confirmPayBtn} onPress={handlePublishUpload}>
                  <Text style={styles.confirmPayBtnText}>
                    Publikasikan ({formatRupiah(DIFFICULTY_CONFIG[uploadDifficulty].price)})
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

// =========================================================================
// STYLESHEET RESMI - IDENTIK DENGAN DESAIN SCREENSHOT USER
// =========================================================================
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F9F9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#F9F9F7',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Bar (SIMAK | Bell | Avatar)
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSimakText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F2850',
    letterSpacing: 0.8,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  bellOrangeDot: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  miniAvatarWrapper: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  // Main Scroll View
  mainScrollView: {
    flex: 1,
    backgroundColor: '#F9F9F7',
  },
  mainScrollContent: {
    paddingBottom: 24,
  },
  tabContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // 1. Profile Hero Card (Martin)
  profileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileNim: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  profileMajor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  profileUniv: {
    fontSize: 12,
    color: '#64748B',
  },
  profileBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  semesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 12,
    gap: 6,
  },
  activeDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#EA580C',
  },
  semesterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  regulerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 12,
    gap: 6,
  },
  regulerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },

  // 2. Contributor Card (Top Kontributor Gold)
  contributorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  contributorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medalSquircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 22,
  },
  contributorTextCol: {
    justifyContent: 'center',
  },
  contributorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  contributorInlineMedal: {
    fontSize: 14,
  },
  contributorSubtitle: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 1,
  },
  xpCol: {
    alignItems: 'flex-end',
  },
  xpNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F2850',
  },
  xpLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  progressNextText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  progressCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },

  // 3. Stats 3 Row (Catatan, Unduhan, Upvotes)
  statsThreeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statMiniNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statMiniLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },

  // 4. Segmented Control / Tabs
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#0F2850',
  },
  segmentTabInactive: {
    backgroundColor: 'transparent',
  },
  segmentTabText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
  },
  segmentTabTextInactive: {
    color: '#64748B',
  },

  // 5. Feed Note Cards
  feedWrapper: {
    gap: 12,
  },
  noteItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  codeBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeAgoText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  noteItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 6,
  },
  noteItemDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  noteCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteStatsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  noteStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  noteAuthorLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  noteActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  paidDownloadBtnActive: {
    backgroundColor: '#0F2850',
  },
  paidDownloadBtnPurchased: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidDownloadText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paidDownloadPurchasedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  iconSquareBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  seeMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2850',
  },

  // Beranda Wallet Card
  walletCard: {
    backgroundColor: '#0F2850',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLeftCol: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 11.5,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  walletSub: {
    fontSize: 10.5,
    color: '#CBD5E1',
  },
  topUpBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  topUpBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Search Box
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 13,
    color: '#0F172A',
  },
  filterSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#0F2850',
    borderColor: '#0F2850',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Banner Header Generic (CariMK / Bookmark)
  pageHeaderBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  pageHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2850',
    marginTop: 6,
    marginBottom: 2,
  },
  pageHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseCardCount: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  courseCardName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseLevelText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  coursePriceStart: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  sectionTitleHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F2850',
    marginBottom: 10,
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ==========================================
  // BOTTOM NAVIGATION BAR (Sesuai Screenshot)
  // ==========================================
  bottomNavContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 10,
    height: Platform.OS === 'ios' ? 84 : 70,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  navLabelActive: {
    color: '#0F2850',
    fontWeight: '800',
  },
  navRaisedCenterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  raisedCircleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F2850',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#0F2850',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 10px rgba(15, 40, 80, 0.25)',
      },
    }),
  },
  navLabelUnggah: {
    marginTop: 2,
    fontWeight: '700',
    color: '#0F2850',
  },

  // ==========================================
  // MODAL PEMBAYARAN & UNGGAH STYLES
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paymentModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  paymentModalHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  paymentModalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentModalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
  },
  paymentDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentDetailTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  paymentDetailMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 6,
  },
  paymentDifficultyPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentRateDesc: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  priceBreakdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceRowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  priceRowValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  priceTotalLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F2850',
  },
  priceTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  minPriceNotice: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  selectPaymentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  paymentMethodsCol: {
    gap: 8,
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  methodOptionSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  methodRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#0284C7',
  },
  methodTextCol: {
    flex: 1,
  },
  methodName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmPayBtn: {
    flex: 2,
    backgroundColor: '#0F2850',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmPayBtnDisabled: {
    opacity: 0.6,
  },
  confirmPayBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Upload Modal Form
  uploadModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },
  uploadModalHeader: {
    marginBottom: 12,
  },
  uploadModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2850',
  },
  uploadModalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  uploadFormScroll: {
    maxHeight: 400,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInputStyle: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
  },
  difficultyRadioContainer: {
    gap: 6,
    marginTop: 4,
  },
  diffRadioOption: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 9,
  },
  diffRadioOptionSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  diffRadioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  diffRadioTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  diffRadioTitleSelected: {
    color: '#0284C7',
  },
  diffRadioPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  diffRadioDesc: {
    fontSize: 10.5,
    color: '#64748B',
  },
  filePickerBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  filePickerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 4,
  },
  filePickerSub: {
    fontSize: 10.5,
    color: '#16A34A',
  },
});
