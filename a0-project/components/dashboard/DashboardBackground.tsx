import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function DashboardBackground({ children, style }: DashboardBackgroundProps) {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F0F8FF', '#E6F3FF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View style={styles.overlay} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});