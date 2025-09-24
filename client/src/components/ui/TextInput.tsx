import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoQuestions } from "./DemoQuestions";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useGame } from "@/lib/stores/useGame";
import { Loader2, BookOpen, ArrowRight, Lightbulb } from "lucide-react";
import { Question } from "@/types/game";

export function TextInput() {
  const [text, setText] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const { setQuestions, setLoading, setError, isLoading, error } = useQuiz();
  const { start } = useGame();

  const handleGenerateQuestions = async () => {
    if (!text.trim()) {
      setError("Please enter some text to generate questions from.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`;
        
        // Provide more specific error messages for common issues
        if (response.status === 503) {
          throw new Error("AI service is currently busy. Please try again in a few moments.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else if (response.status >= 500) {
          throw new Error("Server is experiencing issues. Please try again later.");
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from server");
      }

      if (data.questions.length === 0) {
        throw new Error("No questions could be generated from the provided text. Try providing more detailed content.");
      }

      setQuestions(data.questions as Question[]);
      start(); // Move to playing phase
    } catch (err) {
      console.error("Error generating questions:", err);
      
      // Provide user-friendly error messages
      let userMessage = "Failed to generate questions. Please try again.";
      if (err instanceof Error) {
        userMessage = err.message;
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-900 to-green-600 p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Enter Your Study Material
          </CardTitle>
          <p className="text-gray-300">
            Paste your notes, paragraphs, or study content to generate quiz questions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your study material here... (e.g., lecture notes, textbook passages, study guides)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
            disabled={isLoading}
          />
          
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-300 text-sm">{error}</p>
              {(error.includes("busy") || error.includes("overloaded") || error.includes("503")) && (
                <p className="text-red-200 text-xs mt-2">
                  💡 Tip: Try again in a few moments when the AI service is less busy.
                </p>
              )}
            </div>
          )}
          
          <Button
            onClick={handleGenerateQuestions}
            disabled={isLoading || !text.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5 mr-2" />
                Generate Questions & Start Game
              </>
            )}
          </Button>
          
          <div className="text-center text-gray-400 text-sm">
            <p>AI will generate 5-10 multiple choice questions based on your content</p>
          </div>

          {/* Demo option */}
          {!showDemo && error && (error.includes("busy") || error.includes("overloaded") || error.includes("503")) && (
            <div className="text-center">
              <Button
                onClick={() => setShowDemo(true)}
                variant="outline"
                className="border-blue-600 text-blue-300 hover:bg-blue-600/20"
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Try Demo Questions Instead
              </Button>
            </div>
          )}

          {showDemo && (
            <DemoQuestions onClose={() => setShowDemo(false)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
