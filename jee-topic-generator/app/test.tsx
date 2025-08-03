import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

const { width, height } = Dimensions.get('window');

interface Question {
  questionNumber: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subject: string;
  topic: string;
}

interface AnswerKey {
  [key: string]: string;
}

interface Solution {
  questionNumber: number;
  detailedSolution: string;
  correctOption: string;
  finalAnswer: string;
}

interface SolutionKey {
  [key: string]: Solution;
}

export default function TestEnvironment() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerKey, setAnswerKey] = useState<AnswerKey>({});
  const [solutions, setSolutions] = useState<SolutionKey>({});
  const [userAnswers, setUserAnswers] = useState<AnswerKey>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10800); // 3 hours in seconds
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showReview, setShowReview] = useState(false); // Add this new state

  // Timer effect
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            setShowAnalysis(true); // Show analysis when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const uploadQuestions = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const response = await fetch(result.assets[0].uri);
        const jsonData = await response.text();
        const parsedQuestions = JSON.parse(jsonData);
        
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          Alert.alert('Success', `${parsedQuestions.length} questions loaded successfully!`);
        } else {
          Alert.alert('Error', 'Invalid question format');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions. Please check the JSON format.');
    }
  };

  const uploadAnswerKey = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const response = await fetch(result.assets[0].uri);
        const jsonData = await response.text();
        const parsedAnswers = JSON.parse(jsonData);
        
        setAnswerKey(parsedAnswers);
        Alert.alert('Success', 'Answer key loaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load answer key.');
    }
  };

  const uploadSolutions = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const response = await fetch(result.assets[0].uri);
        const jsonData = await response.text();
        const parsedSolutions = JSON.parse(jsonData);
        
        if (Array.isArray(parsedSolutions) && parsedSolutions.length > 0) {
          const solutionMap: SolutionKey = {};
          parsedSolutions.forEach((sol: Solution) => {
            solutionMap[sol.questionNumber.toString()] = sol;
          });
          setSolutions(solutionMap);
          Alert.alert('Success', `${parsedSolutions.length} solutions loaded successfully!`);
        } else {
          Alert.alert('Error', 'Invalid solution format');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load solutions. Please check the JSON format.');
    }
  };

  const selectAnswer = (option: string) => {
    handleHaptic();
    const questionNum = questions[currentQuestion].questionNumber.toString();
    setUserAnswers(prev => ({
      ...prev,
      [questionNum]: option
    }));
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    handleHaptic();
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (direction === 'next' && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    handleHaptic();
    setCurrentQuestion(index);
  };

  const submitTest = () => {
    handleHaptic();
    setTestCompleted(true);
    setShowAnalysis(true);
  };

  const calculateResults = () => {
    let correct = 0;
    let attempted = 0;
    const subjectWise: { [key: string]: { correct: number; total: number } } = {};

    questions.forEach(q => {
      const qNum = q.questionNumber.toString();
      const userAnswer = userAnswers[qNum];
      const correctAnswer = answerKey[qNum];

      if (!subjectWise[q.subject]) {
        subjectWise[q.subject] = { correct: 0, total: 0 };
      }
      subjectWise[q.subject].total++;

      if (userAnswer) {
        attempted++;
        if (userAnswer === correctAnswer) {
          correct++;
          subjectWise[q.subject].correct++;
        }
      }
    });

    return {
      correct,
      attempted,
      total: questions.length,
      percentage: questions.length > 0 ? (correct / questions.length * 100).toFixed(1) : '0',
      subjectWise
    };
  };

  // Upload Screen
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.whiteBackground}>
          <ScrollView contentContainerStyle={styles.uploadContainer}>
            <View style={styles.uploadCard}>
              <Text style={styles.uploadTitle}>JEE Test Environment</Text>
              <Text style={styles.uploadSubtitle}>
                Upload your question JSON file to start the test
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadQuestions}
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
                onPress={uploadAnswerKey}
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
                onPress={uploadSolutions}
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
                <Text style={styles.formatTitle}>Expected JSON Format:</Text>
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
  }

  // Test Start Screen
  if (!testStarted) {
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
                onPress={() => {
                  handleHaptic();
                  setTestStarted(true);
                }}
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
  }

  // Analysis Screen
  if (showAnalysis) {
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
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={uploadAnswerKey}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#4834d4', '#686de0']}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>🔑 Upload Answer Key</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={uploadSolutions}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2ed573', '#7bed9f']}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>📚 Upload Solutions</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    setShowAnalysis(false);
                    setShowReview(true); // Set review mode instead of just hiding analysis
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reviewButtonText}>Review Your Answers</Text>
                </TouchableOpacity>

                {Object.keys(solutions).length > 0 && (
                  <TouchableOpacity
                    style={styles.solutionButton}
                    onPress={() => setShowSolutions(true)}
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
                onPress={() => {
                  setShowAnalysis(false);
                  setShowReview(true); // Set review mode instead of just hiding analysis
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewButtonText}>Review Answers</Text>
              </TouchableOpacity>

              {Object.keys(solutions).length > 0 && (
                <TouchableOpacity
                  style={styles.solutionButton}
                  onPress={() => setShowSolutions(true)}
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

  // Solutions Screen
  if (showSolutions && Object.keys(solutions).length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.solutionsContainer}>
          {/* Header */}
          <View style={styles.solutionsHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowSolutions(false)}
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
  }

  // Main Test Interface
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
                onPress={() => {
                  setShowReview(false);
                  setShowAnalysis(true);
                }}
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
                onPress={() => jumpToQuestion(index)}
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
        <ScrollView
  style={styles.contentArea}
  contentContainerStyle={styles.contentContainer}
  showsVerticalScrollIndicator={false}
>
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
                    onPress={() => !testCompleted && !showReview && selectAnswer(option)}
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

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity
              style={[styles.navFooterButton, currentQuestion === 0 && styles.navButtonDisabled]}
              onPress={() => navigateQuestion('prev')}
              disabled={currentQuestion === 0}
            >
              <Text style={styles.navFooterButtonText}>Previous</Text>
            </TouchableOpacity>

            {showReview ? (
              <TouchableOpacity
                style={styles.analysisButton}
                onPress={() => {
                  setShowReview(false);
                  setShowAnalysis(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.analysisButtonText}>Back to Analysis</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitTest}
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
              onPress={() => navigateQuestion('next')}
              disabled={currentQuestion === questions.length - 1}
            >
              <Text style={styles.navFooterButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  uploadTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  formatInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formatText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  startCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  startTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  startInfo: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  startButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 4, // reduce vertical padding
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff6b6b',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  questionNav: {
    paddingVertical: 4, // keep reduced vertical padding
    paddingHorizontal: 4, // reduce horizontal padding for more MCQ space
    backgroundColor: '#ffffff',
    paddingBottom: 0,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButtonActive: {
    backgroundColor: '#4834d4',
    borderColor: '#4834d4',
  },
  navButtonAnswered: {
    backgroundColor: '#00d2ff',
    borderColor: '#00d2ff',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  navButtonTextActive: {
    color: '#ffffff',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    // highlight-start
    paddingHorizontal: 24, // Keeps the side padding
    paddingVertical: 12,   // Reduces top and bottom padding
    // highlight-end
    marginBottom: 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
},

  questionHeader: {
    flexDirection: 'row',
    marginBottom: 0, // remove margin below question header
  },
  subjectTag: {
    backgroundColor: '#4834d4',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  topicTag: {
    backgroundColor: '#f0f0f0',
    color: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    backgroundColor: 'rgba(72, 52, 212, 0.1)',
    borderColor: '#4834d4',
  },
  optionCorrect: {
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderColor: '#2ed573',
  },
  optionWrong: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#ff6b6b',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginRight: 12,
    minWidth: 20,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#333333',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navFooterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navFooterButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  analysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4834d4',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  subjectScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4834d4',
  },
  reviewButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  solutionButton: {
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: '#2ed573',
    borderRadius: 12,
    alignItems: 'center',
  },
  solutionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  solutionsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  solutionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  solutionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 16,
  },
  solutionsScroll: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  solutionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionQuestionNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  solutionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  solutionCorrect: {
    backgroundColor: '#d4edda',
  },
  solutionIncorrect: {
    backgroundColor: '#f8d7da',
  },
  solutionStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  solutionQuestion: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  solutionAnswers: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  solutionAnswerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userAnswer: {
    fontWeight: '600',
    color: '#ff6b6b',
  },
  correctAnswer: {
    fontWeight: '600',
    color: '#2ed573',
  },
  solutionContent: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  solutionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  solutionText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 16,
  },
  finalAnswerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  finalAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ed573',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
  },
  analysisButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4834d4',
    borderRadius: 12,
  },
  analysisButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});