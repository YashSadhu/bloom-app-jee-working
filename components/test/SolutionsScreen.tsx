import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Question, AnswerKey, SolutionKey } from '../../types/test';
import { styles } from '../../styles/testStyles';

interface SolutionsScreenProps {
  questions: Question[];
  solutions: SolutionKey;
  userAnswers: AnswerKey;
  onBack: () => void;
}

export const SolutionsScreen: React.FC<SolutionsScreenProps> = ({
  questions,
  solutions,
  userAnswers,
  onBack
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.solutionsContainer}>
        {/* Header */}
        <View style={styles.solutionsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.solutionsTitle}>Detailed Solutions</Text>
        </View>

        <ScrollView style={styles.solutionsScroll}>
          {questions.map((q, index) => {
            const solution = solutions[q.questionNumber.toString()];
            const userAnswer = userAnswers[q.questionNumber.toString()];
            const isCorrect = userAnswer === solution?.correctOption;

            if (!solution) return null;

            return (
              <View key={q.questionNumber} style={styles.solutionCard}>
                <View style={styles.solutionHeader}>
                  <Text style={styles.solutionQuestionNumber}>
                    Question {q.questionNumber}
                  </Text>
                  <View style={[
                    styles.solutionStatus,
                    isCorrect ? styles.solutionCorrect : styles.solutionIncorrect
                  ]}>
                    <Text style={styles.solutionStatusText}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.solutionQuestion}>{q.question}</Text>

                <View style={styles.solutionAnswers}>
                  <Text style={styles.solutionAnswerText}>
                    Your Answer: <Text style={styles.userAnswer}>{userAnswer || 'Not Answered'}</Text>
                  </Text>
                  <Text style={styles.solutionAnswerText}>
                    Correct Answer: <Text style={styles.correctAnswer}>{solution.correctOption}</Text>
                  </Text>
                </View>

                <View style={styles.solutionContent}>
                  <Text style={styles.solutionLabel}>Detailed Solution:</Text>
                  <Text style={styles.solutionText}>{solution.detailedSolution}</Text>
                  
                  <Text style={styles.finalAnswerLabel}>Final Answer:</Text>
                  <Text style={styles.finalAnswerText}>{solution.finalAnswer}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};