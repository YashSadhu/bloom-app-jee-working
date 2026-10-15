import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopicItem from './TopicItem';

import { SubTopic, Topic, Chapter } from './types';

interface ChapterListProps {
  chapters: Chapter[];
  subjectId: string;
  onToggleChapter: (chapterId: string) => void;
  onToggleChapterExpanded: (chapterId: string) => void;
  onToggleTopic: (chapterId: string, topicId: string) => void;
  onToggleTopicExpanded: (chapterId: string, topicId: string) => void;
  onToggleSubTopic: (chapterId: string, topicId: string, subTopicId: string) => void;
}

export default function ChapterList({ 
  chapters, 
  subjectId,
  onToggleChapter,
  onToggleChapterExpanded,
  onToggleTopic,
  onToggleTopicExpanded,
  onToggleSubTopic
}: ChapterListProps) {
  return (
    <View style={styles.chaptersContainer}>
      {chapters.map(chapter => (
        <View key={chapter.id} style={styles.chapterSection}>
          <TouchableOpacity 
            style={styles.chapterHeader}
            onPress={() => onToggleChapter(chapter.id)}
          >
            <View style={styles.chapterHeaderLeft}>
              <View style={[styles.checkbox, chapter.checked && styles.checkboxChecked]}>
                {chapter.checked && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.chapterTitle}>{chapter.name}</Text>
            </View>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onToggleChapterExpanded(chapter.id);
              }}
              style={styles.expandButton}
            >
              <Ionicons 
                name={chapter.expanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#8E8E93" 
              />
            </TouchableOpacity>
          </TouchableOpacity>
          
          {chapter.expanded && chapter.topics.map(topic => (
            <TopicItem
              key={topic.id}
              id={topic.id}
              name={topic.name}
              checked={topic.checked}
              expanded={topic.expanded || false}
              subTopics={topic.subTopics}
              onToggle={() => onToggleTopic(chapter.id, topic.id)}
              onToggleExpand={() => onToggleTopicExpanded(chapter.id, topic.id)}
              onToggleSubtopic={(subTopicId) => onToggleSubTopic(chapter.id, topic.id, subTopicId)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chaptersContainer: {
    paddingBottom: 20,
  },
  chapterSection: {
    marginBottom: 12,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chapterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
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