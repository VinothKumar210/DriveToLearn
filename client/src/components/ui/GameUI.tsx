import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { Heart, Trophy, Target, Zap } from "lucide-react";

export function GameUI() {
  const { gameStats, questions, currentQuestionIndex } = useQuiz();
  const { difficulty, gameSpeed } = useDriving();

  return (
    <div className="absolute top-4 right-4 z-10">
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          {/* Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-semibold">Score</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-600 text-white">
              {gameStats.score}
            </Badge>
          </div>

          {/* Lives */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-white font-semibold">Lives</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < gameStats.lives ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-white font-semibold">Streak</span>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {gameStats.streak}
            </Badge>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-white font-semibold">Progress</span>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-400">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Difficulty</span>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              Level {difficulty}
            </Badge>
          </div>

          {/* Speed */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Speed</span>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              {gameSpeed.toFixed(1)}x
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
