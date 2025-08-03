import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubtopicItemProps {
  id: string;
  name: string;
  checked: boolean;
  onToggle: () => void;
}

export default function SubtopicItem({ id, name, checked, onToggle }: SubtopicItemProps) {
  return (
    <TouchableOpacity 
      style={styles.subTopicItem}
      onPress={onToggle}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={8} color="#fff" />}
      </View>
      <Text style={styles.subTopicText}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  subTopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 16,
    marginBottom: 4,
  },
  subTopicText: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 10,
    flex: 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});