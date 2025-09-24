import { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGame } from "@/lib/stores/useGame";
import { useQuiz } from "@/lib/stores/useQuiz";
import { GameMenu } from "@/components/ui/GameMenu";
import { TextInput } from "@/components/ui/TextInput";
import { GameScene } from "@/components/game/GameScene";
import { QuestionOverlay } from "@/components/ui/QuestionOverlay";
import { GameUI } from "@/components/ui/GameUI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Home } from "lucide-react";
import "@fontsource/inter";
import "./index.css";

const queryClient = new QueryClient();

function GameEndScreen() {
  const { gameStats, resetQuiz } = useQuiz();
  const { restart } = useGame();
  
  const handleRestart = () => {
    resetQuiz();
    restart();
  };
  
  const accuracy = gameStats.questionsAnswered > 0 
    ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-purple-600">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Game Complete!</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Final Score:</span>
              <span className="text-white font-bold text-lg">{gameStats.score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Questions Answered:</span>
              <span className="text-white">{gameStats.questionsAnswered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Correct Answers:</span>
              <span className="text-white">{gameStats.correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Accuracy:</span>
              <span className="text-white">{accuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Best Streak:</span>
              <span className="text-white">{gameStats.streak}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleRestart} className="w-full bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleRestart} 
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              New Content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const { phase } = useGame();
  const { questions } = useQuiz();

  useEffect(() => {
    console.log("Game phase changed to:", phase);
  }, [phase]);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {phase === "ready" && <GameMenu />}
        
        {phase === "playing" && questions.length === 0 && <TextInput />}
        
        {phase === "playing" && questions.length > 0 && (
          <>
            <Suspense 
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                  <div className="text-white">Loading game...</div>
                </div>
              }
            >
              <GameScene />
            </Suspense>
            <QuestionOverlay />
            <GameUI />
          </>
        )}
        
        {phase === "ended" && <GameEndScreen />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
