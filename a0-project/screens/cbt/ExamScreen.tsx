import React from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ExamScreenProps {
  questions: Question[];
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  answers: Record<string, string>;
  handleAnswerSelect: (questionId: string, option: string) => void;
  flagged: Set<string>;
  toggleFlag: (questionId: string) => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  handleSubmitExam: () => void;
}

export default function ExamScreen({
  questions,
  currentQuestion,
  setCurrentQuestion,
  answers,
  handleAnswerSelect,
  flagged,
  toggleFlag,
  timeLeft,
  formatTime,
  handleSubmitExam
}: ExamScreenProps) {
  // TODO: implement the component UI
}


  return (
    <SafeAreaView style={styles.container}>
      {/* Exam header, question palette, body, navigation bar extracted from CBTExam.tsx */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});