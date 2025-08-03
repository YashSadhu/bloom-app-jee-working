import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const navigation = useNavigation();
  
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.navigate('CBTExam')}
        style={styles.headerButton}
      >
        <View style={styles.headerButtonBackground}>
          <Ionicons name="play" size={20} color="#007AFF" />
        </View>
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    zIndex: 1,
  },
  headerButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '500',
  },
});