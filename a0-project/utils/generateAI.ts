/**
 * This function robustly parses AI responses, handling partial and total failures gracefully.
 * If parsing fails, it falls back to sample data for questions, answer key, and solutions.
 */
// Robust AI response parsing and fallback logic implemented throughout this file.
/**
 * Represents a single AI-generated question for the JEE mock test.
 */
export interface AIQuestion {
  questionNumber: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subject: string;
  topic: string;
}

/**
 * Represents a detailed solution for a given AI-generated question.
 */
export interface AISolution {
  questionNumber: number;
  detailedSolution: string;
  correctOption: string;
  finalAnswer: string;
}

/**
 * The full AI response containing questions, answer key, and solutions.
 */
export interface AIResponse {
  questions: AIQuestion[];
  answerKey: Record<number, string>;
  solutions: AISolution[];
}

/**
 * Generates a JEE mock test using AI, returning questions, answer key, and solutions.
 * @param count Number of questions to generate
 * @param topics Comma-separated topics for the test
 * @returns AIResponse object with questions, answer key, and solutions
 */
export async function generateAI(count: number, topics: string): Promise<AIResponse> {
  const prompt = `Please create a complete JEE (Mains + Advanced) tougher level mock test with ${count} questions on topics: ${topics}`;
  // TODO: Extract AI fetch logic to a custom hook for reuse and testability
  // TODO: Modularize fallback sample data generation for easier maintenance
  try {
    const response = await fetch('https://api.a0.dev/ai/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    // Robustly extract completion text from possible response shapes
    let completionText = '';
    if (typeof data === 'string') completionText = data;
    else if (data.completion) completionText = data.completion;
    else if (data.schema_data?.completion) completionText = data.schema_data.completion;
    else if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) completionText = data.choices[0].message.content;
    // Fallback: try to stringify if still empty
    if (!completionText && data) completionText = JSON.stringify(data);

    // Extract JSON blocks using regex
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    const jsonBlocks: string[] = [];
    let match;
    while ((match = jsonBlockRegex.exec(completionText)) !== null) {
      const jsonContent = match[1].trim();
      if (jsonContent) jsonBlocks.push(jsonContent);
    }

    // If not enough blocks, try to extract any JSON arrays/objects from the text
    if (jsonBlocks.length < 3) {
      // Try to find all top-level JSON arrays/objects
      const fallbackRegex = /([\[{][\s\S]*?[\]}])/g;
      let fallbackMatch;
      while ((fallbackMatch = fallbackRegex.exec(completionText)) !== null) {
        try {
          const parsed = JSON.parse(fallbackMatch[1]);
          // Only push if valid and not already present
          if (parsed && !jsonBlocks.includes(fallbackMatch[1])) {
            jsonBlocks.push(fallbackMatch[1]);
          }
        } catch {}
      }
    }

    if (jsonBlocks.length < 3) {
      throw new Error(`Expected 3 JSON blocks but found ${jsonBlocks.length}`);
    }

    // Parse the first three blocks with type guards
    let questions: AIQuestion[] = [];
    let answerKey: Record<number, string> = {};
    let solutions: AISolution[] = [];
    // Inline error handling for each block
    let parseError = false;
    try {
      const parsedQuestions = (() => { try { return JSON.parse(jsonBlocks[0]); } catch { parseError = true; return []; } })();
      const parsedAnswerKey = (() => { try { return JSON.parse(jsonBlocks[1]); } catch { parseError = true; return {}; } })();
      const parsedSolutions = (() => { try { return JSON.parse(jsonBlocks[2]); } catch { parseError = true; return []; } })();
      if (Array.isArray(parsedQuestions)) questions = parsedQuestions;
      if (parsedAnswerKey && typeof parsedAnswerKey === 'object') answerKey = parsedAnswerKey;
      if (Array.isArray(parsedSolutions)) solutions = parsedSolutions;
    } catch (e: unknown) {
      parseError = true;
    }
    if (parseError) {
      console.warn('Partial AI response parse failure, using fallback for missing sections.');
      // Fallback for missing sections
      if (!questions.length) {
        questions = Array.from({ length: count }).map((_, i) => ({
          questionNumber: i + 1,
          question: `Sample question ${i + 1}?`,
          optionA: 'Option A',
          optionB: 'Option B',
          optionC: 'Option C',
          optionD: 'Option D',
          subject: 'General',
          topic: 'General',
        }));
      }
      if (!Object.keys(answerKey).length) {
        questions.forEach(q => { answerKey[q.questionNumber] = 'A'; });
      }
      if (!solutions.length) {
        solutions = questions.map(q => ({
          questionNumber: q.questionNumber,
          detailedSolution: `Solution for question ${q.questionNumber}.`,
          correctOption: 'A',
          finalAnswer: 'Option A',
        }));
      }
    }
    return { questions, answerKey, solutions };
  } catch (error: unknown) {
    // Use error?.message if available, else fallback to string
    const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    console.warn('AI fetch failed, using sample data:', errorMsg);
    // Fallback: generate sample questions, answer key, and solutions
    const sampleQuestions: AIQuestion[] = Array.from({ length: count }).map((_, i) => ({
      questionNumber: i + 1,
      question: `Sample question ${i + 1}?`,
      optionA: 'Option A',
      optionB: 'Option B',
      optionC: 'Option C',
      optionD: 'Option D',
      subject: 'General',
      topic: 'General',
    }));
    const sampleAnswerKey: Record<number, string> = {};
    sampleQuestions.forEach(q => { sampleAnswerKey[q.questionNumber] = 'A'; });
    const sampleSolutions: AISolution[] = sampleQuestions.map(q => ({
      questionNumber: q.questionNumber,
      detailedSolution: `Solution for question ${q.questionNumber}.`,
      correctOption: 'A',
      finalAnswer: 'Option A',
    }));
    return {
      questions: sampleQuestions,
      answerKey: sampleAnswerKey,
      solutions: sampleSolutions
    } as AIResponse;
  }
}