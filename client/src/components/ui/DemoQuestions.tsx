import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useGame } from "@/lib/stores/useGame";
import { Play, BookOpen } from "lucide-react";
import { Question } from "@/types/game";

const demoQuestions: Question[] = [
  {
    id: "demo_1",
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Rome"],
    correctAnswer: 1,
    explanation: "Paris is the capital and largest city of France."
  },
  {
    id: "demo_2", 
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is called the Red Planet due to its reddish appearance from iron oxide on its surface."
  },
  {
    id: "demo_3",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "2 + 2 equals 4, a basic addition problem."
  },
  {
    id: "demo_4",
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    explanation: "William Shakespeare wrote the tragedy 'Romeo and Juliet' in the early part of his career."
  },
  {
    id: "demo_5",
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Pacific", "Indian", "Arctic"],
    correctAnswer: 1,
    explanation: "The Pacific Ocean is the largest and deepest ocean on Earth."
  }
];

interface DemoQuestionsProps {
  onClose: () => void;
}

export function DemoQuestions({ onClose }: DemoQuestionsProps) {
  const { setQuestions } = useQuiz();
  const { start } = useGame();

  const handleStartDemo = () => {
    setQuestions(demoQuestions);
    start();
  };

  return (
    <Card className="bg-blue-900/90 border-blue-700 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Try Demo Questions</h3>
            <p className="text-blue-200 text-sm">Experience the game with sample questions</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleStartDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Demo
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-blue-600 text-blue-300 hover:bg-blue-600/20"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}