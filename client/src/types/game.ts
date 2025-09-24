export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  correctAnswer: number; // 0-3 index
  explanation?: string;
}

export interface GameStats {
  score: number;
  lives: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface Lane {
  id: number;
  label: string; // A, B, C, D
  position: number; // X position
}

export interface TrafficCar {
  id: string;
  lane: number;
  position: number; // Z position
  speed: number;
}

export type GamePhase = "menu" | "input" | "playing" | "ended";
