import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Question, AnswerKey, Solution, SolutionKey, JEETopic, AIGenerationState } from '../types/test';
import { jeeTopics } from '../data/jeeTopics';
import { UploadScreen } from '../components/test/UploadScreen';
import { TopicSelectionScreen } from '../components/test/TopicSelectionScreen';
import { TestStartScreen } from '../components/test/TestStartScreen';
import { TestInterface } from '../components/test/TestInterface';
import { AnalysisScreen } from '../components/test/AnalysisScreen';
import { SolutionsScreen } from '../components/test/SolutionsScreen';
import { useTestLogic } from '../hooks/useTestLogic';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { styles } from '../styles/testStyles';

export default function TestEnvironment() {
  const {
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
  } = useTestLogic();

  const {
    uploadQuestions,
    uploadAnswerKey,
    uploadSolutions
  } = useFileUpload(setQuestions, setAnswerKey, setSolutions);

  const {
    aiState,
    setAiState,
    toggleTopicSelection,
    generateQuestionsWithAI
  } = useAIGeneration(setQuestions, setAnswerKey, setTestStarted);

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleShowTopicSelection = () => {
    console.log('Showing topic selection screen');
    setAiState(prev => ({ ...prev, showTopicSelection: true }));
  };

  // Upload Screen
  if (questions.length === 0 && !aiState.showTopicSelection) {
    return (
      <UploadScreen
        onUploadQuestions={uploadQuestions}
        onUploadAnswerKey={uploadAnswerKey}
        onUploadSolutions={uploadSolutions}
        onShowTopicSelection={handleShowTopicSelection}
      />
    );
  }

  // Topic Selection Screen
  if (aiState.showTopicSelection) {
    return (
      <TopicSelectionScreen
        aiState={aiState}
        setAiState={setAiState}
        onGenerate={generateQuestionsWithAI}
        jeeTopics={jeeTopics}
        toggleTopicSelection={toggleTopicSelection}
      />
    );
  }

  // Test Start Screen
  if (questions.length > 0 && !testStarted) {
    return (
      <TestStartScreen
        questions={questions}
        answerKey={answerKey}
        solutions={solutions}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        onStartTest={() => {
          handleHaptic();
          setTestStarted(true);
        }}
      />
    );
  }

  // Analysis Screen
  if (showAnalysis) {
    return (
      <AnalysisScreen
        answerKey={answerKey}
        userAnswers={userAnswers}
        questions={questions}
        solutions={solutions}
        calculateResults={calculateResults}
        onReviewAnswers={() => {
          setShowAnalysis(false);
          setShowReview(true);
        }}
        onShowSolutions={() => setShowSolutions(true)}
      />
    );
  }

  // Solutions Screen
  if (showSolutions && Object.keys(solutions).length > 0) {
    return (
      <SolutionsScreen
        questions={questions}
        solutions={solutions}
        userAnswers={userAnswers}
        onBack={() => setShowSolutions(false)}
      />
    );
  }

  // Main Test Interface
  return (
    <TestInterface
      questions={questions}
      currentQuestion={currentQuestion}
      userAnswers={userAnswers}
      answerKey={answerKey}
      testCompleted={testCompleted}
      showReview={showReview}
      timeRemaining={timeRemaining}
      formatTime={formatTime}
      onSelectAnswer={selectAnswer}
      onNavigateQuestion={navigateQuestion}
      onJumpToQuestion={jumpToQuestion}
      onSubmitTest={submitTest}
      onBackToAnalysis={() => {
        setShowReview(false);
        setShowAnalysis(true);
      }}
    />
  );
}