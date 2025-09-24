import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuiz } from "@/lib/stores/useQuiz";
import { Clock } from "lucide-react";

export function GameHUD() {
  const { questions, currentQuestionIndex, timeRemaining } = useQuiz();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  const getTimerColor = () => {
    if (timeRemaining > 10) return "text-green-400";
    if (timeRemaining > 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
        <CardContent className="px-6 py-3">
          {/* Question */}
          <div className="text-center mb-3">
            <h3 className="text-white font-semibold text-lg leading-relaxed max-w-2xl">
              {currentQuestion.question}
            </h3>
          </div>
          
          {/* Timer and Progress */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <div className={`flex items-center gap-2 font-bold text-lg ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              <span>{timeRemaining}s</span>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-2 text-center">
            <p className="text-gray-400 text-sm">
              Use ← → arrow keys to change lanes • Press SPACE or ENTER to submit • Drive into the correct answer lane
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}