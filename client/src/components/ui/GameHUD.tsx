import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { Clock, Heart, Zap, Target } from "lucide-react";

export function GameHUD() {
  const { questions, currentQuestionIndex, timeRemaining, gameStats } = useQuiz();
  const { difficulty } = useDriving();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  const getTimerColor = () => {
    if (timeRemaining > 10) return "text-green-400";
    if (timeRemaining > 5) return "text-yellow-400";
    return "text-red-400 animate-pulse";
  };

  const getTimerBarWidth = () => {
    return Math.max(0, (timeRemaining / 15) * 100);
  };

  return (
    <>
      {/* Main HUD */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:bg-gray-900/98">
          <CardContent className="px-6 py-3">
            {/* Question */}
            <div className="text-center mb-3">
              <h3 className="text-white font-semibold text-lg leading-relaxed max-w-2xl animate-in fade-in duration-500">
                {currentQuestion.question}
              </h3>
            </div>
            
            {/* Timer with progress bar */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <Badge variant="secondary" className="text-sm bg-blue-600/20 text-blue-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <div className={`flex items-center gap-2 font-bold text-lg ${getTimerColor()}`}>
                <Clock className="w-5 h-5" />
                <span>{timeRemaining}s</span>
              </div>
            </div>
            
            {/* Timer progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeRemaining > 10 ? 'bg-green-400' : 
                  timeRemaining > 5 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${getTimerBarWidth()}%` }}
              />
            </div>
            
            {/* Instructions */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Use ← → arrow keys to change lanes • Press SPACE or ENTER to submit • Drive into the correct answer lane
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats HUD */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-2">
              {/* Lives */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-white font-semibold">{gameStats.lives}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < gameStats.lives ? 'bg-red-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Score */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{gameStats.score}</span>
              </div>
              
              {/* Streak */}
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold">{gameStats.streak}</span>
              </div>
              
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Level {difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}