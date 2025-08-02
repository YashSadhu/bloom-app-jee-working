import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Question, AnswerKey, Solution, SolutionKey } from '../types/test';

export const useFileUpload = (
  setQuestions: (questions: Question[]) => void,
  setAnswerKey: (answerKey: AnswerKey) => void,
  setSolutions: (solutions: SolutionKey) => void
) => {
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

  return {
    uploadQuestions,
    uploadAnswerKey,
    uploadSolutions
  };
};