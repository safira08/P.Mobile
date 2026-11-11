import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PickedMediaResult {
  uri: string;
  name: string;
  type: string;
  size?: string;
  isImage: boolean;
  rawFile?: Blob;
}

function formatFileSize(bytes?: number): string | undefined {
  if (bytes === undefined) {
    return undefined;
  }

  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

function showPickerError(title: string, message: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

export async function takePhotoWithCamera(
  aspect: [number, number] = [1, 1]
): Promise<PickedMediaResult | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showPickerError(
        'Izin Kamera Ditolak',
        'Aplikasi membutuhkan izin akses kamera untuk mengambil foto secara langsung.'
      );
      return null;
    }
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || `kamera_${Date.now()}.jpg`,
    type: asset.mimeType || 'image/jpeg',
    size: formatFileSize(asset.fileSize),
    isImage: true,
    rawFile: asset.file,
  };
}

export async function pickImageFromGallery(
  aspect: [number, number] = [1, 1]
): Promise<PickedMediaResult | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showPickerError(
        'Izin Galeri Ditolak',
        'Aplikasi membutuhkan izin akses galeri foto untuk memilih gambar.'
      );
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || `galeri_${Date.now()}.jpg`,
    type: asset.mimeType || 'image/jpeg',
    size: formatFileSize(asset.fileSize),
    isImage: true,
    rawFile: asset.file,
  };
}

export async function pickDocumentFile(
  type: string | string[] = 'application/pdf'
): Promise<PickedMediaResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type,
    copyToCacheDirectory: true,
    base64: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType || 'application/octet-stream';
  return {
    uri: asset.uri,
    name: asset.name,
    type: mimeType,
    size: formatFileSize(asset.size),
    isImage: mimeType.startsWith('image/'),
    rawFile: asset.file,
  };
}

export function showMediaPickerError(title: string, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
  showPickerError(title, message);
}
