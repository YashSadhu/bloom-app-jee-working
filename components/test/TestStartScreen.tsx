import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Question, AnswerKey, SolutionKey } from '../../types/test';
import { styles } from '../../styles/testStyles';

interface TestStartScreenProps {
  questions: Question[];
  answerKey: AnswerKey;
  solutions: SolutionKey;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  onStartTest: () => void;
}

export const TestStartScreen: React.FC<TestStartScreenProps> = ({
  questions,
  answerKey,
  solutions,
  timeRemaining,
  formatTime,
  onStartTest
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteBackground}>
        <View style={styles.startContainer}>
          <View style={styles.startCard}>
            <Text style={styles.startTitle}>Ready to Begin?</Text>
            <Text style={styles.startInfo}>
              📝 {questions.length} Questions Loaded
            </Text>
            <Text style={styles.startInfo}>
              ⏱️ Time Limit: {formatTime(timeRemaining)}
            </Text>
            <Text style={styles.startInfo}>
              🎯 Answer Key: {Object.keys(answerKey).length > 0 ? 'Available' : 'Not Available'}
            </Text>
            <Text style={styles.startInfo}>
              📚 Solutions: {Object.keys(solutions).length > 0 ? 'Available' : 'Not Available'}
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={onStartTest}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00d2ff', '#3a7bd5']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Test</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};