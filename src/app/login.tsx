import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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

// 1. Icon Perisai Terverifikasi (Top Badge)
function ShieldCheckIcon({ size = 14, color = '#1D4ED8' }: { size?: number; color?: string }) {
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

// 2. Icon Dokumen SIMAK dengan Bookmark Oranye
function DocumentLogoIcon() {
  return (
    <Svg width={32} height={38} viewBox="0 0 30 36" fill="none">
      <Rect x="1" y="2" width="26" height="32" rx="5.5" fill="#1E3A5F" />
      <Rect x="16" y="0" width="8.5" height="11" rx="2.2" fill="#F97316" />
      <Rect x="6" y="13" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="18" width="13" height="2.2" rx="1.1" fill="#FFFFFF" />
      <Rect x="6" y="23" width="9.5" height="2.2" rx="1.1" fill="#FFFFFF" />
    </Svg>
  );
}

// 3. Icon Masuk / Login (Door with Arrow)
function LoginIcon({ size = 18, color = '#0F2850' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 16L18 12L14 8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 12H8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 4. Icon Tambah User (Daftar Baru)
function UserPlusIcon({ size = 18, color = '#4B5563' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" />
      <Path
        d="M20 8V14M17 11H23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 5. Icon Kartu Mahasiswa / ID Card (Input NIM)
function IdCardIcon({ size = 19, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        stroke={color}
        strokeWidth="1.8"
      />
      <Circle cx="9" cy="10" r="2.2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M15 9H17M15 13H17M5.8 17C6.4 15.2 7.7 14.2 9 14.2C10.3 14.2 11.6 15.2 12.2 17"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 6. Icon Gembok / Lock (Input Password)
function LockIcon({ size = 18, color = '#6B7280' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2.5"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path
        d="M7.5 10V7C7.5 4.51472 9.51472 2.5 12 2.5C14.4853 2.5 16.5 4.51472 16.5 7V10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="15.5" r="1.5" fill={color} />
    </Svg>
  );
}

// 7. Icon Mata Coret / Eye Off (Toggle Password)
function EyeOffIcon({ size = 20, color = '#4B5563' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12C1.75 10.22 2.94 8.7 4.45 7.52M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12A10.42 10.42 0 0 1 19.5 16.5M1 1L23 23"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.88 9.88A3 3 0 1 0 14.12 14.12"
        stroke={color}
        strokeWidth="1.8"
      />
    </Svg>
  );
}

// 8. Icon Mata Terbuka / Eye (Toggle Password)
function EyeOpenIcon({ size = 20, color = '#4B5563' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C2.73 7.89 7 4 12 4C17 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

// 9. Icon Tanya / Help Admin
function HelpQuestionIcon({ size = 16, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path
        d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.39913C11.0108 7.03015 11.7301 6.87701 12.4357 6.96645C13.1412 7.05588 13.7918 7.38281 14.2758 7.89063C14.7597 8.39845 15.0487 9.05677 15.0931 9.75239C15.0931 11.5 12.5 12.5 12.5 12.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="16.5" r="1" fill={color} />
    </Svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form tambahan jika di tab Daftar Baru
  const [namaLengkap, setNamaLengkap] = useState('');
  const [emailUmm, setEmailUmm] = useState('');

  const handleLogin = () => {
    // Navigasi ke Dashboard SIMAK
    router.push('/dashboard');
  };

  const handleRegister = () => {
    Alert.alert(
      'Pendaftaran Berhasil',
      'Akun SIMAK Mahasiswa UMM Anda telah terdaftar. Silakan masuk menggunakan NIM Anda.',
      [{ text: 'Masuk Sekarang', onPress: () => setActiveTab('login') }]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* 1. Badge Atas: Khusus Mahasiswa UMM */}
            <View style={styles.topBadgePill}>
              <ShieldCheckIcon size={14} color="#1D4ED8" />
              <Text style={styles.topBadgeText}>Khusus Mahasiswa UMM</Text>
            </View>

            {/* 2. Logo Brand SIMAK */}
            <View style={styles.logoRow}>
              <DocumentLogoIcon />
              <View style={styles.logoTextCol}>
                <Text style={styles.logoTitle}>SIMAK</Text>
                <Text style={styles.logoSubtitle}>CATATAN KAMPUS</Text>
              </View>
            </View>

            {/* 3. Slogan */}
            <Text style={styles.taglineText}>Platform Berbagi Catatan & Info Kuliah</Text>

            {/* 4. Tab Selector: Masuk Akun / Daftar Baru */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[
                  styles.tabButton,
                  activeTab === 'login' ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
                onPress={() => setActiveTab('login')}
              >
                <LoginIcon
                  size={16}
                  color={activeTab === 'login' ? '#0F2850' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'login'
                      ? styles.tabButtonTextActive
                      : styles.tabButtonTextInactive,
                  ]}
                >
                  Masuk Akun
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tabButton,
                  activeTab === 'register' ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
                onPress={() => setActiveTab('register')}
              >
                <UserPlusIcon
                  size={16}
                  color={activeTab === 'register' ? '#0F2850' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'register'
                      ? styles.tabButtonTextActive
                      : styles.tabButtonTextInactive,
                  ]}
                >
                  Daftar Baru
                </Text>
              </Pressable>
            </View>

            {/* 5. Kartu Putih Formulir (White Card) */}
            <View style={styles.formCard}>
              {activeTab === 'login' ? (
                <>
                  {/* Field NIM */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nomor Mahasiswa (NIM)</Text>
                    <View style={styles.inputFieldWrapper}>
                      <IdCardIcon size={18} color="#6B7280" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Nomor Mahasiswa (NIM)"
                        placeholderTextColor="#9CA3AF"
                        value={nim}
                        onChangeText={setNim}
                        keyboardType="numeric"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Field Password */}
                  <View style={[styles.inputGroup, { marginTop: 16 }]}>
                    <View style={styles.passwordLabelRow}>
                      <Text style={styles.inputLabel}>Password/PIC</Text>
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            'Lupa Kata Sandi',
                            'Silakan hubungi administrator akademik atau gunakan email webmail UMM Anda untuk mereset kata sandi.'
                          )
                        }
                      >
                        <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
                      </Pressable>
                    </View>
                    <View style={styles.inputFieldWrapper}>
                      <LockIcon size={18} color="#6B7280" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="........"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={10}
                        style={styles.eyeIconButton}
                      >
                        {showPassword ? (
                          <EyeOpenIcon size={20} color="#4B5563" />
                        ) : (
                          <EyeOffIcon size={20} color="#4B5563" />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  {/* Tombol Masuk */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitButton,
                      pressed && styles.submitButtonPressed,
                    ]}
                    onPress={handleLogin}
                  >
                    <LoginIcon size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Masuk</Text>
                  </Pressable>
                </>
              ) : (
                /* Tab Daftar Baru */
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nama Lengkap</Text>
                    <View style={styles.inputFieldWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Nama Lengkap Mahasiswa"
                        placeholderTextColor="#9CA3AF"
                        value={namaLengkap}
                        onChangeText={setNamaLengkap}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: 14 }]}>
                    <Text style={styles.inputLabel}>Nomor Mahasiswa (NIM)</Text>
                    <View style={styles.inputFieldWrapper}>
                      <IdCardIcon size={18} color="#6B7280" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Contoh: 202310370311xxx"
                        placeholderTextColor="#9CA3AF"
                        value={nim}
                        onChangeText={setNim}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: 14 }]}>
                    <Text style={styles.inputLabel}>Email Webmail UMM</Text>
                    <View style={styles.inputFieldWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="nama@webmail.umm.ac.id"
                        placeholderTextColor="#9CA3AF"
                        value={emailUmm}
                        onChangeText={setEmailUmm}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: 14 }]}>
                    <Text style={styles.inputLabel}>Buat Password Baru</Text>
                    <View style={styles.inputFieldWrapper}>
                      <LockIcon size={18} color="#6B7280" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Minimal 8 karakter"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={10}
                        style={styles.eyeIconButton}
                      >
                        {showPassword ? (
                          <EyeOpenIcon size={20} color="#4B5563" />
                        ) : (
                          <EyeOffIcon size={20} color="#4B5563" />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  {/* Tombol Buat Akun */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitButton,
                      pressed && styles.submitButtonPressed,
                    ]}
                    onPress={handleRegister}
                  >
                    <UserPlusIcon size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Daftar Akun Baru</Text>
                  </Pressable>
                </>
              )}

              {/* Garis Pembagi Halus di Bawah Kartu */}
              <View style={styles.cardBottomDividerRow}>
                <View style={styles.cardDividerLine} />
                <View style={styles.cardDividerGap} />
                <View style={styles.cardDividerLine} />
              </View>
            </View>

            {/* 6. Footer Tautan */}
            <View style={styles.footerContainer}>
              <View style={styles.registerPromptRow}>
                <Text style={styles.registerPromptText}>
                  {activeTab === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                </Text>
                <Pressable
                  onPress={() =>
                    setActiveTab(activeTab === 'login' ? 'register' : 'login')
                  }
                >
                  <Text style={styles.registerLinkText}>
                    {activeTab === 'login' ? 'Daftar' : 'Masuk'}
                  </Text>
                </Pressable>
              </View>

              {/* Bantuan Admin */}
              <Pressable
                style={styles.helpAdminRow}
                onPress={() =>
                  Alert.alert(
                    'Bantuan SIMAK UMM',
                    'Hubungi Layanan Terpadu SIMAK UMM melalui email: simak-support@umm.ac.id atau WhatsApp Admin: 0812-3456-7890'
                  )
                }
              >
                <HelpQuestionIcon size={16} color="#0284C7" />
                <Text style={styles.helpAdminText}>Butuh bantuan? Hubungi Admin</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  topBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEBFE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  logoTextCol: {
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F2850',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#EBE9E4',
    borderRadius: 14,
    padding: 4,
    marginTop: 20,
    height: 50,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 7,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 14,
  },
  tabButtonTextActive: {
    fontWeight: '700',
    color: '#0F2850',
  },
  tabButtonTextInactive: {
    fontWeight: '600',
    color: '#4B5563',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 8,
  },
  inputFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
    marginLeft: 10,
    paddingVertical: 0,
  },
  eyeIconButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#0B2146',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBottomDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  cardDividerGap: {
    width: 60,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPromptText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#4B5563',
  },
  registerLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2850',
    textDecorationLine: 'underline',
  },
  helpAdminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  helpAdminText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
