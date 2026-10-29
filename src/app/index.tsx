import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type DemoStatus = 'loading' | 'success' | 'error' | 'offline' | 'timeout' | 'empty';

type DemoItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

const DEMO_ITEMS: DemoItem[] = [
  { id: 1, title: 'Program Pendidikan', description: 'Catatan perkuliahan dan modul.pdf', icon: '📘' },
  { id: 2, title: 'Program Lingkungan', description: 'Rangkuman lingkungan hidup dan proyek', icon: '🌿' },
  { id: 3, title: 'Program Kesehatan', description: 'Data kesehatan masyarakat dan edukasi', icon: '🩺' },
  { id: 4, title: 'Program Ekonomi', description: 'Laporan ekonomi digital dan strategi', icon: '📊' },
];

function StatusIcon({ color = '#0F172A', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M12 7V12L15.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MiniSignalIcon({ color = '#2563EB', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 15.5C6.5 12 9.5 12 13 15.5M7 19C8.8 17.2 10.5 17.2 12.4 19M17 11.7C20 8.7 20.3 8.4 23 11.7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function RetryIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 11A8 8 0 1 0 18.3 16.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 4V11H13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DocumentLogoIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 64 64" fill="none">
      <Rect x="8" y="10" width="48" height="44" rx="12" fill="#E0F2FE" />
      <Rect x="14" y="18" width="30" height="6" rx="3" fill="#0F172A" opacity="0.8" />
      <Rect x="14" y="30" width="26" height="4" rx="2" fill="#0F172A" opacity="0.6" />
      <Rect x="14" y="38" width="22" height="4" rx="2" fill="#0F172A" opacity="0.45" />
      <Path d="M38 10L50 22V52C50 54.2 48.2 56 46 56H18C15.8 56 14 54.2 14 52V10H38Z" fill="#1D4ED8" opacity="0.14" />
      <Path d="M38 10V22H50" fill="#1D4ED8" opacity="0.2" />
    </Svg>
  );
}

function GraduationCapIcon({ size = 18, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L2.5 8L12 13L21.5 8L12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M6 10.2V14.5C6 16.8 8.2 18.5 12 18.5C15.8 18.5 18 16.8 18 14.5V10.2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M21.5 8V15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function ShieldCheckIcon({ size = 14, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.5L18.5 5V11C18.5 15.2 15.8 18.9 12 20.5C8.2 18.9 5.5 15.2 5.5 11V5L12 2.5Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M9.2 12L11.1 13.9L14.8 10.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AppDemoPage() {
  const [status, setStatus] = useState<DemoStatus>('loading');
  const [data, setData] = useState<DemoItem[]>(DEMO_ITEMS);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const runFetch = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setErrorStatusCode(null);
    setIsOffline(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const code = response.status;
        setErrorStatusCode(code);
        setErrorMessage(`HTTP ${code} — gagal memproses permintaan.`);
        setStatus('error');
        return;
      }

      const json = await response.json();
      const mapped = Array.isArray(json)
        ? json.slice(0, 4).map((item: any, index: number) => ({
            id: item.id ?? index + 1,
            title: item.title ? item.title.slice(0, 24) : DEMO_ITEMS[index]?.title ?? 'Catatan',
            description: item.body ? item.body.slice(0, 32) : DEMO_ITEMS[index]?.description ?? 'Deskripsi baru',
            icon: DEMO_ITEMS[index]?.icon ?? '📄',
          }))
        : [];

      if (!mapped.length) {
        setData([]);
        setStatus('empty');
        return;
      }

      setData(mapped);
      setStatus('success');
    } catch (err: any) {
      const errorText = String(err?.message || '').toLowerCase();
      const offlineDetected =
        errorText.includes('network') ||
        errorText.includes('failed to fetch') ||
        errorText.includes('offline') ||
        errorText.includes('not connected') ||
        err?.name === 'TypeError';

      if (err?.name === 'AbortError') {
        setStatus('timeout');
        setErrorMessage('Waktu request habis. Server terlalu lambat merespons.');
        return;
      }

      if (offlineDetected) {
        setIsOffline(true);
        setStatus('offline');
        setErrorMessage('Tidak ada koneksi internet. Silakan cek jaringan Anda lalu coba lagi.');
        return;
      }

      setStatus('error');
      setErrorMessage('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
    }
  }, []);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const isErrorState = status === 'offline' || status === 'timeout' || status === 'error';

  const renderRetryButton = () => (
    <Pressable style={styles.retryButton} onPress={runFetch}>
      <RetryIcon size={15} color="#FFFFFF" />
      <Text style={styles.retryText}>Coba Lagi</Text>
    </Pressable>
  );

  return (
    <Pressable style={styles.outerContainer} onPress={() => undefined}>
      <View style={styles.screenWrapper}>
        <View style={styles.backgroundGlow} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 360 760" preserveAspectRatio="none">
            <Rect width="360" height="760" fill="#FFFFFF" />
            <Circle cx="290" cy="140" r="180" fill="#FDE68A" opacity={0.2} />
            <Circle cx="110" cy="590" r="200" fill="#DBEAFE" opacity={0.2} />
          </Svg>
        </View>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.mainContent}>
            <View style={styles.logoCard}>
              <View style={styles.cardContentRow}>
                <DocumentLogoIcon />
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardSimakText}>SIMAK</Text>
                  <Text style={styles.cardCatatanText}>CATATAN KAMPUS</Text>
                </View>
              </View>
            </View>

            <Text style={styles.mainTitle}>SIMAK</Text>

            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>CATATAN KAMPUS</Text>
            </View>

            <Text style={styles.tagline}>{'Satu platform terpercaya untuk semua\ncatatan kuliah &\nrangkuman materi.'}</Text>

            <View style={styles.collabPill}>
              <GraduationCapIcon size={18} color="#0284C7" />
              <Text style={styles.collabText}>Ruang Kolaborasi Akademik</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {status === 'loading'
                  ? 'MENYIAPKAN RIBUAN CATATAN KULIAH...'
                  : status === 'success'
                    ? 'DATA BERHASIL DIMUAT'
                    : status === 'offline'
                      ? 'KONEKSI INTERNET TERPUTUS'
                      : status === 'timeout'
                        ? 'WAKTU REQUEST HABIS'
                        : status === 'empty'
                          ? 'DATA MASIH KOSONG'
                          : 'TERJADI KESALAHAN PADA SERVER'}
              </Text>
            </View>

            <View style={styles.verifiedRow}>
              <ShieldCheckIcon size={14} color="#0284C7" />
              <Text style={styles.verifiedText}>Aman & Terverifikasi</Text>
            </View>

            <Text style={styles.footerText}>Inisiatif Kolaboratif Mahasiswa UMM</Text>

            <View style={styles.apiCard}>
              <View style={styles.apiHeaderRow}>
                <Text style={styles.apiTitle}>Status API</Text>
                <View style={[styles.apiPill, status === 'offline' && styles.offlinePill, status === 'timeout' && styles.timeoutPill, status === 'error' && styles.errorPill]}>
                  <Text style={styles.apiPillText}>{status.toUpperCase()}</Text>
                </View>
              </View>

              {status === 'loading' && (
                <View style={styles.apiContentRow}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.apiBody}>Memuat data dari API...</Text>
                </View>
              )}

              {status === 'success' && (
                <View style={styles.listWrap}>
                  {data.map((item) => (
                    <View key={item.id} style={styles.rowItem}>
                      <View style={styles.rowIconWrap}><Text style={styles.rowIcon}>{item.icon}</Text></View>
                      <View style={styles.rowContent}>
                        <Text style={styles.listTitle}>{item.title}</Text>
                        <Text style={styles.listDesc}>{item.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {isErrorState && (
                <View style={styles.apiErrorBox}>
                  <View style={[styles.errorBadge, status === 'offline' ? styles.offlineBadge : status === 'timeout' ? styles.timeoutBadge : styles.errorBadge]}>
                    {status === 'offline' ? (
                      <MiniSignalIcon size={18} color="#FFFFFF" />
                    ) : status === 'timeout' ? (
                      <StatusIcon size={18} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.errorSymbol}>!</Text>
                    )}
                  </View>
                  <Text style={styles.apiBody}>{errorMessage || 'Terjadi masalah saat mengambil data.'}</Text>
                  {errorStatusCode ? <Text style={styles.apiMeta}>Status code: {errorStatusCode}</Text> : null}
                  {renderRetryButton()}
                </View>
              )}

              {status === 'empty' && (
                <View style={styles.apiErrorBox}>
                  <View style={styles.emptyBadge}>
                    <Text style={styles.errorSymbol}>0</Text>
                  </View>
                  <Text style={styles.apiBody}>Data yang diterima kosong (0 item).</Text>
                  {renderRetryButton()}
                </View>
              )}
            </View>
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
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 18,
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  logoCard: {
    width: 142,
    height: 126,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 7,
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
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
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
    paddingBottom: 12,
  },
  progressTrack: {
    width: 220,
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
  apiCard: {
    width: '100%',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  apiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  apiPill: {
    backgroundColor: '#E0F2FE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offlinePill: {
    backgroundColor: '#FEE2E2',
  },
  timeoutPill: {
    backgroundColor: '#FEF3C7',
  },
  errorPill: {
    backgroundColor: '#FEE2E2',
  },
  apiPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },
  apiContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiBody: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  apiMeta: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
  },
  listWrap: {
    gap: 8,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  rowIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rowIcon: {
    fontSize: 14,
  },
  rowContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  listDesc: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  apiErrorBox: {
    alignItems: 'center',
    paddingTop: 4,
  },
  errorBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineBadge: {
    backgroundColor: '#EF4444',
  },
  timeoutBadge: {
    backgroundColor: '#F59E0B',
  },
  errorSymbol: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#FF5C5C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
});
