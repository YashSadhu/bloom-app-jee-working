import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradientColors: string[];
  iconBackgroundColor: string;
  onPress: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradientColors,
  iconBackgroundColor,
  onPress,
}) => (
  <TouchableOpacity
    style={{ marginBottom: 16 }}
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={description}
  >
    <BlurView intensity={20} style={{ borderRadius: 20, overflow: 'hidden' }}>
      <LinearGradient colors={gradientColors} style={{ padding: 24, borderRadius: 20 }}>
        <View style={{ backgroundColor: iconBackgroundColor, borderRadius: 16, padding: 12, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 32 }}>{icon}</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#2d3748', marginBottom: 8 }}>{title}</Text>
        <Text style={{ fontSize: 16, color: '#4a5568' }}>{description}</Text>
      </LinearGradient>
    </BlurView>
  </TouchableOpacity>
);
