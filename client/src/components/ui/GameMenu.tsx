import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/lib/stores/useGame";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { Play, BookOpen, Trophy } from "lucide-react";

export function GameMenu() {
  const { start } = useGame();
  const { gameStats, resetQuiz } = useQuiz();
  const { resetDriving } = useDriving();
  
  const handleStartGame = () => {
    resetQuiz();
    resetDriving();
    start();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Learning Drive
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Answer questions by driving into the correct lane!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start New Game
          </Button>
          
          {gameStats.questionsAnswered > 0 && (
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-white font-semibold">Last Game Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-300">Score: <span className="text-white">{gameStats.score}</span></div>
                  <div className="text-gray-300">Answered: <span className="text-white">{gameStats.questionsAnswered}</span></div>
                  <div className="text-gray-300">Correct: <span className="text-white">{gameStats.correctAnswers}</span></div>
                  <div className="text-gray-300">Accuracy: <span className="text-white">
                    {gameStats.questionsAnswered > 0 ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100) : 0}%
                  </span></div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center text-gray-400 text-xs">
            <p>Use arrow keys to change lanes</p>
            <p>Drive into the lane with the correct answer</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
