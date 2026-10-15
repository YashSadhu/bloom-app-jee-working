import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  subject: string;
  topic: string;
}

// default sampleQuestions preserved, but we'll allow importing custom JSON
const defaultQuestions: Question[] = [
  {
    id: 1,
    question: 'What is 2 + 2?',
    optionA: '1',
    optionB: '2',
    optionC: '3',
    optionD: '4',
    correctAnswer: 'D',
    subject: 'Mathematics',
    topic: 'Basic Arithmetic',
  },
  {
    id: 2,
    question: 'Who proposed the atomic theory?',
    optionA: 'Newton',
    optionB: 'Dalton',
    optionC: 'Einstein',
    optionD: 'Bohr',
    correctAnswer: 'B',
    subject: 'Chemistry',
    topic: 'General Topics',
  },
  {
    id: 3,
    question: 'Acceleration due to gravity on Earth is roughly?',
    optionA: '8.9 m/s²',
    optionB: '9.8 m/s²',
    optionC: '10.8 m/s²',
    optionD: '7.8 m/s²',
    correctAnswer: 'B',
    subject: 'Physics',
    topic: 'Mechanics',
  },
];

export default function ExamScreen() {
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [answerKey, setAnswerKey] = useState<{ [id: number]: 'A'|'B'|'C'|'D' }>({});
  const navigation = useNavigation();
  const [examDuration, setExamDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: 'A' | 'B' | 'C' | 'D' | null }>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [examCompleted, setExamCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  // JSON import handlers
  const importQuestionsJson = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (res.type === 'success') {
        const content = await FileSystem.readAsStringAsync(res.uri);
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          const valid = data.filter((q: any) => q.id && q.question && q.optionA);
          if (valid.length) {
            setQuestions(valid);
            Alert.alert('Imported', `${valid.length} questions imported`);
            return;
          }
        }
        Alert.alert('Invalid format', 'Ensure JSON is an array of questions');
      }
    } catch (e) {
      let msg = 'Unknown error';
      if (e instanceof Error) msg = e.message;
      else if (typeof e === 'string') msg = e;
      else if (e && typeof e === 'object') msg = JSON.stringify(e);
      Alert.alert('Error', msg);
    }
  };

  const importAnswerKeyJson = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (res.type === 'success') {
        const content = await FileSystem.readAsStringAsync(res.uri);
        const data = JSON.parse(content);
        setAnswerKey(data);
        Alert.alert('Imported', 'Answer key loaded');
      }
    } catch (e) {
      let msg = 'Unknown error';
      if (e instanceof Error) msg = e.message;
      else if (typeof e === 'string') msg = e;
      else if (e && typeof e === 'object') msg = JSON.stringify(e);
      Alert.alert('Error', msg);
    }
  };

  // start timer
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!examStarted || examCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, timeLeft, examCompleted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    setExamStarted(true);
    setTimeLeft(examDuration * 60);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setExamCompleted(false);
  };

  const selectAnswer = (qid: number, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const toggleFlag = (qid: number) => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qid)) newSet.delete(qid);
      else newSet.add(qid);
      return newSet;
    });
  };

  const handleSubmit = () => {
    setExamCompleted(true);
    setExamStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const { correct, incorrect, unattempted, score } = React.useMemo(() => {
    let c = 0;
    let ic = 0;
    let ua = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) ua += 1;
      else if (ans === q.correctAnswer) c += 1;
      else ic += 1;
    });
    return { correct: c, incorrect: ic, unattempted: ua, score: c * 4 - ic };
  }, [answers, questions]);

  if (!examStarted && !examCompleted) {
    return (
      <ScrollView contentContainerStyle={styles.setupContainer}>
        <Text style={styles.title}>CBT Exam Setup</Text>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Duration (minutes): </Text>
          <TextInput
            keyboardType="number-pad"
            value={examDuration.toString()}
            onChangeText={(txt) => setExamDuration(parseInt(txt || '1'))}
            style={styles.durationInput}
          />
        </View>
        <Text style={styles.info}>Questions loaded: {questions.length}</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: '#8B5CF6', marginRight: 8 }]} onPress={importQuestionsJson}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Import Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: '#10B981' }]} onPress={importAnswerKeyJson}>
            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Import Answer Key</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Exam</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (examStarted && !examCompleted) {
    const q = questions[currentIndex];
    return (
      <View style={styles.examContainer}>
        {/* Header */}
        <View style={styles.examHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Q {currentIndex + 1}/{questions.length}</Text>
          <View style={styles.timerBox}>
            <Ionicons name="time" size={18} color="#fff" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        {/* Body */}
              <Text style={styles.optionText}>{
                opt === 'A' ? q.optionA :
                opt === 'B' ? q.optionB :
                opt === 'C' ? q.optionC :
                q.optionD
              }</Text>
          <Text style={styles.questionText}>{q.question}</Text>
          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionRow, answers[q.id] === opt && styles.optionSelected]}
              onPress={() => selectAnswer(q.id, opt)}
            >
              <View style={styles.radioCircle}>
                {answers[q.id] === opt && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.optionLabel}>( {opt} )</Text>
              <Text style={styles.optionText}>{q[`option${opt}`]}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.flagRow}>
            <TouchableOpacity onPress={() => toggleFlag(q.id)} style={styles.flagBtn}>
              <Ionicons name={flagged.has(q.id) ? 'flag' : 'flag-outline'} size={20} color="#fff" />
              <Text style={styles.flagText}>{flagged.has(q.id) ? 'Unflag' : 'Flag'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Footer navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navDisabled]}
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          >
            <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === questions.length - 1 && styles.navDisabled]}
            disabled={currentIndex === questions.length - 1}
            onPress={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
          >
            <Text style={styles.navBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // results view
  return (
    <View style={styles.resultContainer}>
      <Text style={styles.title}>Exam Results</Text>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>Correct: {correct}</Text>
        <Text style={styles.scoreText}>Incorrect: {incorrect}</Text>
        <Text style={styles.scoreText}>Unattempted: {unattempted}</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={() => setExamCompleted(false)}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.startButtonText}>Retake</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backHomeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4338CA',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  examContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  questionBody: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: 10,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  optionLabel: {
    fontWeight: '600',
    marginRight: 6,
    color: '#4338CA',
  },
  optionText: {
    flex: 1,
    color: '#374151',
  },
  flagRow: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  flagBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  flagText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6B7280',
    borderRadius: 10,
  },
  navDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  scoreBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  backHomeBtn: {
    marginTop: 12,
  },
  backHomeText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
});