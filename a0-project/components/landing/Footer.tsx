import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FooterProps {
  text: string;
}

export default function Footer({ text }: FooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
});