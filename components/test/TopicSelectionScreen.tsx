import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AIGenerationState, JEETopic } from '../../types/test';
import { styles } from '../../styles/testStyles';

interface TopicSelectionScreenProps {
  aiState: AIGenerationState;
  setAiState: React.Dispatch<React.SetStateAction<AIGenerationState>>;
  onGenerate: () => void;
  jeeTopics: JEETopic[];
  toggleTopicSelection: (topicId: string) => void;
}

export const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({
  aiState,
  setAiState,
  onGenerate,
  jeeTopics,
  toggleTopicSelection
}) => {
  const groupedTopics = jeeTopics.reduce((acc, topic) => {
    if (!acc[topic.subject]) acc[topic.subject] = [];
    acc[topic.subject].push(topic);
    return acc;
  }, {} as Record<string, JEETopic[]>);

  const handleGenerate = () => {
    console.log('Generate button pressed with topics:', aiState.selectedTopics);
    console.log('Number of questions:', aiState.numberOfQuestions);
    onGenerate();
  };

  const handleBackPress = () => {
    setAiState(prev => ({ ...prev, showTopicSelection: false }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteBackground}>
        <ScrollView contentContainerStyle={styles.uploadContainer}>
          <View style={styles.uploadCard}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.uploadTitle}>Generate JEE Questions</Text>
            <Text style={styles.uploadSubtitle}>
              Select topics and let AI create your personalized test
            </Text>

            {/* Number of Questions */}
            <View style={styles.questionCountContainer}>
              <Text style={styles.questionCountLabel}>Number of Questions:</Text>
              <View style={styles.questionCountButtons}>
                {[5, 10, 15, 20, 25, 30].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.questionCountButton,
                      aiState.numberOfQuestions === num && styles.questionCountButtonActive
                    ]}
                    onPress={() => setAiState(prev => ({ ...prev, numberOfQuestions: num }))}
                  >
                    <Text style={[
                      styles.questionCountButtonText,
                      aiState.numberOfQuestions === num && styles.questionCountButtonTextActive
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Topic Selection by Subject */}
            {Object.entries(groupedTopics).map(([subject, topics]) => (
              <View key={subject} style={styles.subjectSection}>
                <Text style={styles.subjectHeader}>{subject}</Text>
                <View style={styles.topicsGrid}>
                  {topics.map(topic => (
                    <TouchableOpacity
                      key={topic.id}
                      style={[
                        styles.topicButton,
                        aiState.selectedTopics.includes(topic.id) && styles.topicButtonSelected
                      ]}
                      onPress={() => toggleTopicSelection(topic.id)}
                    >
                      <Text style={[
                        styles.topicButtonText,
                        aiState.selectedTopics.includes(topic.id) && styles.topicButtonTextSelected
                      ]}>
                        {topic.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Selected Topics Summary */}
            {aiState.selectedTopics.length > 0 && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryTitle}>
                  Selected: {aiState.selectedTopics.length} topics, {aiState.numberOfQuestions} questions
                </Text>
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton, 
                (aiState.isGenerating || aiState.selectedTopics.length === 0) && styles.generateButtonDisabled
              ]}
              onPress={handleGenerate}
              disabled={aiState.isGenerating || aiState.selectedTopics.length === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  aiState.isGenerating || aiState.selectedTopics.length === 0 
                    ? ['#cccccc', '#999999'] 
                    : ['#00d2ff', '#3a7bd5']
                }
                style={styles.buttonGradient}
              >
                {aiState.isGenerating ? (
                  <View style={styles.generatingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.buttonText}>Generating Questions...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    🤖 Generate {aiState.numberOfQuestions} Questions
                    {aiState.selectedTopics.length === 0 ? ' (Select Topics First)' : ''}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.formatInfo}>
              <Text style={styles.formatTitle}>✨ AI Features:</Text>
              <Text style={styles.formatText}>
                • Generates JEE-level questions automatically
              </Text>
              <Text style={styles.formatText}>
                • Creates answer key and detailed solutions
              </Text>
              <Text style={styles.formatText}>
                • Customized based on your selected topics
              </Text>
              <Text style={styles.formatText}>
                • Starts test immediately after generation
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};