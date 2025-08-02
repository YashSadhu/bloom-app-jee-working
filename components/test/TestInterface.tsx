import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Question, AnswerKey } from '../../types/test';
import { styles } from '../../styles/testStyles';

interface TestInterfaceProps {
  questions: Question[];
  currentQuestion: number;
  userAnswers: AnswerKey;
  answerKey: AnswerKey;
  testCompleted: boolean;
  showReview: boolean;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  onSelectAnswer: (option: string) => void;
  onNavigateQuestion: (direction: 'prev' | 'next') => void;
  onJumpToQuestion: (index: number) => void;
  onSubmitTest: () => void;
  onBackToAnalysis: () => void;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({
  questions,
  currentQuestion,
  userAnswers,
  answerKey,
  testCompleted,
  showReview,
  timeRemaining,
  formatTime,
  onSelectAnswer,
  onNavigateQuestion,
  onJumpToQuestion,
  onSubmitTest,
  onBackToAnalysis
}) => {
  const currentQ = questions[currentQuestion];
  const questionNum = currentQ.questionNumber.toString();
  const selectedAnswer = userAnswers[questionNum];
  const correctAnswer = answerKey[questionNum];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteBackground}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {showReview ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackToAnalysis}
              >
                <Text style={styles.backButtonText}>← Back to Analysis</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            )}
            <Text style={styles.questionCounter}>
              {currentQuestion + 1} / {questions.length}
            </Text>
          </View>
        </View>

        {/* Question Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionNav}>
          {questions.map((_, index) => {
            const qNum = questions[index].questionNumber.toString();
            const isAnswered = userAnswers[qNum];
            const isCurrent = index === currentQuestion;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.navButton,
                  isCurrent && styles.navButtonActive,
                  isAnswered && styles.navButtonAnswered,
                ]}
                onPress={() => onJumpToQuestion(index)}
              >
                <Text style={[
                  styles.navButtonText,
                  isCurrent && styles.navButtonTextActive
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Question Content */}
        <View style={styles.questionContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.subjectTag}>{currentQ.subject}</Text>
                <Text style={styles.topicTag}>{currentQ.topic}</Text>
              </View>
              
              <Text style={styles.questionText}>{currentQ.question}</Text>

              {/* Options */}
              {['A', 'B', 'C', 'D'].map(option => {
                const optionKey = `option${option}` as keyof Question;
                const isSelected = selectedAnswer === option;
                const isCorrect = testCompleted && correctAnswer === option;
                const isWrong = testCompleted && selectedAnswer === option && correctAnswer !== option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionSelected,
                      isCorrect && styles.optionCorrect,
                      isWrong && styles.optionWrong,
                    ]}
                    onPress={() => !testCompleted && !showReview && onSelectAnswer(option)}
                    disabled={testCompleted || showReview}
                  >
                    <Text style={styles.optionLabel}>{option}.</Text>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {currentQ[optionKey]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity
              style={[styles.navFooterButton, currentQuestion === 0 && styles.navButtonDisabled]}
              onPress={() => onNavigateQuestion('prev')}
              disabled={currentQuestion === 0}
            >
              <Text style={styles.navFooterButtonText}>Previous</Text>
            </TouchableOpacity>

            {showReview ? (
              <TouchableOpacity
                style={styles.analysisButton}
                onPress={onBackToAnalysis}
                activeOpacity={0.8}
              >
                <Text style={styles.analysisButtonText}>Back to Analysis</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmitTest}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit Test</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.navFooterButton,
                currentQuestion === questions.length - 1 && styles.navButtonDisabled
              ]}
              onPress={() => onNavigateQuestion('next')}
              disabled={currentQuestion === questions.length - 1}
            >
              <Text style={styles.navFooterButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};