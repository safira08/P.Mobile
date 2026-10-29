import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AccelerometerCardProps {
  x: number;
  y: number;
  z: number;
  shakeDetected: boolean;
  shakeCount: number;
}

export default function AccelerometerCard({
  x,
  y,
  z,
  shakeDetected,
  shakeCount,
}: AccelerometerCardProps) {
  return (
    <View style={styles.sensorCard}>
      <View style={styles.sensorHeaderRow}>
        <Text style={styles.sensorTitle}>Sensor Accelerometer</Text>
        <View style={[styles.shakePill, shakeDetected && styles.shakePillActive]}>
          <Text style={styles.shakePillText}>{shakeDetected ? 'Goyangan Terdeteksi' : 'Standby'}</Text>
        </View>
      </View>

      <View style={styles.sensorGrid}>
        <View style={styles.sensorValueBox}>
          <Text style={styles.sensorLabel}>X</Text>
          <Text style={styles.sensorValue}>{x.toFixed(2)}</Text>
        </View>
        <View style={styles.sensorValueBox}>
          <Text style={styles.sensorLabel}>Y</Text>
          <Text style={styles.sensorValue}>{y.toFixed(2)}</Text>
        </View>
        <View style={styles.sensorValueBox}>
          <Text style={styles.sensorLabel}>Z</Text>
          <Text style={styles.sensorValue}>{z.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sensorMeta}>Shake count: {shakeCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
