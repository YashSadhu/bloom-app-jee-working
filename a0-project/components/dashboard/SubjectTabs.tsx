import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Subject {
  id: string;
  name: string;
}

interface SubjectTabsProps {
  subjects: Subject[];
  activeSubject: string;
  onSelectSubject: (subjectId: string) => void;
}

export default function SubjectTabs({ subjects, activeSubject, onSelectSubject }: SubjectTabsProps) {
  return (
    <View style={styles.subjectTabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.subjectTabs}
      >
        {subjects.map(subject => (
          <TouchableOpacity
            key={subject.id}
            style={[
              styles.subjectTab,
              activeSubject === subject.id && styles.activeSubjectTab
            ]}
            onPress={() => onSelectSubject(subject.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSubject === subject.id }}
            accessibilityLabel={`${subject.name} subject tab`}
          >
            <Text 
              style={[
                styles.subjectTabText,
                activeSubject === subject.id && styles.activeSubjectTabText
              ]}
            >
              {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subjectTabsContainer: {
    marginBottom: 20,
  },
  subjectTabs: {
    paddingHorizontal: 20,
  },
  subjectTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSubjectTab: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeSubjectTabText: {
    color: '#FFFFFF',
  },
});