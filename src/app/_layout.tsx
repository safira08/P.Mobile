import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppOffline, setIsAppOffline] = useState(false);

  const refreshConnectionState = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsAppOffline(!state.isConnected || state.isInternetReachable === false);
  }, []);

  useEffect(() => {
    const updateConnectionState = (state: NetInfoState) => {
      const offline = !state.isConnected || state.isInternetReachable === false;
      setIsAppOffline(offline);
    };

    NetInfo.fetch().then(updateConnectionState);

    const unsubscribe = NetInfo.addEventListener(updateConnectionState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Sembunyikan native splash screen segera setelah aplikasi siap
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <View style={styles.appShell}>
          {isAppOffline ? (
            <View style={styles.globalOfflineBanner}>
              <Text style={styles.globalOfflineText}>Offline: Nyalakan koneksi internet terlebih dahulu.</Text>
              <Pressable style={styles.retryButton} onPress={refreshConnectionState}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </Pressable>
            </View>
          ) : null}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="unggah" options={{ headerShown: false }} />
          </Stack>
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  globalOfflineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#7C2D12',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  globalOfflineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryButtonText: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '700',
  },
});
