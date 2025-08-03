import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubtopicItem from './SubtopicItem';

interface SubTopic {
  id: string;
  name: string;
  checked: boolean;
}

interface TopicItemProps {
  id: string;
  name: string;
  checked: boolean;
  expanded: boolean;
  subTopics: SubTopic[];
  onToggle: () => void;
  onToggleExpand: () => void;
  onToggleSubtopic: (subTopicId: string) => void;
}

export default function TopicItem({ 
  id, 
  name, 
  checked, 
  expanded, 
  subTopics, 
  onToggle, 
  onToggleExpand,
  onToggleSubtopic
}: TopicItemProps) {
  return (
    <View style={styles.topicSection}>
      <TouchableOpacity 
        style={styles.topicHeader}
        onPress={onToggle}
      >
        <View style={styles.topicHeaderLeft}>
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Ionicons name="checkmark" size={10} color="#fff" />}
          </View>
          <Text style={styles.topicTitle}>{name}</Text>
        </View>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          style={styles.expandButton}
        >
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#8E8E93" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
      
      {expanded && subTopics.map(subTopic => (
        <SubtopicItem
          key={subTopic.id}
          id={subTopic.id}
          name={subTopic.name}
          checked={subTopic.checked}
          onToggle={() => onToggleSubtopic(subTopic.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topicSection: {
    marginLeft: 16,
    marginBottom: 8,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FBFBFB',
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginLeft: 10,
    flex: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
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
  expandButton: {
    padding: 8,
    borderRadius: 6,
  },
});