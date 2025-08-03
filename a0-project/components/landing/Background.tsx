import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Background({ children, style }: BackgroundProps) {
  return (
    <LinearGradient
      colors={["#0d6e8c", "#0a9dbd", "#5ccfe6"]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});