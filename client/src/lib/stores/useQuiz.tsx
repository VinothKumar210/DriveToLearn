import { create } from "zustand";
import { Question, GameStats } from "@/types/game";

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  gameStats: GameStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setQuestions: (questions: Question[]) => void;
  nextQuestion: () => void;
  answerQuestion: (answerIndex: number) => boolean;
  resetQuiz: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loseLife: () => void;
}

const initialStats: GameStats = {
  score: 0,
  lives: 3,
  streak: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
};

export const useQuiz = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  gameStats: initialStats,
  isLoading: false,
  error: null,
  
  setQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),
  
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },
  
  answerQuestion: (answerIndex: number) => {
    const { questions, currentQuestionIndex, gameStats } = get();
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) return false;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const newStats = { ...gameStats };
    
    newStats.questionsAnswered++;
    
    if (isCorrect) {
      newStats.correctAnswers++;
      newStats.score += Math.max(10, 50 - (newStats.questionsAnswered * 2)); // Decreasing points
      newStats.streak++;
    } else {
      newStats.streak = 0;
    }
    
    set({ gameStats: newStats });
    return isCorrect;
  },
  
  loseLife: () => {
    const { gameStats } = get();
    set({
      gameStats: {
        ...gameStats,
        lives: Math.max(0, gameStats.lives - 1)
      }
    });
  },
  
  resetQuiz: () => set({
    questions: [],
    currentQuestionIndex: 0,
    gameStats: initialStats,
    error: null,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
