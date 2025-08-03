import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupScreen({
  questions,
  setQuestions,
  setAnswerKey,
  setSolutions,
  setSolutionsUploaded,
  setPendingAutoStart,
  startExam,
  aiCount,
  setAiCount,
  aiTopics,
  setAiTopics,
  generateAI,
  loadingAI,
  newQuestion,
  setNewQuestion,
  showAddQuestion,
  setShowAddQuestion,
  addQuestion,
  handleQuestionsImport,
  downloadQuestionFormat,
  handleAnswerKeyUpload,
  downloadAnswerKeyFormat,
  handleSolutionsUpload,
  downloadSolutionsFormat
}) {
  const scrollViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState<'generate'|'add'|'import'>('generate');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.gradientBackground}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.setupContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>CBT Exam Setup</Text>
            <Text style={styles.headerSubtitle}>Configure your exam experience</Text>
          </View>
          <View style={styles.tabContainer}>
            {/* Tabs... */}
          </View>
          {/* Generate / Add / Import sections go here, same as original code but using props */}
          {questions.length > 0 && (
            <View style={styles.questionsPreviewContainer}>
              {/* Preview code */}
              <TouchableOpacity style={styles.startExamButton} onPress={startExam}>
                <LinearGradient colors={['#4CAF50', '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startExamGradient}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.startExamText}>Start Exam ({questions.length} Questions)</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { flex: 1 },
  setupContainer: { flexGrow: 1, padding: 20, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 16, color: '#fff', marginTop: 8, opacity: 0.8 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 25, padding: 4, width: '100%' },
  questionsPreviewContainer: { marginTop: 20, width: '100%' },
  startExamButton: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  startExamGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  startExamText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }
});