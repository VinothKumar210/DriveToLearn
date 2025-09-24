import { Question } from "../../client/src/types/game";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;
    
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY not found in environment variables");
    }
  }

  async generateQuestions(text: string): Promise<Question[]> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = `
Based on the following text, generate exactly 5 multiple-choice questions. Each question should have 4 options (A, B, C, D) and test understanding of the content.

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Requirements:
- Each question must be clear and unambiguous
- All 4 options should be plausible but only one correct
- correctAnswer should be the index (0-3) of the correct option
- Focus on key concepts, facts, and understanding from the text
- Vary the difficulty from basic recall to application/analysis

Text to analyze:
${text}

Return only the JSON array, no additional text.
`;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from Gemini API");
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON from the response
      let questionsData;
      try {
        // Remove any markdown formatting or extra text
        const cleanJson = generatedText.replace(/```json\n?|\n?```/g, '').trim();
        questionsData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", generatedText);
        throw new Error("Invalid JSON response from Gemini API");
      }

      if (!Array.isArray(questionsData)) {
        throw new Error("Expected array of questions from Gemini API");
      }

      // Validate and format questions
      const questions: Question[] = questionsData.map((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${index}`);
        }

        return {
          id: `q_${Date.now()}_${index}`,
          question: q.question,
          options: q.options as [string, string, string, string],
          correctAnswer: Number(q.correctAnswer) || 0,
          explanation: q.explanation || "",
        };
      });

      if (questions.length === 0) {
        throw new Error("No valid questions generated");
      }

      return questions;
    } catch (error) {
      console.error("Error generating questions with Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
