import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function QuestionOverlay() {
  const { questions, currentQuestionIndex, timeRemaining } = useQuiz();
  const { playerLane } = useDriving();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  const lanes = [
    { id: 0, label: "A", color: "bg-red-600", borderColor: "border-red-400" },
    { id: 1, label: "B", color: "bg-blue-600", borderColor: "border-blue-400" },
    { id: 2, label: "C", color: "bg-green-600", borderColor: "border-green-400" },
    { id: 3, label: "D", color: "bg-yellow-600", borderColor: "border-yellow-400" },
  ];

  const getTimerColor = () => {
    if (timeRemaining > 10) return "text-green-400";
    if (timeRemaining > 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
      {/* Timer and Question Number */}
      <div className="flex justify-center mb-4">
        <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
          <CardContent className="px-6 py-2 flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <div className={`flex items-center gap-2 font-bold text-lg ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              <span>{timeRemaining}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question */}
      <div className="mb-4">
        <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <h3 className="text-white font-semibold text-xl leading-relaxed max-w-4xl mx-auto">
              {currentQuestion.question}
            </h3>
          </CardContent>
        </Card>
      </div>
      
      {/* Toll Booth Style Lanes */}
      <div className="grid grid-cols-4 gap-3 max-w-6xl mx-auto">
        {currentQuestion.options.map((option, index) => (
          <div key={index} className="relative">
            {/* Lane Header */}
            <div 
              className={`text-center mb-2 p-3 rounded-t-lg border-2 ${
                playerLane === index 
                  ? `${lanes[index].color} ${lanes[index].borderColor} border-white shadow-lg` 
                  : "bg-gray-800 border-gray-600"
              } transition-all duration-200`}
            >
              <Badge 
                variant={playerLane === index ? "secondary" : "outline"}
                className={`text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                  playerLane === index ? "bg-white text-gray-900" : "text-gray-300"
                }`}
              >
                {lanes[index].label}
              </Badge>
            </div>
            
            {/* Answer Content */}
            <Card 
              className={`transition-all duration-200 ${
                playerLane === index 
                  ? `${lanes[index].color} border-white shadow-xl transform scale-105` 
                  : "bg-gray-800 border-gray-600"
              }`}
            >
              <CardContent className="p-4 text-center min-h-[100px] flex items-center justify-center">
                <span className={`text-sm font-medium ${
                  playerLane === index ? "text-white" : "text-gray-300"
                }`}>
                  {option}
                </span>
              </CardContent>
            </Card>
            
            {/* Lane Indicator */}
            {playerLane === index && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-gray-400 text-sm">
          Use ← → arrow keys to change lanes • Press SPACE or ENTER to submit answer • Or wait for timer
        </p>
      </div>
    </div>
  );
}
