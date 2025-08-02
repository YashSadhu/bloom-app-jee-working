import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles/testStyles';

interface UploadScreenProps {
  onUploadQuestions: () => void;
  onUploadAnswerKey: () => void;
  onUploadSolutions: () => void;
  onShowTopicSelection: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onUploadQuestions,
  onUploadAnswerKey,
  onUploadSolutions,
  onShowTopicSelection
}) => {
  const handleAIGeneration = () => {
    console.log('AI Generation button pressed');
    onShowTopicSelection();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteBackground}>
        <ScrollView contentContainerStyle={styles.uploadContainer}>
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>JEE Test Environment</Text>
            <Text style={styles.uploadSubtitle}>
              Generate questions with AI or upload your own JSON files
            </Text>

            {/* AI Generation Option */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleAIGeneration}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00d2ff', '#3a7bd5']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🤖 Generate with AI</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Upload Options */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onUploadQuestions}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>📄 Upload Questions</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onUploadAnswerKey}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4834d4', '#686de0']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🔑 Upload Answer Key (Optional)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onUploadSolutions}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2ed573', '#7bed9f']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>📚 Upload Solutions (Optional)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.formatInfo}>
              <Text style={styles.formatTitle}>🚀 AI Generation:</Text>
              <Text style={styles.formatText}>
                Select your JEE topics and let AI create personalized questions instantly!
              </Text>
              <Text style={styles.formatTitle}>📋 Manual Upload Format:</Text>
              <Text style={styles.formatText}>
                Questions: Array of objects with questionNumber, question, optionA-D, subject, topic
              </Text>
              <Text style={styles.formatText}>
                Answers: Object with question numbers as keys and correct options as values
              </Text>
              <Text style={styles.formatText}>
                Solutions: Array with questionNumber, detailedSolution, correctOption, finalAnswer
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};