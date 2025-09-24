import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { Badge } from "@/components/ui/badge";

export function QuestionOverlay() {
  const { questions, currentQuestionIndex } = useQuiz();
  const { playerLane } = useDriving();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  const lanes = [
    { id: 0, label: "A", color: "bg-red-600" },
    { id: 1, label: "B", color: "bg-blue-600" },
    { id: 2, label: "C", color: "bg-green-600" },
    { id: 3, label: "D", color: "bg-yellow-600" },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="mb-3">
            <Badge variant="secondary" className="mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <h3 className="text-white font-semibold text-lg leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg border transition-all ${
                  playerLane === index
                    ? `${lanes[index].color} border-white text-white shadow-lg transform scale-105`
                    : "bg-gray-800 border-gray-600 text-gray-300"
                }`}
              >
                <Badge
                  variant={playerLane === index ? "secondary" : "outline"}
                  className={`mr-3 ${
                    playerLane === index ? "bg-white text-gray-900" : ""
                  }`}
                >
                  {lanes[index].label}
                </Badge>
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-gray-400 text-sm">
              Use arrow keys to change lanes • Drive into the correct answer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
