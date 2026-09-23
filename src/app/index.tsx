import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

const PROGRESS_BAR_WIDTH = 220;

// 1. Icon Topi Wisuda (Ruang Kolaborasi Akademik)
function GraduationCapIcon({ size = 18, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bagian atas topi (Diamond Mortarboard) */}
      <Path
        d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z"
        fill={color}
      />
      {/* Bagian bawah topi (Skull Cap) */}
      <Path
        d="M5 13.18V17.5C5 19.99 8.13 22 12 22C15.87 22 19 19.99 19 17.5V13.18L12 17L5 13.18Z"
        fill={color}
      />
    </Svg>
  );
}

// 2. Icon Perisai Terverifikasi (Aman & Terverifikasi)
function ShieldCheckIcon({ size = 14, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L3 6V11.09C3 16.65 6.84 21.74 12 23C17.16 21.74 21 16.65 21 11.09V6L12 2Z"
        fill={color}
      />
      <Path
        d="M10 15.5L6.5 12L7.91 10.59L10 12.67L16.09 6.58L17.5 8L10 15.5Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

// 3. Icon Dokumen SIMAK dengan Bookmark Oranye
function DocumentLogoIcon() {
  return (
    <Svg width={30} height={36} viewBox="0 0 30 36" fill="none">
      {/* Background dokumen biru dongker */}
      <Rect x="1" y="2" width="26" height="32" rx="5.5" fill="#1E3A5F" />
      {/* Tab bookmark oranye di sudut kanan atas */}
      <Rect x="16" y="0" width="8.5" height="11" rx="2.2" fill="#F97316" />
      {/* Garis teks putih */}
      <Rect x="6" y="13" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="18" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="23" width="9.5" height="2.2" rx="1.1" fill="#FFFFFF" />
    </Svg>
  );
}

export default function SplashScreenView() {
  const router = useRouter();

  useEffect(() => {
    // Otomatis berpindah ke halaman Login setelah splash screen selesai (~2.8 detik)
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Pressable
      style={styles.outerContainer}
      onPress={() => router.replace('/login')}
    >
      <View style={styles.screenWrapper}>
        {/* Ambient warm glow di sisi kanan bawah sesuai gambar */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient
                id="warmGlow"
                cx="88%"
                cy="68%"
                rx="65%"
                ry="45%"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0%" stopColor="#FED7AA" stopOpacity="0.45" />
                <Stop offset="35%" stopColor="#FFEDD5" stopOpacity="0.25" />
                <Stop offset="75%" stopColor="#FFF7ED" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#warmGlow)" />
          </Svg>
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Spacer atas */}
          <View style={styles.topSpacer} />

          {/* Bagian Konten Tengah */}
          <View style={styles.mainContent}>
            {/* Kartu Logo Melayang Putih */}
            <View style={styles.logoCard}>
              <View style={styles.cardContentRow}>
                <DocumentLogoIcon />
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardSimakText}>SIMAK</Text>
                  <Text style={styles.cardCatatanText}>CATATAN KAMPUS</Text>
                </View>
              </View>
            </View>

            {/* Judul Utama SIMAK */}
            <Text style={styles.mainTitle}>SIMAK</Text>

            {/* Badge Pill CATATAN KAMPUS */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>CATATAN KAMPUS</Text>
            </View>

            {/* Slogan / Deskripsi */}
            <Text style={styles.tagline}>
              Satu platform terpercaya untuk semua{'\n'}catatan kuliah & rangkuman materi.
            </Text>

            {/* Badge Ruang Kolaborasi Akademik */}
            <View style={styles.collabPill}>
              <GraduationCapIcon size={18} color="#0284C7" />
              <Text style={styles.collabText}>Ruang Kolaborasi Akademik</Text>
            </View>
          </View>

          {/* Spacer bawah */}
          <View style={styles.bottomSpacer} />

          {/* Bagian Bawah / Footer Loading */}
          <View style={styles.bottomSection}>
            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            {/* Status Loading */}
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>MENYIAPKAN RIBUAN CATATAN KULIAH...</Text>
            </View>

            {/* Keamanan & Verifikasi */}
            <View style={styles.verifiedRow}>
              <ShieldCheckIcon size={14} color="#0284C7" />
              <Text style={styles.verifiedText}>Aman & Terverifikasi</Text>
            </View>

            {/* Inisiatif Kampus */}
            <Text style={styles.footerText}>Inisiatif Kolaboratif Mahasiswa UMM</Text>
          </View>
        </SafeAreaView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topSpacer: {
    flex: 1.05,
  },
  bottomSpacer: {
    flex: 1.35,
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
  },
  logoCard: {
    width: 142,
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow lembut dan elegan
    ...Platform.select({
      ios: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 7,
      },
      default: {
        boxShadow: '0 12px 28px -4px rgba(10, 37, 64, 0.09)',
      },
    }),
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  cardTextCol: {
    justifyContent: 'center',
  },
  cardSimakText: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#0F2850',
    letterSpacing: 0.5,
  },
  cardCatatanText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.6,
    marginTop: 1.5,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0B2146',
    letterSpacing: 0.8,
    marginTop: 26,
  },
  badgeContainer: {
    backgroundColor: '#DCEBFE',
    paddingHorizontal: 16,
    paddingVertical: 5.5,
    borderRadius: 7,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 14.5,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  collabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#FDEBD2',
    paddingVertical: 9.5,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {
        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.05)',
      },
    }),
  },
  collabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26201B',
    marginLeft: 8,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 24,
  },
  progressTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 6,
    backgroundColor: '#ECE7E1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '42%',
    height: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#1D4ED8',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 5,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
