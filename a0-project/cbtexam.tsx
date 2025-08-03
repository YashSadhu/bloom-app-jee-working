import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  StyleSheet, Alert, Platform, SafeAreaView, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');

const CBTExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examDuration, setExamDuration] = useState(180);
  const [answerKey, setAnswerKey] = useState({});
  const [results, setResults] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showImportQuestions, setShowImportQuestions] = useState(false);
  const [questionTimes, setQuestionTimes] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [solutions, setSolutions] = useState({});
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutionsUploaded, setSolutionsUploaded] = useState(false);
  const timerRef = useRef(null);

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    subject: '',
    topic: ''
  });

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [examStarted, timeLeft, examCompleted]);

  // Track question navigation time
  useEffect(() => {
    if (examStarted && !examCompleted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, examStarted, examCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addQuestion = () => {
    if (newQuestion.question && newQuestion.optionA && newQuestion.optionB && 
        newQuestion.optionC && newQuestion.optionD) {
      const question = {
        id: questions.length + 1,
        ...newQuestion
      };
      setQuestions([...questions, question]);
      setNewQuestion({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        subject: '',
        topic: ''
      });
      setShowAddQuestion(false);
    }
  };

  const startExam = () => {
    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question before starting the exam!');
      return;
    }
    setTimeLeft(examDuration * 60);
    setExamStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setExamCompleted(false);
    setResults(null);
    setQuestionTimes({});
    setQuestionStartTime(Date.now());
    setAnalysis(null);
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
    
    // Record time spent on question when answer is selected
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
    }
  };

  const toggleFlag = (questionId) => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  const handleQuestionsImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      if (result.type === 'success') {
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validQuestions = parsed.filter(q => q.question && q.optionA && q.optionB && q.optionC && q.optionD);
          if (!validQuestions.length) return Alert.alert('Error', 'No valid questions found!');
          setQuestions(prev => {
            const newQs = validQuestions.map((q, i) => ({
              id: prev.length + i + 1,
              question: q.question,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              subject: q.subject || 'General',
              topic: q.topic || 'General'
            }));
            return [...prev, ...newQs];
          });
          setShowImportQuestions(false);
          Alert.alert('Success', `Imported ${validQuestions.length} questions!`);
        } else Alert.alert('Error', 'Invalid format!');
      }
    } catch {
      Alert.alert('Error', 'Import failed!');
    }
  };

  const handleGenerateQuestions = async () => {
    if (!topicsToGenerate.trim()) return Alert.alert('Error', 'Paste topics to generate questions');
    const count = parseInt(numGenerate, 10);
    if (isNaN(count) || count < 1) return Alert.alert('Error', 'Enter valid question count');
    setGenerating(true);
    const prompt = `Please create a complete JEE (Mains + Advanced) mock test.\nTotal Questions: ${count}\nSubjects: Chemistry, Mathematics, Physics\nQuestions per Subject: ${count/3}\nTime Limit: 3 Hours\nDifficulty: Mixed JEE Advanced & Mains\nSyllabus:\n${topicsToGenerate}`;
    try {
      const resp = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-default-pFNnvq5oSDeZx345ky9zBJpfhLruHKsO'
        },
        body: JSON.stringify({
          user_id: 'user',
          agent_id: '685d408f93b5ca78f52d23c1',
          session_id: `session-${Date.now()}`,
          message: prompt
        })
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || data.completion;
      const blocks = [...content.matchAll(/```json([\s\S]*?)```/g)].map(m => m[1].trim());
      if (blocks[0]) {
        const qs = JSON.parse(blocks[0]);
        setQuestions(qs.map((q, idx) => ({ id: idx+1, ...q })));
      }
      if (blocks[1]) setAnswerKey(JSON.parse(blocks[1]));
      if (blocks[2]) {
        const sol = JSON.parse(blocks[2]);
        const map = {};
        sol.forEach(s => { map[s.questionNumber] = s; });
        setSolutions(map);
        setSolutionsUploaded(true);
      }
    } catch {
      Alert.alert('Error', 'AI generation failed');
    }
    setGenerating(false);
  };

  const handleSolutionsUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        try {
          const solutionsData = JSON.parse(fileContent);
          if (Array.isArray(solutionsData) && solutionsData.length > 0) {
            const solutionsMap = {};
            solutionsData.forEach(sol => {
              if (sol.questionNumber && sol.detailedSolution && sol.correctOption && sol.finalAnswer) {
                solutionsMap[sol.questionNumber] = {
                  detailedSolution: sol.detailedSolution,
                  correctOption: sol.correctOption,
                  finalAnswer: sol.finalAnswer
                };
              }
            });
            setSolutions(solutionsMap);
            setSolutionsUploaded(true);
            Alert.alert('Success', `Successfully uploaded solutions for ${Object.keys(solutionsMap).length} questions!`);
          } else {
            Alert.alert('Error', 'Invalid solutions format! Please check the file structure.');
          }
        } catch (error) {
          Alert.alert('Error', 'Invalid JSON file format!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload solutions.');
    }
  };

  const downloadSolutionsFormat = () => {
    const sampleSolutions = [
      {
        questionNumber: 1,
        detailedSolution: "Step-by-step solution explanation here.\nThis can include multiple lines.\nEach line should be clearly separated for readability.\n\nFormulas: E = mc²\nCalculation: 2 + 2 = 4\nTherefore, the answer is 4.",
        correctOption: "B",
        finalAnswer: "Option B is correct because..."
      },
      {
        questionNumber: 2,
        detailedSolution: "Another detailed solution here.\nInclude all necessary steps.\nShow mathematical work when applicable.\n\nKey points:\n- Point 1\n- Point 2\n- Point 3",
        correctOption: "A",
        finalAnswer: "Option A is the correct choice."
      }
    ];

    Alert.alert(
      'Sample Solution Format',
      JSON.stringify(sampleSolutions, null, 2),
      [{ text: 'OK' }]
    );
  };

  const formatSolutionText = (text) => {
    return text.split('\n').map((line, index) => (
      <Text key={index} style={[styles.solutionText, line.trim() === '' && styles.emptyLine]}>
        {line.trim() === '' ? '' : line}
      </Text>
    ));
  };

  const handleSubmitExam = () => {
    setExamCompleted(true);
    setExamStarted(false);
    clearInterval(timerRef.current);
  };

  const downloadAnswers = () => {
    const answerData = questions.map(q => ({
      questionId: q.id,
      question: q.question.substring(0, 50) + '...',
      selectedAnswer: answers[q.id] || 'Not Attempted',
      flagged: flagged.has(q.id)
    }));

    Alert.alert(
      'Exam Answers',
      JSON.stringify(answerData, null, 2),
      [{ text: 'OK' }]
    );
  };

  const handleAnswerKeyUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        try {
          const keyData = JSON.parse(fileContent);
          setAnswerKey(keyData);
          calculateResults(keyData);
          Alert.alert('Success', 'Answer key uploaded successfully!');
        } catch (error) {
          Alert.alert('Error', 'Invalid JSON file format!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload answer key.');
    }
  };

  const downloadQuestionFormat = () => {
    const sampleQuestions = [
      {
        question: "What is the capital of India?",
        optionA: "Mumbai",
        optionB: "New Delhi",
        optionC: "Kolkata",
        optionD: "Chennai",
        subject: "Geography",
        topic: "Indian Capitals"
      },
      {
        question: "Which planet is known as the Red Planet?",
        optionA: "Venus",
        optionB: "Mars",
        optionC: "Jupiter",
        optionD: "Saturn",
        subject: "Science",
        topic: "Astronomy"
      }
    ];

    Alert.alert(
      'Sample Question Format',
      JSON.stringify(sampleQuestions, null, 2),
      [{ text: 'OK' }]
    );
  };

  const downloadAnswerKeyFormat = () => {
    const sampleAnswerKey = {};
    questions.slice(0, 5).forEach((q, index) => {
      sampleAnswerKey[q.id] = ['A', 'B', 'C', 'D'][index % 4];
    });

    if (Object.keys(sampleAnswerKey).length === 0) {
      sampleAnswerKey["1"] = "A";
      sampleAnswerKey["2"] = "B";
      sampleAnswerKey["3"] = "C";
    }

    Alert.alert(
      'Sample Answer Key Format',
      JSON.stringify(sampleAnswerKey, null, 2),
      [{ text: 'OK' }]
    );
  };

  const calculateResults = (key) => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const subjectAnalysis = {};
    const questionAnalysis = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctAnswer = key[q.id] || null;
      const timeSpent = questionTimes[q.id] || 0;
      
      // Initialize subject analysis
      if (!subjectAnalysis[q.subject]) {
        subjectAnalysis[q.subject] = { correct: 0, incorrect: 0, unattempted: 0, score: 0 };
      }

      let status = '';
      let marks = 0;

      if (!userAnswer) {
        unattempted++;
        subjectAnalysis[q.subject].unattempted++;
        status = 'unattempted';
        marks = 0;
      } else if (correctAnswer && userAnswer === correctAnswer) {
        correct++;
        subjectAnalysis[q.subject].correct++;
        status = 'correct';
        marks = 4;
      } else if (correctAnswer && userAnswer !== correctAnswer) {
        incorrect++;
        subjectAnalysis[q.subject].incorrect++;
        status = 'incorrect';
        marks = -1;
      } else {
        // No answer key provided, mark as attempted but unknown
        status = 'attempted';
        marks = 0;
      }

      subjectAnalysis[q.subject].score += marks;

      questionAnalysis.push({
        questionId: q.id,
        question: q.question,
        subject: q.subject,
        topic: q.topic,
        userAnswer: userAnswer || 'Not Attempted',
        correctAnswer: correctAnswer || 'Not Available',
        status: status,
        marks: marks,
        timeSpent: timeSpent,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD
      });
    });

    const score = (correct * 4) - (incorrect * 1);
    const totalMarks = questions.length * 4;
    const percentage = Object.keys(key).length > 0 ? ((score / totalMarks) * 100).toFixed(2) : 'N/A';

    // Find subject with most negative score
    const worstSubject = Object.entries(subjectAnalysis)
      .sort((a, b) => a[1].score - b[1].score)[0];

    // Time analysis
    const wrongAnswersWithTime = questionAnalysis
      .filter(q => q.status === 'incorrect')
      .sort((a, b) => b.timeSpent - a.timeSpent);

    const correctAnswersWithTime = questionAnalysis
      .filter(q => q.status === 'correct')
      .sort((a, b) => a.timeSpent - b.timeSpent);

    setResults({
      correct,
      incorrect,
      unattempted,
      score: Object.keys(key).length > 0 ? score : 'N/A',
      totalMarks,
      percentage: Object.keys(key).length > 0 ? Math.max(0, percentage) : 'N/A'
    });

    setAnalysis({
      subjectAnalysis,
      questionAnalysis,
      worstSubject: worstSubject ? {
        name: worstSubject[0],
        data: worstSubject[1]
      } : null,
      timeAnalysis: {
        slowestWrong: wrongAnswersWithTime.slice(0, 5),
        fastestCorrect: correctAnswersWithTime.slice(0, 5),
        averageTimePerQuestion: Math.round(
          Object.values(questionTimes).reduce((a, b) => a + b, 0) / 
          Object.values(questionTimes).length || 0
        )
      }
    });
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setResults(null);
    setAnswerKey({});
    setTimeLeft(0);
    setQuestionTimes({});
    setQuestionStartTime(null);
    setAnalysis(null);
    setSolutions({});
    setShowSolutions(false);
    setSolutionsUploaded(false);
  };

  const [numGenerate, setNumGenerate] = useState('10');
  const [topicsToGenerate, setTopicsToGenerate] = useState('');
  const [generating, setGenerating] = useState(false);

  // Setup Phase
  if (!examStarted && !examCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f0f4ff', '#e6eeff', '#dde8ff']}
          style={styles.gradientBackground}
        >
          <ScrollView 
            contentContainerStyle={styles.setupScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>
                CBT Exam Interface
              </Text>

              <View style={styles.twoColumnLayout}>
                <View style={styles.column}>
                  <Text style={styles.sectionTitle}>Exam Settings</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Exam Duration (minutes):
                    </Text>
                    <TextInput
                      value={examDuration.toString()}
                      onChangeText={(text) => setExamDuration(parseInt(text) || 180)}
                      style={styles.input}
                      keyboardType="numeric"
                      minValue={1}
                      maxValue={300}
                    />
                  </View>
                  
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>Instructions:</Text>
                    <View style={styles.infoList}>
                      <Text style={styles.infoItem}>• Add questions using the form or import JSON</Text>
                      <Text style={styles.infoItem}>• Marking: +4 correct, -1 incorrect, 0 unattempted</Text>
                      <Text style={styles.infoItem}>• You can flag questions for review</Text>
                      <Text style={styles.infoItem}>• Upload answer key after exam for results</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.column}>
                  <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        onPress={() => setShowImportQuestions(!showImportQuestions)}
                        style={[styles.smallButton, styles.purpleButton]}
                      >
                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Import</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowAddQuestion(!showAddQuestion)}
                        style={[styles.smallButton, styles.greenButton]}
                      >
                        <Ionicons name="add" size={16} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showImportQuestions && (
                    <View style={styles.importBox}>
                      <Text style={styles.importTitle}>Import Questions</Text>
                      
                      <TouchableOpacity 
                        style={styles.uploadBox}
                        onPress={handleQuestionsImport}
                      >
                        <Ionicons name="cloud-upload-outline" size={32} color="#a78bfa" style={styles.uploadIcon} />
                        <Text style={styles.uploadText}>Choose File</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={downloadQuestionFormat}
                        style={styles.formatButton}
                      >
                        <Text style={styles.formatButtonText}>Download Sample Format</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {showAddQuestion && (
                    <View style={styles.addQuestionBox}>
                      <TextInput
                        placeholder="Question"
                        value={newQuestion.question}
                        onChangeText={(text) => setNewQuestion({...newQuestion, question: text})}
                        style={styles.questionInput}
                        multiline
                      />
                      <TextInput
                        placeholder="Option A"
                        value={newQuestion.optionA}
                        onChangeText={(text) => setNewQuestion({...newQuestion, optionA: text})}
                        style={styles.optionInput}
                      />
                      <TextInput
                        placeholder="Option B"
                        value={newQuestion.optionB}
                        onChangeText={(text) => setNewQuestion({...newQuestion, optionB: text})}
                        style={styles.optionInput}
                      />
                      <TextInput
                        placeholder="Option C"
                        value={newQuestion.optionC}
                        onChangeText={(text) => setNewQuestion({...newQuestion, optionC: text})}
                        style={styles.optionInput}
                      />
                      <TextInput
                        placeholder="Option D"
                        value={newQuestion.optionD}
                        onChangeText={(text) => setNewQuestion({...newQuestion, optionD: text})}
                        style={styles.optionInput}
                      />
                      <View style={styles.rowInputs}>
                        <TextInput
                          placeholder="Subject"
                          value={newQuestion.subject}
                          onChangeText={(text) => setNewQuestion({...newQuestion, subject: text})}
                          style={[styles.optionInput, styles.halfInput]}
                        />
                        <TextInput
                          placeholder="Topic"
                          value={newQuestion.topic}
                          onChangeText={(text) => setNewQuestion({...newQuestion, topic: text})}
                          style={[styles.optionInput, styles.halfInput]}
                        />
                      </View>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          onPress={addQuestion}
                          style={[styles.actionButton, styles.saveButton]}
                        >
                          <Ionicons name="save-outline" size={16} color="#fff" style={styles.buttonIcon} />
                          <Text style={styles.actionButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setShowAddQuestion(false)}
                          style={[styles.actionButton, styles.cancelButton]}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <ScrollView 
                    style={styles.questionsList}
                    contentContainerStyle={styles.questionsListContent}
                    showsVerticalScrollIndicator={true}
                  >
                    {questions.map((q, index) => (
                      <View key={q.id} style={styles.questionItem}>
                        <Text style={styles.questionItemTitle}>Q{index + 1}: {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</Text>
                        <Text style={styles.questionItemMeta}>
                          {q.subject} - {q.topic}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    onPress={startExam}
                    disabled={questions.length === 0}
                    style={[
                      styles.startButton, 
                      questions.length === 0 && styles.disabledButton
                    ]}
                  >
                    <Ionicons name="play" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.startButtonText}>Start Exam</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Exam Interface
  if (examStarted && !examCompleted) {
    const question = questions[currentQuestion];
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f0f4ff', '#e6eeff', '#dde8ff']}
          style={styles.gradientBackground}
        >
          <View style={styles.examContainer}>
            <View style={styles.examHeader}>
              <Text style={styles.examHeaderTitle}>Question {currentQuestion + 1} of {questions.length}</Text>
              <View style={styles.examHeaderRight}>
                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={20} color="#fff" style={styles.timerIcon} />
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleSubmitExam}
                  style={styles.submitExamButton}
                >
                  <Text style={styles.submitExamText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.examBody}>
              <ScrollView 
                style={styles.questionContainer}
                contentContainerStyle={styles.questionContentContainer}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.questionHeader}>
                  <Text style={styles.questionMeta}>
                    Subject: {question.subject} | Topic: {question.topic}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFlag(question.id)}
                    style={[
                      styles.flagButton,
                      flagged.has(question.id) && styles.flaggedButton
                    ]}
                  >
                    <Text style={styles.flagButtonText}>
                      {flagged.has(question.id) ? 'Flagged' : 'Flag'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.questionText}>{question.question}</Text>

                <View style={styles.optionsContainer}>
                  {['A', 'B', 'C', 'D'].map(option => (
                    <TouchableOpacity 
                      key={option} 
                      style={[
                        styles.optionButton,
                        answers[question.id] === option && styles.selectedOption
                      ]}
                      onPress={() => handleAnswerSelect(question.id, option)}
                    >
                      <View style={styles.optionCircle}>
                        {answers[question.id] === option && (
                          <View style={styles.optionCircleFilled} />
                        )}
                      </View>
                      <Text style={styles.optionLetter}>({option})</Text>
                      <Text style={styles.optionContent}>{question[`option${option}`]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.navigationBar}>
                <TouchableOpacity
                  onPress={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  style={[
                    styles.navButton,
                    currentQuestion === 0 && styles.disabledNavButton
                  ]}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleAnswerSelect(question.id, null)}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === questions.length - 1}
                  style={[
                    styles.navButton,
                    currentQuestion === questions.length - 1 && styles.disabledNavButton
                  ]}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.questionPalette}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <ScrollView 
                contentContainerStyle={styles.paletteGrid}
                showsVerticalScrollIndicator={false}
                horizontal={false}
              >
                {questions.map((q, index) => (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setCurrentQuestion(index)}
                    style={[
                      styles.paletteItem,
                      index === currentQuestion && styles.currentPaletteItem,
                      answers[q.id] && !flagged.has(q.id) && styles.answeredPaletteItem,
                      !answers[q.id] && flagged.has(q.id) && styles.flaggedPaletteItem,
                      answers[q.id] && flagged.has(q.id) && styles.answeredFlaggedPaletteItem
                    ]}
                  >
                    <Text style={[
                      styles.paletteItemText,
                      index === currentQuestion && styles.currentPaletteItemText,
                      answers[q.id] && !flagged.has(q.id) && styles.answeredPaletteItemText,
                      !answers[q.id] && flagged.has(q.id) && styles.flaggedPaletteItemText,
                      answers[q.id] && flagged.has(q.id) && styles.answeredFlaggedPaletteItemText
                    ]}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.paletteLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.answeredColor]} />
                  <Text style={styles.legendText}>Answered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.unansweredColor]} />
                  <Text style={styles.legendText}>Not Answered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.flaggedColor]} />
                  <Text style={styles.legendText}>Flagged</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.answeredFlaggedColor]} />
                  <Text style={styles.legendText}>Answered & Flagged</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.currentColor]} />
                  <Text style={styles.legendText}>Current</Text>
                </View>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryItem}>Answered: {Object.keys(answers).length}</Text>
                  <Text style={styles.summaryItem}>Not Answered: {questions.length - Object.keys(answers).length}</Text>
                  <Text style={styles.summaryItem}>Flagged: {flagged.size}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Results Phase
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0f4ff', '#e6eeff', '#dde8ff']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.resultsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>
              Exam Completed!
            </Text>

            <View style={styles.resultsGrid}>
              <View style={styles.resultsColumn}>
                <Text style={styles.resultsSectionTitle}>Export Answers</Text>
                <TouchableOpacity
                  onPress={downloadAnswers}
                  style={[styles.resultsButton, styles.blueButton]}
                >
                  <Ionicons name="cloud-download-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.resultsButtonText}>Download Answers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={downloadAnswerKeyFormat}
                  style={[styles.resultsButton, styles.greenButton]}
                >
                  <Ionicons name="cloud-download-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.resultsButtonText}>Download Answer Key Format</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.resultsColumn}>
                <Text style={styles.resultsSectionTitle}>Upload Answer Key & Solutions</Text>
                
                <View style={styles.uploadContainer}>
                  <Ionicons name="cloud-upload-outline" size={48} color="#d1d5db" style={styles.uploadBigIcon} />
                  <View style={styles.uploadButtonsContainer}>
                    <View style={styles.uploadButtonRow}>
                      <TouchableOpacity
                        onPress={handleAnswerKeyUpload}
                        style={[styles.uploadButton, styles.greenButton]}
                      >
                        <Text style={styles.uploadButtonText}>Upload Answer Key</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => calculateResults({})}
                        style={[styles.uploadButton, styles.grayButton]}
                      >
                        <Text style={styles.uploadButtonText}>Skip Answer Key</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.uploadButtonRow}>
                      <TouchableOpacity
                        onPress={handleSolutionsUpload}
                        style={[styles.uploadButton, styles.blueButton]}
                      >
                        <Text style={styles.uploadButtonText}>Upload Solutions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={downloadSolutionsFormat}
                        style={[styles.uploadButton, styles.purpleButton]}
                      >
                        <Text style={styles.uploadButtonText}>Download Solutions Format</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {results && (
                  <View style={styles.resultsBox}>
                    <Text style={styles.resultsBoxTitle}>Results</Text>
                    <View style={styles.resultsStatsGrid}>
                      <View style={styles.resultsStat}>
                        <Text style={styles.resultsStatLabel}>Correct</Text>
                        <Text style={[styles.resultsStatValue, styles.correctText]}>{results.correct}</Text>
                      </View>
                      <View style={styles.resultsStat}>
                        <Text style={styles.resultsStatLabel}>Incorrect</Text>
                        <Text style={[styles.resultsStatValue, styles.incorrectText]}>{results.incorrect}</Text>
                      </View>
                      <View style={styles.resultsStat}>
                        <Text style={styles.resultsStatLabel}>Unattempted</Text>
                        <Text style={[styles.resultsStatValue, styles.unattemptedText]}>{results.unattempted}</Text>
                      </View>
                      <View style={styles.resultsStat}>
                        <Text style={styles.resultsStatLabel}>Score</Text>
                        <Text style={[styles.resultsStatValue, styles.scoreText]}>
                          {results.score}/{results.totalMarks}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.percentageContainer}>
                      <Text style={styles.percentageText}>
                        {results.percentage}%
                      </Text>
                    </View>
                  </View>
                )}

                {/* Solutions and View Options */}
                <View style={styles.viewOptionsBox}>
                  <Text style={styles.viewOptionsTitle}>View Options</Text>
                  <View style={styles.viewOptionsButtons}>
                    <TouchableOpacity
                      onPress={() => setShowSolutions(!showSolutions)}
                      style={[styles.viewOptionsButton, styles.blueButton]}
                    >
                      <Text style={styles.viewOptionsButtonText}>
                        {showSolutions ? 'Hide Solutions' : 'View Solutions'}
                      </Text>
                    </TouchableOpacity>
                    {solutionsUploaded && (
                      <Text style={styles.solutionsUploadedText}>
                        ✓ Solutions uploaded for {Object.keys(solutions).length} questions
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Solutions View */}
            {showSolutions && (
              <View style={styles.solutionsContainer}>
                <View style={styles.solutionsHeader}>
                  <Text style={styles.solutionsTitle}>Solutions & Question Review</Text>
                  <TouchableOpacity
                    onPress={() => setShowSolutions(false)}
                    style={styles.closeSolutionsButton}
                  >
                    <Text style={styles.closeSolutionsText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  contentContainerStyle={styles.solutionsContent}
                  showsVerticalScrollIndicator={true}
                >
                  {questions.map((question, questionIndex) => {
                    const userAnswer = answers[question.id];
                    const correctAnswer = answerKey[question.id];
                    const solution = solutions[question.id] || solutions[questionIndex + 1];
                    const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;
                    const isIncorrect = userAnswer && correctAnswer && userAnswer !== correctAnswer;
                    const isUnattempted = !userAnswer;
                    
                    return (
                      <View 
                        key={question.id} 
                        style={[
                          styles.solutionItem,
                          isCorrect && styles.correctSolutionItem,
                          isIncorrect && styles.incorrectSolutionItem,
                          isUnattempted && styles.unattemptedSolutionItem
                        ]}
                      >
                        {/* Question Header */}
                        <View style={styles.solutionItemHeader}>
                          <View style={styles.solutionItemHeaderLeft}>
                            <View style={styles.questionNumberBadge}>
                              <Text style={styles.questionNumberText}>
                                Q{questionIndex + 1}
                              </Text>
                            </View>
                            <Text style={styles.solutionItemSubject}>
                              {question.subject} - {question.topic}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            isCorrect && styles.correctStatusBadge,
                            isIncorrect && styles.incorrectStatusBadge,
                            isUnattempted && styles.unattemptedStatusBadge
                          ]}>
                            <Text style={styles.statusText}>
                              {isCorrect ? 'Correct (+4)' :
                               isIncorrect ? 'Incorrect (-1)' :
                               'Unattempted (0)'}
                            </Text>
                          </View>
                        </View>

                        {/* Question Text */}
                        <View style={styles.solutionQuestionContainer}>
                          <Text style={styles.solutionQuestionText}>
                            {question.question}
                          </Text>
                        </View>

                        {/* Options */}
                        <View style={styles.solutionOptionsGrid}>
                          {['A', 'B', 'C', 'D'].map(option => {
                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer = correctAnswer === option;
                            
                            return (
                              <View 
                                key={option} 
                                style={[
                                  styles.solutionOption,
                                  isCorrectAnswer && styles.correctSolutionOption,
                                  isUserAnswer && !isCorrectAnswer && styles.incorrectSolutionOption
                                ]}
                              >
                                <View style={styles.solutionOptionContent}>
                                  <View style={[
                                    styles.solutionOptionBadge,
                                    isCorrectAnswer && styles.correctSolutionOptionBadge,
                                    isUserAnswer && !isCorrectAnswer && styles.incorrectSolutionOptionBadge
                                  ]}>
                                    <Text style={[
                                      styles.solutionOptionBadgeText,
                                      isCorrectAnswer && styles.correctSolutionOptionBadgeText,
                                      isUserAnswer && !isCorrectAnswer && styles.incorrectSolutionOptionBadgeText
                                    ]}>
                                      {option}
                                    </Text>
                                  </View>
                                  <Text style={styles.solutionOptionText}>{question[`option${option}`]}</Text>
                                  <View style={styles.solutionOptionMarkers}>
                                    {isCorrectAnswer && (
                                      <Text style={styles.correctMarker}>✓ Correct</Text>
                                    )}
                                    {isUserAnswer && (
                                      <Text style={[
                                        styles.userAnswerMarker,
                                        isCorrectAnswer ? styles.correctUserAnswerMarker : styles.incorrectUserAnswerMarker
                                      ]}>
                                        Your Answer
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {/* Answer Summary */}
                        <View style={styles.answerSummary}>
                          <View style={styles.answerSummaryGrid}>
                            <View style={styles.answerSummaryItem}>
                              <Text style={styles.answerSummaryLabel}>Your Answer: </Text>
                              <Text style={[
                                styles.answerSummaryValue,
                                isCorrect && styles.correctText,
                                isIncorrect && styles.incorrectText,
                                isUnattempted && styles.unattemptedText
                              ]}>
                                {userAnswer || 'Not Attempted'}
                              </Text>
                            </View>
                            <View style={styles.answerSummaryItem}>
                              <Text style={styles.answerSummaryLabel}>Correct Answer: </Text>
                              <Text style={[styles.answerSummaryValue, styles.correctText]}>
                                {correctAnswer || 'Not Available'}
                              </Text>
                            </View>
                            <View style={styles.answerSummaryItem}>
                              <Text style={styles.answerSummaryLabel}>Time Spent: </Text>
                              <Text style={[styles.answerSummaryValue, styles.timeText]}>
                                {questionTimes[question.id] || 0}s
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Detailed Solution */}
                        {solution && (
                          <View style={styles.detailedSolution}>
                            <Text style={styles.detailedSolutionTitle}>Detailed Solution:</Text>
                            <View style={styles.detailedSolutionContent}>
                              {formatSolutionText(solution.detailedSolution)}
                            </View>
                            
                            {solution.finalAnswer && (
                              <View style={styles.finalAnswer}>
                                <Text style={styles.finalAnswerTitle}>Final Answer:</Text>
                                <View style={styles.finalAnswerContent}>
                                  {formatSolutionText(solution.finalAnswer)}
                                </View>
                              </View>
                            )}
                          </View>
                        )}

                        {/* No Solution Available Message */}
                        {!solution && (
                          <View style={styles.noSolution}>
                            <Text style={styles.noSolutionText}>
                              <Text style={styles.noSolutionBold}>No solution available for this question.</Text>
                              {!solutionsUploaded && (
                                <Text> Upload solutions file to view detailed explanations.</Text>
                              )}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Detailed Analysis Section */}
            {analysis && (
              <View style={styles.analysisContainer}>
                <View style={styles.analysisBox}>
                  <Text style={styles.analysisTitle}>Performance Analysis</Text>
                  
                  {/* Worst Subject */}
                  {analysis.worstSubject && (
                    <View style={styles.worstSubject}>
                      <Text style={styles.worstSubjectTitle}>
                        Most Challenging Subject: {analysis.worstSubject.name}
                      </Text>
                      <View style={styles.worstSubjectStats}>
                        <View style={styles.worstSubjectStatsGrid}>
                          <Text style={styles.worstSubjectStat}>Correct: {analysis.worstSubject.data.correct}</Text>
                          <Text style={styles.worstSubjectStat}>Incorrect: {analysis.worstSubject.data.incorrect}</Text>
                          <Text style={styles.worstSubjectStat}>Unattempted: {analysis.worstSubject.data.unattempted}</Text>
                          <Text style={styles.worstSubjectStat}>Score: {analysis.worstSubject.data.score}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Subject-wise Analysis */}
                  <View style={styles.subjectAnalysis}>
                    <Text style={styles.subjectAnalysisTitle}>Subject-wise Performance</Text>
                    <ScrollView 
                      contentContainerStyle={styles.subjectAnalysisContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {Object.entries(analysis.subjectAnalysis).map(([subject, data]) => (
                        <View key={subject} style={styles.subjectItem}>
                          <Text style={styles.subjectName}>{subject}</Text>
                          <View style={styles.subjectStatsGrid}>
                            <Text style={styles.subjectStatCorrect}>✓ {data.correct}</Text>
                            <Text style={styles.subjectStatIncorrect}>✗ {data.incorrect}</Text>
                            <Text style={styles.subjectStatUnattempted}>— {data.unattempted}</Text>
                            <Text style={styles.subjectStatScore}>Score: {data.score}</Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Time Analysis */}
                  <View style={styles.timeAnalysis}>
                    <Text style={styles.timeAnalysisTitle}>Time Analysis</Text>
                    <View style={styles.averageTimeBox}>
                      <Text style={styles.averageTimeText}>
                        Average time per question: <Text style={styles.averageTimeValue}>{analysis.timeAnalysis.averageTimePerQuestion}s</Text>
                      </Text>
                    </View>
                    
                    <View style={styles.timeAnalysisGrid}>
                      <View style={styles.timeAnalysisColumn}>
                        <Text style={styles.timeAnalysisColumnTitle}>Slowest Wrong Answers</Text>
                        <ScrollView 
                          contentContainerStyle={styles.timeAnalysisItems}
                          showsVerticalScrollIndicator={false}
                        >
                          {analysis.timeAnalysis.slowestWrong.map((q, index) => (
                            <View key={q.questionId} style={styles.timeAnalysisItem}>
                              <Text style={styles.timeAnalysisItemTitle}>Q{q.questionId}: {q.timeSpent}s</Text>
                              <Text style={styles.timeAnalysisItemQuestion}>{q.question.substring(0, 40)}...</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                      
                      <View style={styles.timeAnalysisColumn}>
                        <Text style={styles.timeAnalysisColumnTitle}>Fastest Correct Answers</Text>
                        <ScrollView 
                          contentContainerStyle={styles.timeAnalysisItems}
                          showsVerticalScrollIndicator={false}
                        >
                          {analysis.timeAnalysis.fastestCorrect.map((q, index) => (
                            <View key={q.questionId} style={styles.timeAnalysisItemCorrect}>
                              <Text style={styles.timeAnalysisItemTitle}>Q{q.questionId}: {q.timeSpent}s</Text>
                              <Text style={styles.timeAnalysisItemQuestion}>{q.question.substring(0, 40)}...</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>

                  {/* Question-wise Analysis */}
                  <View style={styles.questionAnalysis}>
                    <Text style={styles.questionAnalysisTitle}>Question-wise Review</Text>
                    <ScrollView 
                      style={styles.questionAnalysisScroll}
                      contentContainerStyle={styles.questionAnalysisContent}
                      showsVerticalScrollIndicator={true}
                    >
                      {analysis.questionAnalysis.map((q) => (
                        <View 
                          key={q.questionId} 
                          style={[
                            styles.questionAnalysisItem,
                            q.status === 'correct' && styles.questionAnalysisItemCorrect,
                            q.status === 'incorrect' && styles.questionAnalysisItemIncorrect,
                            q.status === 'unattempted' && styles.questionAnalysisItemUnattempted
                          ]}
                        >
                          <View style={styles.questionAnalysisHeader}>
                            <Text style={styles.questionAnalysisId}>
                              Q{q.questionId}: {q.subject} - {q.topic}
                            </Text>
                            <Text style={styles.questionAnalysisTime}>
                              Time: {q.timeSpent}s | Marks: {q.marks > 0 ? '+' : ''}{q.marks}
                            </Text>
                          </View>
                          
                          <Text style={styles.questionAnalysisText}>{q.question}</Text>
                          
                          <View style={styles.questionAnalysisDetails}>
                            <View style={styles.questionAnalysisOptions}>
                              <Text style={styles.questionAnalysisOptionsTitle}>Options:</Text>
                              <View style={styles.questionAnalysisOptionsList}>
                                <Text style={[
                                  styles.questionAnalysisOption,
                                  q.correctAnswer === 'A' && styles.questionAnalysisCorrectOption
                                ]}>
                                  (A) {q.optionA}
                                </Text>
                                <Text style={[
                                  styles.questionAnalysisOption,
                                  q.correctAnswer === 'B' && styles.questionAnalysisCorrectOption
                                ]}>
                                  (B) {q.optionB}
                                </Text>
                                <Text style={[
                                  styles.questionAnalysisOption,
                                  q.correctAnswer === 'C' && styles.questionAnalysisCorrectOption
                                ]}>
                                  (C) {q.optionC}
                                </Text>
                                <Text style={[
                                  styles.questionAnalysisOption,
                                  q.correctAnswer === 'D' && styles.questionAnalysisCorrectOption
                                ]}>
                                  (D) {q.optionD}
                                </Text>
                              </View>
                            </View>
                            
                            <View style={styles.questionAnalysisAnswers}>
                              <View style={styles.questionAnalysisAnswerItem}>
                                <Text style={styles.questionAnalysisAnswerLabel}>Your Answer: </Text>
                                <Text style={[
                                  styles.questionAnalysisAnswerValue,
                                  q.status === 'correct' && styles.correctText,
                                  q.status === 'incorrect' && styles.incorrectText,
                                  q.status === 'unattempted' && styles.unattemptedText
                                ]}>
                                  {q.userAnswer}
                                </Text>
                              </View>
                              <View style={styles.questionAnalysisAnswerItem}>
                                <Text style={styles.questionAnalysisAnswerLabel}>Correct Answer: </Text>
                                <Text style={[styles.questionAnalysisAnswerValue, styles.correctText]}>
                                  {q.correctAnswer}
                                </Text>
                              </View>
                              <View style={styles.questionAnalysisAnswerItem}>
                                <Text style={styles.questionAnalysisAnswerLabel}>Status: </Text>
                                <Text style={[
                                  styles.questionAnalysisAnswerValue,
                                  q.status === 'correct' && styles.correctText,
                                  q.status === 'incorrect' && styles.incorrectText,
                                  q.status === 'unattempted' && styles.unattemptedText
                                ]}>
                                  {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.resetButtonContainer}>
              <TouchableOpacity
                onPress={resetExam}
                style={styles.resetButton}
              >
                <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.resetButtonText}>Start New Exam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Setup Phase Styles
  setupScrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
    marginBottom: 24,
  },
  twoColumnLayout: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4b5563',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoList: {
    marginLeft: 4,
  },
  infoItem: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  purpleButton: {
    backgroundColor: '#8b5cf6',
  },
  greenButton: {
    backgroundColor: '#10b981',
  },
  blueButton: {
    backgroundColor: '#3b82f6',
  },
  grayButton: {
    backgroundColor: '#6b7280',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  importBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b21b6',
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#c4b5fd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    color: '#7c3aed',
    fontWeight: '500',
  },
  formatButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  formatButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addQuestionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  questionsList: {
    maxHeight: 240,
    marginBottom: 16,
  },
  questionsListContent: {
    paddingVertical: 4,
  },
  questionItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  questionItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  questionItemMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  startButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Exam Interface Styles
  examContainer: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  examHeader: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  examHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timerIcon: {
    marginRight: 6,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  submitExamButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitExamText: {
    color: '#fff',
    fontWeight: '600',
  },
  examBody: {
    flex: 3,
    backgroundColor: '#fff',
  },
  questionContainer: {
    flex: 1,
  },
  questionContentContainer: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  flagButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  flaggedButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  flagButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4f46e5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4f46e5',
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
    marginRight: 8,
  },
  optionContent: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  navButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  questionPalette: {
    flex: Platform.OS === 'web' ? 1 : null,
    backgroundColor: '#f3f4f6',
    padding: 16,
    maxWidth: Platform.OS === 'web' ? 320 : '100%',
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  paletteItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPaletteItem: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  answeredPaletteItem: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  flaggedPaletteItem: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  answeredFlaggedPaletteItem: {
    backgroundColor: '#f5d0fe',
    borderColor: '#d8b4fe',
  },
  paletteItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  currentPaletteItemText: {
    color: '#fff',
  },
  answeredPaletteItemText: {
    color: '#047857',
  },
  flaggedPaletteItemText: {
    color: '#b91c1c',
  },
  answeredFlaggedPaletteItemText: {
    color: '#7e22ce',
  },
  paletteLegend: {
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  answeredColor: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  unansweredColor: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  flaggedColor: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  answeredFlaggedColor: {
    backgroundColor: '#f5d0fe',
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  currentColor: {
    backgroundColor: '#4f46e5',
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  legendText: {
    fontSize: 12,
    color: '#4b5563',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryContent: {
    gap: 4,
  },
  summaryItem: {
    fontSize: 13,
    color: '#4b5563',
  },

  // Results Phase Styles
  resultsScrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  resultsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 24,
  },
  resultsColumn: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
  },
  resultsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadBigIcon: {
    marginBottom: 16,
  },
  uploadButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  uploadButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  resultsBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultsBoxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 16,
  },
  resultsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultsStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  resultsStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultsStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  correctText: {
    color: '#047857',
  },
  incorrectText: {
    color: '#b91c1c',
  },
  unattemptedText: {
    color: '#6b7280',
  },
  scoreText: {
    color: '#1d4ed8',
  },
  timeText: {
    color: '#6366f1',
  },
  percentageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  viewOptionsBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  viewOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  viewOptionsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  viewOptionsButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewOptionsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  solutionsUploadedText: {
    fontSize: 14,
    color: '#10b981',
  },
  solutionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#93c5fd',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  solutionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  solutionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  closeSolutionsButton: {
    padding: 4,
  },
  closeSolutionsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
  },
  solutionsContent: {
    gap: 24,
  },
  solutionItem: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  correctSolutionItem: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  incorrectSolutionItem: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  unattemptedSolutionItem: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  solutionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  solutionItemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionNumberBadge: {
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  questionNumberText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  solutionItemSubject: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  correctStatusBadge: {
    backgroundColor: '#d1fae5',
  },
  incorrectStatusBadge: {
    backgroundColor: '#fee2e2',
  },
  unattemptedStatusBadge: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  solutionQuestionContainer: {
    marginBottom: 16,
  },
  solutionQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 24,
  },
  solutionOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  solutionOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  correctSolutionOption: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  incorrectSolutionOption: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  solutionOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  solutionOptionBadge: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  correctSolutionOptionBadge: {
    backgroundColor: '#10b981',
  },
  incorrectSolutionOptionBadge: {
    backgroundColor: '#ef4444',
  },
  solutionOptionBadgeText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#4b5563',
  },
  correctSolutionOptionBadgeText: {
    color: '#fff',
  },
  incorrectSolutionOptionBadgeText: {
    color: '#fff',
  },
  solutionOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  solutionOptionMarkers: {
    alignItems: 'flex-end',
    gap: 4,
  },
  correctMarker: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  userAnswerMarker: {
    fontSize: 12,
    fontWeight: '500',
  },
  correctUserAnswerMarker: {
    color: '#10b981',
  },
  incorrectUserAnswerMarker: {
    color: '#ef4444',
  },
  answerSummary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  answerSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  answerSummaryItem: {
    flex: 1,
    minWidth: '30%',
  },
  answerSummaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  answerSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailedSolution: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 16,
  },
  detailedSolutionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 12,
  },
  detailedSolutionContent: {
    marginBottom: 16,
  },
  solutionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  emptyLine: {
    height: 8,
  },
  finalAnswer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
  },
  finalAnswerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  finalAnswerContent: {
    
  },
  noSolution: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 8,
    padding: 16,
  },
  noSolutionText: {
    fontSize: 14,
    color: '#92400e',
  },
  noSolutionBold: {
    fontWeight: '700',
  },
  analysisContainer: {
    marginTop: 24,
  },
  analysisBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 16,
  },
  worstSubject: {
    marginBottom: 24,
  },
  worstSubjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 8,
  },
  worstSubjectStats: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  worstSubjectStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  worstSubjectStat: {
    flex: 1,
    minWidth: '45%',
    fontSize: 14,
  },
  subjectAnalysis: {
    marginBottom: 24,
  },
  subjectAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 8,
  },
  subjectAnalysisContent: {
    gap: 8,
  },
  subjectItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  subjectStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectStatCorrect: {
    flex: 1,
    minWidth: '20%',
    fontSize: 14,
    color: '#10b981',
  },
  subjectStatIncorrect: {
    flex: 1,
    minWidth: '20%',
    fontSize: 14,
    color: '#ef4444',
  },
  subjectStatUnattempted: {
    flex: 1,
    minWidth: '20%',
    fontSize: 14,
    color: '#6b7280',
  },
  subjectStatScore: {
    flex: 1,
    minWidth: '20%',
    fontSize: 14,
    fontWeight: '500',
  },
  timeAnalysis: {
    marginBottom: 24,
  },
  timeAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 8,
  },
  averageTimeBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  averageTimeText: {
    fontSize: 14,
  },
  averageTimeValue: {
    fontWeight: '500',
  },
  timeAnalysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  timeAnalysisColumn: {
    flex: 1,
    minWidth: '45%',
  },
  timeAnalysisColumnTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
    marginBottom: 8,
  },
  timeAnalysisItems: {
    gap: 8,
  },
  timeAnalysisItem: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 8,
  },
  timeAnalysisItemCorrect: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    padding: 8,
  },
  timeAnalysisItemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeAnalysisItemQuestion: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionAnalysis: {
    
  },
  questionAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 8,
  },
  questionAnalysisScroll: {
    maxHeight: 400,
  },
  questionAnalysisContent: {
    gap: 12,
    paddingRight: 8,
  },
  questionAnalysisItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  questionAnalysisItemCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  questionAnalysisItemIncorrect: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  questionAnalysisItemUnattempted: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  questionAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questionAnalysisId: {
    fontSize: 14,
    fontWeight: '500',
  },
  questionAnalysisTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionAnalysisText: {
    fontSize: 14,
    marginBottom: 12,
  },
  questionAnalysisDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  questionAnalysisOptions: {
    flex: 1,
    minWidth: '45%',
  },
  questionAnalysisOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  questionAnalysisOptionsList: {
    gap: 4,
  },
  questionAnalysisOption: {
    fontSize: 12,
  },
  questionAnalysisCorrectOption: {
    color: '#10b981',
    fontWeight: '500',
  },
  questionAnalysisAnswers: {
    flex: 1,
    minWidth: '45%',
  },
  questionAnalysisAnswerItem: {
    marginBottom: 4,
  },
  questionAnalysisAnswerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  questionAnalysisAnswerValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButtonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});