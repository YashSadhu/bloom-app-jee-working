export interface Question {
  questionNumber: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subject: string;
  topic: string;
}

export interface AnswerKey {
  [key: string]: string;
}

export interface Solution {
  questionNumber: number;
  detailedSolution: string;
  correctOption: string;
  finalAnswer: string;
}

export interface SolutionKey {
  [key: string]: Solution;
}

export interface JEETopic {
  id: string;
  name: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
}

export interface AIGenerationState {
  isGenerating: boolean;
  selectedTopics: string[];
  numberOfQuestions: number;
  showTopicSelection: boolean;
}

export interface TestResults {
  correct: number;
  attempted: number;
  total: number;
  percentage: string;
  subjectWise: { [key: string]: { correct: number; total: number } };
}