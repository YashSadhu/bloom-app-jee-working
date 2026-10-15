import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface HeaderProps {
  appName: string;
  tagline: string;
}

export default function Header({ appName, tagline }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
});