import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Question, AnswerKey, SolutionKey, TestResults } from '../../types/test';
import { styles } from '../../styles/testStyles';

interface AnalysisScreenProps {
  answerKey: AnswerKey;
  userAnswers: AnswerKey;
  questions: Question[];
  solutions: SolutionKey;
  calculateResults: () => TestResults;
  onReviewAnswers: () => void;
  onShowSolutions: () => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  answerKey,
  userAnswers,
  questions,
  solutions,
  calculateResults,
  onReviewAnswers,
  onShowSolutions
}) => {
  // If no answer key is available, show basic completion message
  if (Object.keys(answerKey).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.whiteBackground}>
          <ScrollView style={styles.analysisContainer}>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>Test Completed!</Text>
              
              <View style={styles.scoreCard}>
                <Text style={styles.scoreText}>Test Submitted Successfully</Text>
                <Text style={styles.percentageText}>✓</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Object.keys(userAnswers).length}</Text>
                  <Text style={styles.statLabel}>Attempted</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{questions.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{questions.length - Object.keys(userAnswers).length}</Text>
                  <Text style={styles.statLabel}>Unanswered</Text>
                </View>
              </View>

              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>📝 Note:</Text>
                <Text style={styles.formatText}>
                  Answer key was not provided, so detailed analysis is not available. 
                  You can review your answers below.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.reviewButton}
                onPress={onReviewAnswers}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewButtonText}>Review Your Answers</Text>
              </TouchableOpacity>

              {Object.keys(solutions).length > 0 && (
                <TouchableOpacity
                  style={styles.solutionButton}
                  onPress={onShowSolutions}
                  activeOpacity={0.8}
                >
                  <Text style={styles.solutionButtonText}>View Detailed Solutions</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // If answer key is available, show detailed analysis
  const results = calculateResults();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteBackground}>
        <ScrollView style={styles.analysisContainer}>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Test Analysis</Text>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>Score: {results.correct}/{results.total}</Text>
              <Text style={styles.percentageText}>{results.percentage}%</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{results.attempted}</Text>
                <Text style={styles.statLabel}>Attempted</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{results.correct}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{results.attempted - results.correct}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
            </View>

            <Text style={styles.subjectTitle}>Subject-wise Performance</Text>
            {Object.entries(results.subjectWise).map(([subject, stats]) => (
              <View key={subject} style={styles.subjectRow}>
                <Text style={styles.subjectName}>{subject}</Text>
                <Text style={styles.subjectScore}>
                  {stats.correct}/{stats.total} ({((stats.correct/stats.total)*100).toFixed(1)}%)
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={onReviewAnswers}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>Review Answers</Text>
            </TouchableOpacity>

            {Object.keys(solutions).length > 0 && (
              <TouchableOpacity
                style={styles.solutionButton}
                onPress={onShowSolutions}
                activeOpacity={0.8}
              >
                <Text style={styles.solutionButtonText}>View Detailed Solutions</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};