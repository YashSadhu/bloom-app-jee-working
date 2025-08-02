import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Question, AnswerKey, Solution, SolutionKey, TestResults } from '../types/test';

export const useTestLogic = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerKey, setAnswerKey] = useState<AnswerKey>({});
  const [solutions, setSolutions] = useState<SolutionKey>({});
  const [userAnswers, setUserAnswers] = useState<AnswerKey>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3); // 3 seconds for testing
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Timer effect
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            setShowAnalysis(true);
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
    Alert.alert(
      'Submit Test',
      'Are you sure you want to submit your test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            setTestCompleted(true);
            setShowAnalysis(true);
          }
        }
      ]
    );
  };

  const calculateResults = (): TestResults => {
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

  return {
    questions,
    setQuestions,
    answerKey,
    setAnswerKey,
    solutions,
    setSolutions,
    userAnswers,
    setUserAnswers,
    currentQuestion,
    setCurrentQuestion,
    testStarted,
    setTestStarted,
    testCompleted,
    setTestCompleted,
    timeRemaining,
    setTimeRemaining,
    showAnalysis,
    setShowAnalysis,
    showSolutions,
    setShowSolutions,
    showReview,
    setShowReview,
    selectAnswer,
    navigateQuestion,
    jumpToQuestion,
    submitTest,
    calculateResults,
    formatTime
  };
};