import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Icon Dokumen SIMAK Mini
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

// Icon Lonceng Notifikasi
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

// Icon Cari
function SearchIcon({ size = 18, color = '#9CA3AF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
      <Path
        d="M21 21L16.65 16.65"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Icon Buku / Catatan
function BookOpenIcon({ size = 18, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Icon Topi Wisuda
function GraduationCapIcon({ size = 18, color = '#0284C7' }: { size?: number; color?: string }) {
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

// Icon Unduh / Download
function DownloadIcon({ size = 14, color = '#6B7280' }: { size?: number; color?: string }) {
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

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Semua',
    'Pemrograman Mobile',
    'Basis Data',
    'Jaringan Komputer',
    'Kecerdasan Buatan',
  ];

  const notesData = [
    {
      id: '1',
      title: 'Modul Praktikum Pemrograman Mobile - Expo SDK 57 & React Native',
      course: 'Pemrograman Mobile',
      semester: 'Semester 4',
      pages: 28,
      downloads: 452,
      author: 'Safira Azzahra • UMM',
      verified: true,
      color: '#1E3A5F',
    },
    {
      id: '2',
      title: 'Rangkuman Lengkap Normalisasi Basis Data & Query Optimization SQL',
      course: 'Basis Data',
      semester: 'Semester 3',
      pages: 19,
      downloads: 388,
      author: 'Lab Informatika UMM',
      verified: true,
      color: '#0284C7',
    },
    {
      id: '3',
      title: 'Panduan Subnetting CIDR, VLSM & Konfigurasi VLAN Cisco Packet Tracer',
      course: 'Jaringan Komputer',
      semester: 'Semester 4',
      pages: 34,
      downloads: 520,
      author: 'Komunitas Mahasiswa UMM',
      verified: true,
      color: '#0D9488',
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.screenWrapper}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Dashboard */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <SimakMiniIcon />
              <View style={styles.brandTextCol}>
                <Text style={styles.brandTitle}>SIMAK</Text>
                <Text style={styles.brandSub}>CATATAN KAMPUS</Text>
              </View>
            </View>

            <View style={styles.headerRightActions}>
              <Pressable
                style={styles.iconCircleButton}
                onPress={() => Alert.alert('Notifikasi', 'Tidak ada notifikasi baru.')}
              >
                <BellIcon size={20} color="#0F2850" />
                <View style={styles.notifBadgeDot} />
              </Pressable>

              <Pressable
                style={styles.avatarButton}
                onPress={() =>
                  Alert.alert('Akun Mahasiswa', 'NIM: 202310370311xxx\nUniversitas Muhammadiyah Malang', [
                    { text: 'Keluar (Logout)', onPress: () => router.replace('/login'), style: 'destructive' },
                    { text: 'Tutup' },
                  ])
                }
              >
                <Text style={styles.avatarText}>UM</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Banner Selamat Datang */}
            <View style={styles.welcomeBanner}>
              <View style={styles.welcomePill}>
                <GraduationCapIcon size={14} color="#0284C7" />
                <Text style={styles.welcomePillText}>Mahasiswa UMM Terverifikasi</Text>
              </View>
              <Text style={styles.welcomeHeading}>Ruang Catatan Kuliah</Text>
              <Text style={styles.welcomeSubtext}>
                Akses ribuan materi kuliah, modul praktikum, dan rangkuman ujian kolaboratif.
              </Text>
            </View>

            {/* Kotak Pencarian */}
            <View style={styles.searchBox}>
              <SearchIcon size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari catatan, mata kuliah, atau dosen..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Statistik Ringkas */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>1.420+</Text>
                <Text style={styles.statLabel}>Catatan Kuliah</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>48</Text>
                <Text style={styles.statLabel}>Mata Kuliah</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Terverifikasi</Text>
              </View>
            </View>

            {/* Kategori Horisontal */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Kategori Mata Kuliah</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isActive ? styles.categoryChipActive : styles.categoryChipInactive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive
                          ? styles.categoryChipTextActive
                          : styles.categoryChipTextInactive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Daftar Catatan Terbaru */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <Text style={styles.sectionTitle}>Catatan Kuliah Populer</Text>
              <Pressable
                onPress={() =>
                  Alert.alert('Catatan Kuliah', 'Memuat seluruh arsip catatan kuliah UMM.')
                }
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </Pressable>
            </View>

            {notesData
              .filter(
                (note) =>
                  selectedCategory === 'Semua' || note.course === selectedCategory
              )
              .map((note) => (
                <Pressable
                  key={note.id}
                  style={styles.noteCard}
                  onPress={() =>
                    Alert.alert(
                      note.title,
                      `Mata Kuliah: ${note.course}\nPenulis: ${note.author}\nTotal: ${note.pages} Halaman\n\nIngin mengunduh catatan ini?`,
                      [
                        { text: 'Batal', style: 'cancel' },
                        {
                          text: 'Unduh Catatan (PDF)',
                          onPress: () =>
                            Alert.alert('Berhasil', 'Catatan kuliah sedang diunduh ke perangkat Anda.'),
                        },
                      ]
                    )
                  }
                >
                  <View style={styles.noteCardHeader}>
                    <View style={[styles.courseBadge, { backgroundColor: note.color + '15' }]}>
                      <BookOpenIcon size={14} color={note.color} />
                      <Text style={[styles.courseBadgeText, { color: note.color }]}>
                        {note.course}
                      </Text>
                    </View>
                    <Text style={styles.pagesText}>{note.pages} Hlm</Text>
                  </View>

                  <Text style={styles.noteTitle}>{note.title}</Text>

                  <View style={styles.noteCardFooter}>
                    <Text style={styles.noteAuthorText}>{note.author}</Text>
                    <View style={styles.downloadsRow}>
                      <DownloadIcon size={13} color="#6B7280" />
                      <Text style={styles.downloadsText}>{note.downloads}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}

            {/* Banner Kolaborasi Akademik */}
            <View style={styles.collabBox}>
              <GraduationCapIcon size={22} color="#0284C7" />
              <View style={styles.collabBoxContent}>
                <Text style={styles.collabBoxTitle}>Ruang Kolaborasi Akademik</Text>
                <Text style={styles.collabBoxDesc}>
                  Punya catatan kuliah bagus? Bagikan dan bantu sesama mahasiswa UMM.
                </Text>
              </View>
              <Pressable
                style={styles.collabButton}
                onPress={() =>
                  Alert.alert(
                    'Unggah Catatan',
                    'Fitur unggah catatan kuliah SIMAK Mahasiswa UMM terbuka untuk seluruh mahasiswa aktif.'
                  )
                }
              >
                <Text style={styles.collabButtonText}>+ Unggah</Text>
              </Pressable>
            </View>

            {/* Tombol Kembali ke Halaman Login / Keluar */}
            <Pressable
              style={styles.logoutButton}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.logoutButtonText}>← Kembali ke Halaman Masuk</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F2850',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F2850',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      },
    }),
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCEBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginBottom: 8,
  },
  welcomePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  welcomeHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2850',
  },
  welcomeSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13.5,
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2850',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#0F2850',
  },
  categoryChipInactive: {
    backgroundColor: '#EBEAE5',
  },
  categoryChipText: {
    fontSize: 12.5,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryChipTextInactive: {
    color: '#4B5563',
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
      default: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      },
    }),
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  courseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pagesText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  noteTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 10,
  },
  noteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 8,
  },
  noteAuthorText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  downloadsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadsText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  collabBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#FDEBD2',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    gap: 10,
  },
  collabBoxContent: {
    flex: 1,
  },
  collabBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26201B',
  },
  collabBoxDesc: {
    fontSize: 11.5,
    color: '#785A3F',
    marginTop: 2,
    lineHeight: 15,
  },
  collabButton: {
    backgroundColor: '#0F2850',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  collabButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
