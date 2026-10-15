/* global fetch */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  Platform, 
  Alert,
  Dimensions,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function CBTExam() {
  const nav = useNavigation();
  const route = useRoute();
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
  const [questionTimes, setQuestionTimes] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [solutions, setSolutions] = useState({});
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutionsUploaded, setSolutionsUploaded] = useState(false);
  const [pendingAutoStart, setPendingAutoStart] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiCount, setAiCount] = useState('10');
  const [aiTopics, setAiTopics] = useState('');
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'add', 'import'
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    subject: '',
    topic: ''
  });

  // Auto-start watcher
  useEffect(() => {
    if (pendingAutoStart && questions.length > 0) {
      startExam();
      setPendingAutoStart(false);
    }
  }, [questions, pendingAutoStart, startExam]);

  // Load questions from route params
  useEffect(() => {
    const params = (route.params as any) || {};
    if (params.questions) {
      setQuestions(params.questions);
      setAnswerKey(params.answerKey || {});
      setSolutions(params.solutions || {});
      setSolutionsUploaded(Boolean(params.solutions));
      setPendingAutoStart(true);
    }
  }, [route.params]);

  const calculateResults = useCallback((key) => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const subjectAnalysis = {};
    const questionAnalysis = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correctAnswer = key[q.id] || null;
      const timeSpent = questionTimes[q.id] || 0;

      const subject = q.subject || 'Uncategorized';
      if (!subjectAnalysis[subject]) {
        subjectAnalysis[subject] = { correct: 0, incorrect: 0, unattempted: 0, score: 0 };
      }

      let status = '';
      let marks = 0;

      if (!userAnswer) {
        unattempted++;
        subjectAnalysis[subject].unattempted++;
        status = 'unattempted';
        marks = 0;
      } else if (correctAnswer && userAnswer === correctAnswer) {
        correct++;
        subjectAnalysis[subject].correct++;
        status = 'correct';
        marks = 4;
      } else if (correctAnswer && userAnswer !== correctAnswer) {
        incorrect++;
        subjectAnalysis[subject].incorrect++;
        status = 'incorrect';
        marks = -1;
      } else {
        status = 'attempted (no key)';
        marks = 0;
      }

      subjectAnalysis[subject].score += marks;

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

    const totalPossibleMarks = questions.length * 4;
    const finalScore = (correct * 4) - (incorrect * 1);
    const percentage = totalPossibleMarks > 0 ? ((finalScore / totalPossibleMarks) * 100).toFixed(2) : '0.00';

    const worstSubject = Object.entries(subjectAnalysis)
      .sort((a, b) => a[1].score - b[1].score)[0];

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
      score: finalScore,
      totalMarks: totalPossibleMarks,
      percentage: Math.max(0, parseFloat(percentage))
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
          Object.values(questionTimes).reduce((sum, time) => sum + time, 0) /
          Object.values(questionTimes).length || 0
        )
      }
    });
  }, [questions, answers, questionTimes]); // Dependencies for calculateResults

  const handleSubmitExam = useCallback(() => {
    setExamCompleted(true);
    setExamStarted(false);
    clearInterval(timerRef.current);
    calculateResults(answerKey);
  }, [answerKey, calculateResults]);

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
  }, [examStarted, timeLeft, examCompleted, handleSubmitExam]);

  // Track question navigation time
  useEffect(() => {
    if (examStarted && !examCompleted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, examStarted, examCompleted]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addQuestion = () => {
    if (newQuestion.question && newQuestion.optionA && newQuestion.optionB &&
        newQuestion.optionC && newQuestion.optionD) {
      const question = {
        id: questions.length + 1,
        ...newQuestion
      };
      setQuestions(prev => [...prev, question]);
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
      Alert.alert('Success', 'Question added successfully!');
      
      // Auto-start exam if this is the first question or user wants to continue
      Alert.alert(
        'Question Added',
        'Would you like to start the exam now or add more questions?',
        [
          { text: 'Add More', style: 'cancel' },
          { 
            text: 'Start Exam', 
            onPress: () => {
              // Reset auxiliary state before starting exam
              setAnswers({});
              setFlagged(new Set());
              setResults(null);
              setAnalysis(null);
              setSolutions({});
              setSolutionsUploaded(false);
              setAnswerKey({});
              // Trigger auto-start
              setPendingAutoStart(true);
            }
          }
        ]
      );
    } else {
      Alert.alert('Missing Info', 'Please fill all question fields.');
    }
  };

  const startExam = useCallback(() => {
    if (questions.length === 0) {
      Alert.alert('No Questions', 'Please add or generate questions before starting the exam!');
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
  }, [questions.length, examDuration]);

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));

    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + timeSpent
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

  const handleSolutionsUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (res.type === 'success') {
      const content = await FileSystem.readAsStringAsync(res.uri);
      try {
        const solutionsData = JSON.parse(content);
        if (Array.isArray(solutionsData) && solutionsData.length > 0) {
          const solutionsMap = {};
          solutionsData.forEach(sol => {
            const qId = sol.questionNumber || sol.id;
            if (qId && sol.detailedSolution && sol.correctOption && sol.finalAnswer) {
              solutionsMap[qId] = {
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
          Alert.alert('Invalid Format', 'Invalid solutions format! Please check the file structure.');
        }
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON file format!');
      }
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

    const dataStr = JSON.stringify(sampleSolutions, null, 2);
    if (Platform.OS === 'web') {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'solutions_format_sample.json';
      link.click();
    } else {
      const filename = FileSystem.documentDirectory + 'solutions_format_sample.json';
      FileSystem.writeAsStringAsync(filename, dataStr)
        .then(() => {
          Alert.alert('Downloaded', `Sample solutions format saved to ${filename}`);
        })
        .catch(e => Alert.alert('Error', `Failed to download: ${e.message}`));
    }
  };

  const formatSolutionText = (text) => {
    return text.split('\n').map((line, index) => (
      <Text key={index} style={line.trim() === '' ? styles.solutionEmptyLine : styles.solutionText}>
        {line.trim() === '' ? '' : line}
      </Text>
    ));
  };

  const downloadAnswers = () => {
    const answerData = questions.map(q => ({
      questionId: q.id,
      question: q.question.substring(0, Math.min(q.question.length, 100)) + (q.question.length > 100 ? '...' : ''),
      selectedAnswer: answers[q.id] || 'Not Attempted',
      flagged: flagged.has(q.id),
      subject: q.subject,
      topic: q.topic,
      timeSpent: questionTimes[q.id] || 0
    }));

    const dataStr = JSON.stringify(answerData, null, 2);
    if (Platform.OS === 'web') {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'exam_answers.json';
      link.click();
    } else {
      const filename = FileSystem.documentDirectory + 'exam_answers.json';
      FileSystem.writeAsStringAsync(filename, dataStr)
        .then(() => {
          Alert.alert('Downloaded', `Your answers saved to ${filename}`);
        })
        .catch(e => Alert.alert('Error', `Failed to download: ${e.message}`));
    }
  };

  const handleAnswerKeyUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (res.type === 'success') {
      const content = await FileSystem.readAsStringAsync(res.uri);
      try {
        const keyData = JSON.parse(content);
        setAnswerKey(keyData);
        Alert.alert('Success', `Answer key uploaded for ${Object.keys(keyData).length} questions.`);
        if (questions.length > 0) {
          calculateResults(keyData);
        }
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON file format for answer key!');
      }
    }
  };

  const handleQuestionsImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });

      if (res.type === 'cancel') {
        Alert.alert('Import Cancelled', 'You did not select a file to import.');
        return;
      }

      if (res.type !== 'success' || !res.uri) {
        Alert.alert('Import Failed', 'Unable to access the selected file. Please try again.');
        return;
      }

      const content = await FileSystem.readAsStringAsync(res.uri);

      let questionsData: any;
      try {
        questionsData = JSON.parse(content);
      } catch (e) {
        Alert.alert('Invalid JSON', 'The selected file is not a valid JSON file.');
        return;
      }

      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        Alert.alert('Invalid Format', 'Expected an array of question objects. Download the sample template for reference.');
        return;
      }

      const requiredFields = ['question', 'optionA', 'optionB', 'optionC', 'optionD'];
      const invalidItems: number[] = [];

      const questionsWithIds = questionsData.map((q, index) => {
        const missing = requiredFields.filter(f => !q[f]);
        if (missing.length) {
          invalidItems.push(index + 1);
        }
        return {
          id: index + 1,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          subject: q.subject || 'General',
          topic: q.topic || 'General',
        };
      });

      if (invalidItems.length === questionsWithIds.length) {
        Alert.alert('No Valid Questions', 'None of the questions in the file contain all required fields (question, optionA-D).');
        return;
      }

      if (invalidItems.length > 0) {
        Alert.alert(
          'Partial Import',
          `Imported ${questionsWithIds.length - invalidItems.length} valid questions. The following entries were skipped due to missing fields: ${invalidItems.join(', ')}`
        );
      } else {
        Alert.alert('Success', `Successfully imported ${questionsWithIds.length} questions!`);
      }

      // Keep only valid questions
      const validQuestions = questionsWithIds.filter((_, idx) => !invalidItems.includes(idx + 1));

      if (validQuestions.length === 0) {
        return; // Nothing to import
      }

      setQuestions(validQuestions);

      // reset auxiliary state before starting exam
      setAnswers({});
      setFlagged(new Set());
      setResults(null);
      setAnalysis(null);
      setSolutions({});
      setSolutionsUploaded(false);
      setAnswerKey({});

      // Trigger auto-start
      setPendingAutoStart(true);

    } catch (err) {
      Alert.alert('Import Error', err?.message || 'Something went wrong while importing the file.');
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

    const dataStr = JSON.stringify(sampleQuestions, null, 2);
    if (Platform.OS === 'web') {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'question_format_sample.json';
      link.click();
    } else {
      const filename = FileSystem.documentDirectory + 'question_format_sample.json';
      FileSystem.writeAsStringAsync(filename, dataStr)
        .then(() => {
          Alert.alert('Downloaded', `Sample questions format saved to ${filename}`);
        })
        .catch(e => Alert.alert('Error', `Failed to download: ${e.message}`));
    }
  };

  const downloadAnswerKeyFormat = () => {
    const sampleAnswerKey = {};
    const questionsToSample = questions.length > 0 ? questions.slice(0, 5) : [{ id: 1 }, { id: 2 }, { id: 3 }];
    questionsToSample.forEach((q, index) => {
      sampleAnswerKey[q.id] = ['A', 'B', 'C', 'D'][index % 4];
    });

    const dataStr = JSON.stringify(sampleAnswerKey, null, 2);
    if (Platform.OS === 'web') {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'answer_key_format_sample.json';
      link.click();
    } else {
      const filename = FileSystem.documentDirectory + 'answer_key_format_sample.json';
      FileSystem.writeAsStringAsync(filename, dataStr)
        .then(() => {
          Alert.alert('Downloaded', `Sample answer key format saved to ${filename}`);
        })
        .catch(e => Alert.alert('Error', `Failed to download: ${e.message}`));
    }
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamCompleted(false);
    setCurrentQuestion(0);
    setQuestions([]);
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
    setAiCount('10');
    setAiTopics('');
  };

  // AI generate via Lyzr
  const generateAI = async () => {
    if (!aiTopics.trim()) {
      Alert.alert('Missing Input', 'Please paste topics to generate questions.');
      return;
    }

    // Sanitize aiTopics to prevent prompt injection
    const sanitizeTopics = (input) => {
      // Remove script tags, HTML tags, and suspicious patterns
      let sanitized = input.replace(/<\/?(script|iframe|object|embed|style|link|meta)[^>]*>/gi, '');
      sanitized = sanitized.replace(/[`$\{\}\[\];]/g, ''); // Remove backticks, $, {}, [], ;
      sanitized = sanitized.replace(/--/g, ''); // Remove double dash
      sanitized = sanitized.replace(/\b(prompt|system|assistant|user|inject|eval|exec|import|require|process|window|document|global)\b/gi, '');
      sanitized = sanitized.replace(/\n{3,}/g, '\n\n'); // Collapse excessive newlines
      return sanitized.trim();
    };

    const safeTopics = sanitizeTopics(aiTopics);

    const count = parseInt(aiCount, 10);
    if (isNaN(count) || count < 1 || count > 100) {
      Alert.alert('Invalid Count', 'Please enter a valid number of questions (1-100).');
      return;
    }

    setLoadingAI(true);

    const prompt = `Please create a complete JEE (Mains + Advanced) tougher level mock test.
Test Structure:
* Total Questions: ${count}
* Subjects: Chemistry, Mathematics, Physics (distribute evenly or based on topics provided)
* Questions per Subject: (Derived from total questions and subjects)
* Question Types:
* 80% single-choice Multiple Choice Questions (MCQs) per subject.
* 20% single-choice MCQs per subject where the options are numerical values (i.e., numerical-type questions presented as MCQs).
* Difficulty: A mix mimicking JEE Advanced and slightly harder JEE Mains level. Actual paper question length and difficulty mimicking.
Syllabus:
${safeTopics}

Output Format (Strictly follow):
1. Three Separate JSON Code Blocks: Provide the output in three distinct JSON code blocks: one for questions, one for the answer key, and one for detailed solutions.
2. Formatting:
* For all mathematical and chemical formulas, equations, and symbols, you must use actual superscript (e.g., ², ³, ⁺, ⁻) and subscript (e.g., ₂, ₃, ₓ) characters.
* Do not use ^ for superscripts or _ for subscripts.
3. Questions JSON Format:
\`\`\`json
[
  {
    "questionNumber": 1,
    "question": "Your formatted question text here? e.g., What is H₂O?",
    "optionA": "Option A text",
    "optionB": "Option B text",
    "optionC": "Option C text",
    "optionD": "Option D text",
    "subject": "Subject Name",
    "topic": "Topic Name"
  }
]
\`\`\`
4. Answer Key JSON Format:
\`\`\`json
{
  "1": "A",
  "2": "C"
}
\`\`\`
5. Detailed Solutions JSON Format:
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract completion text from various possible response formats
      let completionText = '';
      if (data.completion) {
        completionText = data.completion;
      } else if (data.schema_data?.completion) {
        completionText = data.schema_data.completion;
      } else if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        completionText = data.choices[0].message.content;
      } else if (typeof data === 'string') {
        completionText = data;
      }

      if (!completionText || completionText.trim() === '') {
        throw new Error('Empty completion received from AI');
      }

      console.log('AI Response:', completionText);

      // Extract JSON blocks with improved regex
      const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
      const jsonBlocks = [];
      let match;
      
      while ((match = jsonBlockRegex.exec(completionText)) !== null) {
        const jsonContent = match[1].trim();
        if (jsonContent) {
          jsonBlocks.push(jsonContent);
        }
      }

      if (jsonBlocks.length < 3) {
        // Fallback: try to find any JSON-like content
        const fallbackRegex = /\[[\s\S]*?\]|\{[\s\S]*?\}/g;
        const fallbackMatches = completionText.match(fallbackRegex) || [];
        
        if (fallbackMatches.length >= 3) {
          jsonBlocks.push(...fallbackMatches.slice(0, 3));
        } else {
          throw new Error(`Expected 3 JSON blocks but found ${jsonBlocks.length}. Please try again with clearer topics.`);
        }
      }

      // Parse the JSON blocks with error handling
      let questionsData, answerKeyData, solutionsData;
      
      try {
        questionsData = JSON.parse(jsonBlocks[0]);
        if (!Array.isArray(questionsData)) {
          throw new Error('Questions data should be an array');
        }
      } catch (e) {
        throw new Error(`Failed to parse questions JSON: ${e.message}`);
      }

      try {
        answerKeyData = JSON.parse(jsonBlocks[1]);
        if (typeof answerKeyData !== 'object' || answerKeyData === null) {
          throw new Error('Answer key data should be an object');
        }
      } catch (e) {
        throw new Error(`Failed to parse answer key JSON: ${e.message}`);
      }

      try {
        solutionsData = JSON.parse(jsonBlocks[2]);
        if (!Array.isArray(solutionsData)) {
          throw new Error('Solutions data should be an array');
        }
      } catch (e) {
        throw new Error(`Failed to parse solutions JSON: ${e.message}`);
      }

      // Validate and process questions
      const validQuestions = questionsData.filter(q => 
        q && q.question && q.optionA && q.optionB && q.optionC && q.optionD
      );

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in AI response');
      }

      // Map questions with proper IDs
      const mappedQuestions = validQuestions.map((q, index) => ({
        id: q.questionNumber || (index + 1),
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        subject: q.subject || 'General',
        topic: q.topic || 'General'
      }));

      // Process solutions
      const solutionsMap = {};
      if (Array.isArray(solutionsData)) {
        solutionsData.forEach(sol => {
          const questionId = sol.questionNumber || sol.id;
          if (questionId && sol.detailedSolution) {
            solutionsMap[questionId] = {
              detailedSolution: sol.detailedSolution,
              correctOption: sol.correctOption || 'N/A',
              finalAnswer: sol.finalAnswer || 'N/A'
            };
          }
        });
      }

      // Update state
      setQuestions(mappedQuestions);
      setAnswerKey(answerKeyData);
      setSolutions(solutionsMap);
      setSolutionsUploaded(Object.keys(solutionsMap).length > 0);

      Alert.alert(
        'Success!', 
        `Generated ${mappedQuestions.length} questions with ${Object.keys(solutionsMap).length} solutions!`
      );
      
      // Reset auxiliary state before starting exam
      setAnswers({});
      setFlagged(new Set());
      setResults(null);
      setAnalysis(null);
      
      // Trigger auto-start once questions state is updated
      setPendingAutoStart(true);

    } catch (error) {
      console.error('AI generation error:', error);
      
      let errorMessage = 'AI generation failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Generation Error', errorMessage);
    } finally {
      setLoadingAI(false);
    }
  };

  // Setup Screen
  if (!examStarted && !examCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => nav.navigate('Landing' as never)}
        >
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <LinearGradient
          colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <ScrollView 
            contentContainerStyle={styles.setupContainer}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>CBT Exam Setup</Text>
              <Text style={styles.headerSubtitle}>Configure your exam experience</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'generate' && styles.activeTabButton]} 
                onPress={() => setActiveTab('generate')}
              >
                <Ionicons name="flash-outline" size={22} color={activeTab === 'generate' ? "#fff" : "#ccc"} />
                <Text style={[styles.tabButtonText, activeTab === 'generate' && styles.activeTabText]}>Generate</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'add' && styles.activeTabButton]} 
                onPress={() => setActiveTab('add')}
              >
                <Ionicons name="add-circle-outline" size={22} color={activeTab === 'add' ? "#fff" : "#ccc"} />
                <Text style={[styles.tabButtonText, activeTab === 'add' && styles.activeTabText]}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'import' && styles.activeTabButton]} 
                onPress={() => setActiveTab('import')}
              >
                <Ionicons name="cloud-upload-outline" size={22} color={activeTab === 'import' ? "#fff" : "#ccc"} />
                <Text style={[styles.tabButtonText, activeTab === 'import' && styles.activeTabText]}>Import</Text>
              </TouchableOpacity>
            </View>

            {/* AI Generation Section */}
            {activeTab === 'generate' && (
              <View style={styles.sectionContainer}>
                <View style={styles.cardContainer}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="flash" size={24} color="#fdbb2d" />
                    <Text style={styles.cardTitle}>AI Question Generator</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Generate exam questions using AI based on your specified topics
                  </Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Number of Questions</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter number (e.g., 10)"
                      keyboardType="numeric"
                      value={aiCount}
                      onChangeText={setAiCount}
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Topics</Text>
                    <TextInput
                      style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                      placeholder="Paste topics here... (e.g., Chemistry: Organic, Thermodynamics)"
                      multiline
                      value={aiTopics}
                      onChangeText={setAiTopics}
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.primaryButton, loadingAI && { opacity: 0.7 }]} 
                    onPress={generateAI} 
                    disabled={loadingAI}
                  >
                    {loadingAI ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Generating Questions...</Text>
                      </View>
                    ) : (
                      <>
                        <Ionicons name="rocket-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Generate Questions</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Manual Add Question Section */}
            {activeTab === 'add' && (
              <View style={styles.sectionContainer}>
                <View style={styles.cardContainer}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="create" size={24} color="#fdbb2d" />
                    <Text style={styles.cardTitle}>Add Questions Manually</Text>
                  </View>
                  
                  <Text style={styles.cardDescription}>
                    Create your own custom questions for the exam
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setShowAddQuestion(!showAddQuestion)}
                  >
                    <Ionicons name={showAddQuestion ? "chevron-up-outline" : "add-outline"} size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                      {showAddQuestion ? 'Hide Question Form' : 'Create New Question'}
                    </Text>
                  </TouchableOpacity>

                  {showAddQuestion && (
                    <KeyboardAvoidingView 
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                      style={styles.addQuestionForm}
                    >
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Question</Text>
                        <TextInput
                          placeholder="Enter your question"
                          value={newQuestion.question}
                          onChangeText={(text) => setNewQuestion({...newQuestion, question: text})}
                          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                          multiline
                          placeholderTextColor="#999"
                        />
                      </View>
                      
                      <View style={styles.optionsContainer}>
                        <View style={styles.optionInputGroup}>
                          <Text style={styles.optionLabel}>Option A</Text>
                          <TextInput
                            placeholder="Option A"
                            value={newQuestion.optionA}
                            onChangeText={(text) => setNewQuestion({...newQuestion, optionA: text})}
                            style={styles.optionInput}
                            placeholderTextColor="#999"
                          />
                        </View>
                        
                        <View style={styles.optionInputGroup}>
                          <Text style={styles.optionLabel}>Option B</Text>
                          <TextInput
                            placeholder="Option B"
                            value={newQuestion.optionB}
                            onChangeText={(text) => setNewQuestion({...newQuestion, optionB: text})}
                            style={styles.optionInput}
                            placeholderTextColor="#999"
                          />
                        </View>
                        
                        <View style={styles.optionInputGroup}>
                          <Text style={styles.optionLabel}>Option C</Text>
                          <TextInput
                            placeholder="Option C"
                            value={newQuestion.optionC}
                            onChangeText={(text) => setNewQuestion({...newQuestion, optionC: text})}
                            style={styles.optionInput}
                            placeholderTextColor="#999"
                          />
                        </View>
                        
                        <View style={styles.optionInputGroup}>
                          <Text style={styles.optionLabel}>Option D</Text>
                          <TextInput
                            placeholder="Option D"
                            value={newQuestion.optionD}
                            onChangeText={(text) => setNewQuestion({...newQuestion, optionD: text})}
                            style={styles.optionInput}
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                      
                      <View style={styles.metadataContainer}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Subject</Text>
                          <TextInput
                            placeholder="e.g., Chemistry"
                            value={newQuestion.subject}
                            onChangeText={(text) => setNewQuestion({...newQuestion, subject: text})}
                            style={styles.input}
                            placeholderTextColor="#999"
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Topic</Text>
                          <TextInput
                            placeholder="e.g., Electrochemistry"
                            value={newQuestion.topic}
                            onChangeText={(text) => setNewQuestion({...newQuestion, topic: text})}
                            style={styles.input}
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                      
                      <TouchableOpacity style={styles.primaryButton} onPress={addQuestion}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Save Question</Text>
                      </TouchableOpacity>
                    </KeyboardAvoidingView>
                  )}
                </View>
              </View>
            )}

            {/* Import Questions Section */}
            {activeTab === 'import' && (
              <View style={styles.sectionContainer}>
                <View style={styles.cardContainer}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="cloud-upload" size={24} color="#fdbb2d" />
                    <Text style={styles.cardTitle}>Import Questions</Text>
                  </View>
                  
                  <Text style={styles.cardDescription}>
                    Import questions from JSON files or download templates
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleQuestionsImport}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Import Questions JSON</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.secondaryButton} onPress={downloadQuestionFormat}>
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Download Template</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.divider} />
                  
                  <Text style={styles.sectionTitle}>Additional Resources</Text>
                  
                  <View style={styles.resourceButtonsContainer}>
                    <TouchableOpacity style={styles.resourceButton} onPress={handleAnswerKeyUpload}>
                      <Ionicons name="key-outline" size={20} color="#fff" />
                      <Text style={styles.resourceButtonText}>Upload Answer Key</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.resourceButton} onPress={downloadAnswerKeyFormat}>
                      <Ionicons name="download-outline" size={20} color="#fff" />
                      <Text style={styles.resourceButtonText}>Key Template</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.resourceButtonsContainer}>
                    <TouchableOpacity style={styles.resourceButton} onPress={handleSolutionsUpload}>
                      <Ionicons name="document-text-outline" size={20} color="#fff" />
                      <Text style={styles.resourceButtonText}>Upload Solutions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.resourceButton} onPress={downloadSolutionsFormat}>
                      <Ionicons name="download-outline" size={20} color="#fff" />
                      <Text style={styles.resourceButtonText}>Solutions Template</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Display current questions if any */}
            {questions.length > 0 && (
              <View style={styles.questionsPreviewContainer}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Loaded Questions ({questions.length})</Text>
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>{questions.length}</Text>
                  </View>
                </View>
                
                <View style={styles.questionsListWrapper}>
                  <ScrollView 
                    style={styles.questionsList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {questions.map((q, index) => (
                      <View key={q.id} style={styles.questionListItem}>
                        <View style={styles.questionNumberBadge}>
                          <Text style={styles.questionNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.questionItemContent}>
                          <Text style={styles.questionListItemText}>
                            {q.question.substring(0, 70)}{q.question.length > 70 ? '...' : ''}
                          </Text>
                          <View style={styles.questionMetaTags}>
                            <View style={styles.subjectTag}>
                              <Text style={styles.tagText}>{q.subject}</Text>
                            </View>
                            <View style={styles.topicTag}>
                              <Text style={styles.tagText}>{q.topic}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                
                <TouchableOpacity style={styles.startExamButton} onPress={startExam}>
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startExamGradient}
                  >
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
              <TouchableOpacity
                onPress={() => nav.navigate('Landing')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
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

            {/* Question Palette at Top */}
            <View style={styles.questionPaletteTop}>
              <ScrollView 
                horizontal
                contentContainerStyle={styles.paletteGridHorizontal}
                showsHorizontalScrollIndicator={false}
              >
                {questions.map((q, index) => (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setCurrentQuestion(index)}
                    style={[
                      styles.paletteItemHorizontal,
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
              
              <View style={styles.paletteLegendHorizontal}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.answeredColor]} />
                  <Text style={styles.legendTextSmall}>Done</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.unansweredColor]} />
                  <Text style={styles.legendTextSmall}>Not Done</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.flaggedColor]} />
                  <Text style={styles.legendTextSmall}>Flag</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.currentColor]} />
                  <Text style={styles.legendTextSmall}>Now</Text>
                </View>
              </View>

              <View style={styles.summaryBoxHorizontal}>
                <Text style={styles.summaryTextSmall}>
                  Done: {Object.keys(answers).length} | Not Done: {questions.length - Object.keys(answers).length} | Flagged: {flagged.size}
                </Text>
              </View>
            </View>

            {/* Main Question Area */}
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
                    <Ionicons 
                      name={flagged.has(question.id) ? "flag" : "flag-outline"} 
                      size={16} 
                      color={flagged.has(question.id) ? "#ef4444" : "#6b7280"} 
                      style={styles.buttonIcon} 
                    />
                    <Text style={[
                      styles.flagButtonText,
                      flagged.has(question.id) && styles.flaggedButtonText
                    ]}>
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
                      <View style={[
                        styles.optionCircle,
                        answers[question.id] === option && styles.selectedOptionCircle
                      ]}>
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
                  <Ionicons name="chevron-back" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleAnswerSelect(question.id, null)}
                  style={styles.clearButton}
                >
                  <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
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
                  <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => nav.navigate('Landing' as never)}
      >
        <Ionicons name="arrow-back" size={24} color="#4f46e5" />
      </TouchableOpacity>
      <LinearGradient
        colors={['#1a2a6c', '#4a365b', '#7a424a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.resultsContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.resultsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Ionicons name="trophy" size={60} color="#FFD700" style={styles.trophyIcon} />
            <Text style={styles.resultsTitle}>Exam Completed!</Text>
          </View>

          {results && (
            <View style={styles.resultsSummaryCard}>
              <Text style={styles.resultsSummaryTitle}>Your Performance</Text>
              
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{results.percentage}%</Text>
                <Text style={styles.scorePoints}>{results.score}/{results.totalMarks}</Text>
              </View>
              
              <View style={styles.resultsStatsContainer}>
                <View style={styles.resultsStat}>
                  <View style={[styles.resultStatIndicator, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.resultStatLabel}>Correct</Text>
                  <Text style={styles.resultStatValue}>{results.correct}</Text>
                </View>
                
                <View style={styles.resultsStat}>
                  <View style={[styles.resultStatIndicator, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.resultStatLabel}>Incorrect</Text>
                  <Text style={styles.resultStatValue}>{results.incorrect}</Text>
                </View>
                
                <View style={styles.resultsStat}>
                  <View style={[styles.resultStatIndicator, { backgroundColor: '#9E9E9E' }]} />
                  <Text style={styles.resultStatLabel}>Unattempted</Text>
                  <Text style={styles.resultStatValue}>{results.unattempted}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.resultsActionsContainer}>
            <Text style={styles.resultsActionTitle}>Export Data</Text>
            
            <View style={styles.resultsActionButtonsRow}>
              <TouchableOpacity style={styles.resultsActionButton} onPress={downloadAnswers}>
                <Ionicons name="download-outline" size={24} color="#fff" />
                <Text style={styles.resultsActionButtonText}>My Answers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.resultsActionButton} onPress={downloadAnswerKeyFormat}>
                <Ionicons name="key-outline" size={24} color="#fff" />
                <Text style={styles.resultsActionButtonText}>Answer Key</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.viewSolutionsButton} 
            onPress={() => setShowSolutions(!showSolutions)}
          >
            <Ionicons name={showSolutions ? "chevron-up-circle" : "chevron-down-circle"} size={24} color="#fff" />
            <Text style={styles.viewSolutionsText}>
              {showSolutions ? 'Hide Solutions & Review' : 'View Solutions & Review'}
            </Text>
          </TouchableOpacity>

          {showSolutions && (Object.keys(solutions).length > 0 || Object.keys(answerKey).length > 0) && (
            <View style={styles.solutionsContainer}>
              <Text style={styles.solutionsTitle}>Solutions & Question Review</Text>
              
              {questions.map((q, i) => {
                const userAnswer = answers[q.id];
                const correctAnswer = answerKey[q.id];
                const solution = solutions[q.id] || solutions[q.questionNumber];
                const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;
                const isIncorrect = userAnswer && correctAnswer && userAnswer !== correctAnswer;
                const isUnattempted = !userAnswer;

                return (
                  <View 
                    key={q.id} 
                    style={[
                      styles.solutionQuestionCard,
                      isCorrect ? styles.correctCard : isIncorrect ? styles.incorrectCard : styles.unattemptedCard
                    ]}
                  >
                    <View style={styles.solutionQuestionHeader}>
                      <View style={styles.solutionQuestionNumber}>
                        <Text style={styles.solutionQuestionNumberText}>Q{q.id}</Text>
                      </View>
                      
                      <View style={styles.solutionStatusBadge}>
                        <Text style={styles.solutionStatusText}>
                          {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Unattempted'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.solutionQuestionText}>{q.question}</Text>
                    
                    <View style={styles.solutionAnswersContainer}>
                      <View style={styles.solutionAnswerRow}>
                        <Text style={styles.solutionAnswerLabel}>Your Answer:</Text>
                        <Text style={[
                          styles.solutionAnswerValue,
                          isCorrect ? styles.correctText : isIncorrect ? styles.incorrectText : styles.unattemptedText
                        ]}>
                          {userAnswer || 'Not Attempted'}
                        </Text>
                      </View>
                      
                      <View style={styles.solutionAnswerRow}>
                        <Text style={styles.solutionAnswerLabel}>Correct Answer:</Text>
                        <Text style={styles.solutionCorrectAnswerValue}>{correctAnswer || 'N/A'}</Text>
                      </View>
                      
                      <View style={styles.solutionAnswerRow}>
                        <Text style={styles.solutionAnswerLabel}>Time Spent:</Text>
                        <Text style={styles.solutionTimeValue}>{questionTimes[q.id] || 0}s</Text>
                      </View>
                    </View>
                    
                    {solution ? (
                      <View style={styles.detailedSolutionContainer}>
                        <Text style={styles.detailedSolutionTitle}>Detailed Solution:</Text>
                        <View style={styles.detailedSolutionContent}>
                          {formatSolutionText(solution.detailedSolution)}
                        </View>
                        {solution.finalAnswer && (
                          <Text style={styles.detailedSolutionFinalAnswer}>
                            Final Answer: {solution.finalAnswer}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noSolutionText}>
                        No solution available for this question. {solutionsUploaded ? '' : 'Upload a solutions file.'}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {analysis && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Performance Analysis</Text>
              
              {analysis.worstSubject && (
                <View style={styles.analysisCard}>
                  <Text style={styles.analysisCardTitle}>
                    Most Challenging Subject: {analysis.worstSubject.name}
                  </Text>
                  <View style={styles.analysisStatsGrid}>
                    <View style={styles.analysisStat}>
                      <Text style={styles.analysisStatValue}>{analysis.worstSubject.data.correct}</Text>
                      <Text style={styles.analysisStatLabel}>Correct</Text>
                    </View>
                    <View style={styles.analysisStat}>
                      <Text style={styles.analysisStatValue}>{analysis.worstSubject.data.incorrect}</Text>
                      <Text style={styles.analysisStatLabel}>Incorrect</Text>
                    </View>
                    <View style={styles.analysisStat}>
                      <Text style={styles.analysisStatValue}>{analysis.worstSubject.data.unattempted}</Text>
                      <Text style={styles.analysisStatLabel}>Unattempted</Text>
                    </View>
                    <View style={styles.analysisStat}>
                      <Text style={styles.analysisStatValue}>{analysis.worstSubject.data.score}</Text>
                      <Text style={styles.analysisStatLabel}>Score</Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.analysisCard}>
                <Text style={styles.analysisCardTitle}>Subject-wise Performance</Text>
                {Object.entries(analysis.subjectAnalysis).map(([subject, data]) => (
                  <View key={subject} style={styles.subjectPerformanceRow}>
                    <Text style={styles.subjectName}>{subject}</Text>
                    <View style={styles.subjectStats}>
                      <Text style={styles.subjectStatText}>
                        <Text style={styles.subjectStatLabel}>Correct:</Text> {data.correct}
                      </Text>
                      <Text style={styles.subjectStatText}>
                        <Text style={styles.subjectStatLabel}>Incorrect:</Text> {data.incorrect}
                      </Text>
                      <Text style={styles.subjectStatText}>
                        <Text style={styles.subjectStatLabel}>Score:</Text> {data.score}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.analysisCard}>
                <Text style={styles.analysisCardTitle}>Time Analysis</Text>
                <View style={styles.timeAnalysisContainer}>
                  <View style={styles.timeAnalysisItem}>
                    <Text style={styles.timeAnalysisLabel}>Average time per question:</Text>
                    <Text style={styles.timeAnalysisValue}>{analysis.timeAnalysis.averageTimePerQuestion}s</Text>
                  </View>
                  
                  <View style={styles.timeAnalysisItem}>
                    <Text style={styles.timeAnalysisLabel}>Slowest Wrong Answers:</Text>
                    <Text style={styles.timeAnalysisValue}>
                      {analysis.timeAnalysis.slowestWrong.map(q => `Q${q.questionId} (${q.timeSpent}s)`).join(', ')}
                    </Text>
                  </View>
                  
                  <View style={styles.timeAnalysisItem}>
                    <Text style={styles.timeAnalysisLabel}>Fastest Correct Answers:</Text>
                    <Text style={styles.timeAnalysisValue}>
                      {analysis.timeAnalysis.fastestCorrect.map(q => `Q${q.questionId} (${q.timeSpent}s)`).join(', ')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.newExamButton} onPress={resetExam}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newExamGradient}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.newExamText}>Start New Exam</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  
  // Setup Screen Styles
  setupContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    marginBottom: 25,
    padding: 4,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabButtonText: {
    color: '#ccc',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#7986CB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addQuestionForm: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionInputGroup: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  optionInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  metadataContainer: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  resourceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resourceButton: {
    backgroundColor: '#5C6BC0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  resourceButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  questionsPreviewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  previewBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  previewBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionsListWrapper: {
    maxHeight: 300,
    marginBottom: 20,
  },
  questionsList: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  questionListItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  questionNumberBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionItemContent: {
    flex: 1,
  },
  questionListItemText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  questionMetaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  topicTag: {
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },
  startExamButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startExamGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  startExamText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  
  // Exam Interface Styles
  examContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  examHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  examHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  timerIcon: {
    marginRight: 6,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  submitExamButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitExamText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  examBody: {
    flex: 1,
    padding: 12,
  },
  questionPaletteTop: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paletteGridHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  paletteItemHorizontal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  paletteLegendHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendTextSmall: {
    fontSize: 10,
    color: '#555',
    fontWeight: '500',
  },
  summaryBoxHorizontal: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  summaryTextSmall: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  examMainContent: {
    flex: 1,
    padding: 12,
  },
  webExamLayout: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  webQuestionArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  questionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  questionContentContainer: {
    paddingBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionMeta: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  flaggedButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  flagButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  flaggedButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedOptionCircle: {
    backgroundColor: '#2196F3',
  },
  optionCircleFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginLeft: 4,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  optionContent: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 10,
  },
  navButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
  },
  disabledNavButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.5)',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 6,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#FF5722',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContent: {
    flexDirection: 'column',
    gap: 6,
  },
  summaryItem: {
    fontSize: 14,
    color: '#555',
  },
  mobileQuestionArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  questionPalette: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  paletteItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  currentPaletteItem: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  answeredPaletteItem: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  flaggedPaletteItem: {
    backgroundColor: '#FFC107',
    borderColor: '#FFA000',
  },
  answeredFlaggedPaletteItem: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2',
  },
  paletteItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  currentPaletteItemText: {
    color: '#fff',
  },
  answeredPaletteItemText: {
    color: '#fff',
  },
  flaggedPaletteItemText: {
    color: '#fff',
  },
  answeredFlaggedPaletteItemText: {
    color: '#fff',
  },
  paletteLegend: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  summaryContent: {
    flexDirection: 'column',
    gap: 6,
  },
  summaryItem: {
    fontSize: 14,
    color: '#555',
  },
  
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
  },
  resultsScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  trophyIcon: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  resultsSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultsSummaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  scorePercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  scorePoints: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  resultsStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  resultsStat: {
    alignItems: 'center',
  },
  resultStatIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 5,
  },
  resultStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsActionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultsActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultsActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultsActionButton: {
    backgroundColor: '#5C6BC0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  resultsActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },
  viewSolutionsButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewSolutionsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  solutionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  solutionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  solutionQuestionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  correctCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  incorrectCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  unattemptedCard: {
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 5,
    borderLeftColor: '#9E9E9E',
  },
  solutionQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionQuestionNumber: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  solutionQuestionNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  solutionStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  solutionStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  solutionQuestionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  solutionAnswersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  solutionAnswerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  solutionAnswerLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  solutionAnswerValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  unattemptedText: {
    color: '#9E9E9E',
  },
  solutionCorrectAnswerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  solutionTimeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  detailedSolutionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  detailedSolutionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  detailedSolutionContent: {
    marginBottom: 10,
  },
  solutionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  solutionEmptyLine: {
    height: 12,
  },
  detailedSolutionFinalAnswer: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(33, 150, 243, 0.2)',
  },
  noSolutionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    padding: 15,
  },
  analysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  analysisCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  analysisStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  analysisStat: {
    alignItems: 'center',
    minWidth: 70,
    marginBottom: 10,
  },
  analysisStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  analysisStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  subjectPerformanceRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subjectStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectStatText: {
    fontSize: 13,
    color: '#555',
    marginRight: 12,
    marginBottom: 4,
  },
  subjectStatLabel: {
    fontWeight: '500',
  },
  timeAnalysisContainer: {
    marginTop: 5,
  },
  timeAnalysisItem: {
    marginBottom: 10,
  },
  timeAnalysisLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timeAnalysisValue: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  newExamButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  newExamGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  newExamText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
    backgroundColor: '#ffffffcc',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
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
});