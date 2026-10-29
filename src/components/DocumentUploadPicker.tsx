import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface DocumentUploadFile {
  uri: string;
  name: string;
  type: string;
  size?: string;
}

interface DocumentUploadPickerProps {
  file: DocumentUploadFile;
  isUploading: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onPickDocument: () => void;
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

export default function DocumentUploadPicker({
  file,
  isUploading,
  onTakePhoto,
  onPickFromGallery,
  onPickDocument,
}: DocumentUploadPickerProps) {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isImage = file.type?.startsWith('image/');

  const openUploadOptions = () => {
    if (!isUploading) {
      setShowActionSheet(true);
    }
  };

  const openPreview = () => {
    if (!file?.uri || isUploading) {
      return;
    }
    setShowPreview(true);
  };

  const handleSelectAction = (callback: () => void) => {
    setShowActionSheet(false);
    callback();
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Berkas Dokumen / Foto <Text style={styles.requiredAsterisk}>*</Text>
      </Text>

      <View style={styles.fileCard}>
        <Pressable
          style={styles.fileCardPressable}
          onPress={openPreview}
          disabled={isUploading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isImage && file.uri ? (
            <Image source={{ uri: file.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <PdfFileIcon size={32} />
          )}

          <View style={styles.fileDetailsCol}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileMeta}>
              {file.type} • {file.size || 'Siap tayang'}
            </Text>
            <View style={styles.fileValidatedBadge}>
              <Text style={styles.fileValidatedText}>
                {isImage ? '✓ Foto Dokumen Siap Diunggah' : '✓ Berkas PDF Siap Diunggah'}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={styles.changeFileBtn}
          onPress={openUploadOptions}
          disabled={isUploading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.changeFileBtnText}>Ubah</Text>
        </Pressable>
      </View>

      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowActionSheet(false)}>
          <Pressable style={styles.actionSheet} onPress={() => undefined}>
            <Text style={styles.actionSheetTitle}>Pilih Sumber Dokumen</Text>

            <Pressable
              style={styles.actionSheetItem}
              onPress={() => handleSelectAction(onTakePhoto)}
            >
              <Text style={styles.actionSheetText}>📷 Ambil Foto Dokumen</Text>
            </Pressable>

            <Pressable
              style={styles.actionSheetItem}
              onPress={() => handleSelectAction(onPickFromGallery)}
            >
              <Text style={styles.actionSheetText}>🖼️ Pilih dari Galeri</Text>
            </Pressable>

            <Pressable
              style={styles.actionSheetItem}
              onPress={() => handleSelectAction(onPickDocument)}
            >
              <Text style={styles.actionSheetText}>📁 Pilih File / PDF</Text>
            </Pressable>

            <Pressable
              style={[styles.actionSheetItem, styles.actionSheetCancel]}
              onPress={() => setShowActionSheet(false)}
            >
              <Text style={styles.actionSheetCancelText}>Batal</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setShowPreview(false)}>
          <Pressable style={styles.previewContainer} onPress={() => undefined}>
            <View style={styles.previewHeaderRow}>
              <Text style={styles.previewTitle}>Pratinjau Dokumen</Text>
              <Pressable onPress={() => setShowPreview(false)} style={styles.previewCloseBtn}>
                <Text style={styles.previewCloseText}>Tutup</Text>
              </Pressable>
            </View>

            {isImage && file.uri ? (
              <Image source={{ uri: file.uri }} style={styles.previewLargeImage} resizeMode="contain" />
            ) : (
              <View style={styles.previewPdfBox}>
                <PdfFileIcon size={56} color="#E11D48" />
                <Text style={styles.previewPdfName}>{file.name}</Text>
                <Text style={styles.previewPdfMeta}>{file.type} • {file.size || 'Dokumen PDF'}</Text>
              </View>
            )}

            <Text style={styles.previewName}>{file.name}</Text>
            <Text style={styles.previewMeta}>{file.type} • {file.size || 'Siap ditampilkan'}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    paddingBottom: 12,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2850',
    marginBottom: 12,
  },
  actionSheetItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  actionSheetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSheetCancel: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    marginTop: 4,
  },
  actionSheetCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
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
  },
  fileCardPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  previewImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    maxHeight: '80%',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2850',
  },
  previewCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  previewCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  previewLargeImage: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  previewPdfBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    marginBottom: 12,
  },
  previewPdfName: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#9F1239',
    textAlign: 'center',
  },
  previewPdfMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#BE123C',
    textAlign: 'center',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 12,
    color: '#475569',
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
});
