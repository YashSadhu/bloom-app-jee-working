import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  isPrimary?: boolean;
  style?: ViewStyle;
}

export default function ActionButton({ 
  title, 
  icon, 
  onPress, 
  isPrimary = true,
  style
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={
          isPrimary 
            ? ["#ffffff", "#f0f4ff"] 
            : ["rgba(255,255,255,0.9)", "rgba(240,244,255,0.9)"]
        }
        style={styles.buttonGradient}
      >
        <Ionicons 
-         name={icon as any} 
+         name={icon as keyof typeof Ionicons.glyphMap} 
          size={24} 
          color="#0d6e8c" 
          style={styles.icon} 
        />
        <Text 
          style={isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  secondaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  icon: {
    marginRight: 10,
  },
  buttonTextPrimary: {
    color: '#0d6e8c',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: '#0d6e8c',
    fontSize: 18,
    fontWeight: '600',
  },
});