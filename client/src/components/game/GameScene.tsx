import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls, useKeyboardControls } from "@react-three/drei";
import { Road } from "./Road";
import { Car } from "./Car";
import { Traffic } from "./Traffic";
import { useDriving } from "@/lib/stores/useDriving";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import * as THREE from "three";

// Control mappings
enum Controls {
  left = "left",
  right = "right",
  submit = "submit",
}

const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.submit, keys: ["Space", "Enter"] },
];

function GameLogic() {
  const { 
    playerLane, 
    setPlayerLane, 
    updatePlayerPosition, 
    checkCollisions, 
    increaseDifficulty,
    difficulty 
  } = useDriving();
  const { 
    questions, 
    currentQuestionIndex, 
    answerQuestion, 
    nextQuestion, 
    gameStats, 
    loseLife,
    timeRemaining,
    tickTimer 
  } = useQuiz();
  const { end } = useGame();
  const { playHit, playSuccess } = useAudio();
  
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const lastLaneChangeRef = useRef(0);
  const hasAnsweredRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  
  // Handle lane changes
  useEffect(() => {
    const unsubscribeLeft = subscribe(
      (state: any) => state.left,
      (pressed: boolean) => {
        if (pressed && Date.now() - lastLaneChangeRef.current > 200) {
          setPlayerLane(playerLane - 1);
          lastLaneChangeRef.current = Date.now();
          console.log("Moving left to lane:", Math.max(0, playerLane - 1));
        }
      }
    );
    
    const unsubscribeRight = subscribe(
      (state: any) => state.right,
      (pressed: boolean) => {
        if (pressed && Date.now() - lastLaneChangeRef.current > 200) {
          setPlayerLane(playerLane + 1);
          lastLaneChangeRef.current = Date.now();
          console.log("Moving right to lane:", Math.min(3, playerLane + 1));
        }
      }
    );
    
    const unsubscribeSubmit = subscribe(
      (state: any) => state.submit,
      (pressed: boolean) => {
        if (pressed && !hasAnsweredRef.current && questions[currentQuestionIndex]) {
          console.log("Manual answer submission for lane:", playerLane);
          
          // Submit answer manually
          const isCorrect = answerQuestion(playerLane);
          
          if (isCorrect) {
            playSuccess();
          } else {
            playHit();
            loseLife();
          }
          
          hasAnsweredRef.current = true;
          
          // Clear timer
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Move to next question or end game
          setTimeout(() => {
            const currentStats = useQuiz.getState().gameStats;
            console.log("Manual submit - lives remaining:", currentStats.lives);
            
            if (currentStats.lives <= 0) {
              console.log("Game over - no lives left after manual submit");
              end();
            } else if (currentQuestionIndex < questions.length - 1) {
              console.log("Moving to next question after manual submit");
              nextQuestion();
              hasAnsweredRef.current = false;
              
              // Increase difficulty every few questions
              if ((currentQuestionIndex + 1) % 3 === 0) {
                increaseDifficulty();
              }
            } else {
              console.log("All questions completed after manual submit");
              end();
            }
          }, 2000);
        }
      }
    );
    
    return () => {
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeSubmit();
    };
  }, [subscribe, playerLane, setPlayerLane, currentQuestionIndex, questions.length, answerQuestion, playSuccess, playHit, loseLife, nextQuestion, increaseDifficulty, end]);
  
  // Timer management
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !hasAnsweredRef.current) {
      // Start timer
      timerRef.current = window.setInterval(() => {
        tickTimer();
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestionIndex, questions, tickTimer]);
  
  // Handle timer reaching zero
  useEffect(() => {
    if (timeRemaining === 0 && !hasAnsweredRef.current) {
      console.log("Timer reached zero - auto-submitting answer for lane:", playerLane);
      // Time's up - auto submit current lane as answer
      const isCorrect = answerQuestion(playerLane);
      console.log("Answer was:", isCorrect ? "correct" : "incorrect");
      
      if (isCorrect) {
        playSuccess();
      } else {
        playHit();
        loseLife();
      }
      
      hasAnsweredRef.current = true;
      
      // Clear timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Move to next question or end game
      setTimeout(() => {
        const currentStats = useQuiz.getState().gameStats;
        console.log("Current lives after answer:", currentStats.lives);
        
        if (currentStats.lives <= 0) {
          console.log("Game over - no lives left");
          end();
        } else if (currentQuestionIndex < questions.length - 1) {
          console.log("Moving to next question");
          nextQuestion();
          hasAnsweredRef.current = false;
          
          // Increase difficulty every few questions
          if ((currentQuestionIndex + 1) % 3 === 0) {
            increaseDifficulty();
          }
        } else {
          console.log("All questions completed - ending game");
          end();
        }
      }, 2000);
    }
  }, [timeRemaining, playerLane, answerQuestion, playSuccess, playHit, loseLife, currentQuestionIndex, questions.length, nextQuestion, increaseDifficulty, end]);

  // Game loop
  useFrame((_, delta) => {
    // Update player position
    updatePlayerPosition(delta);
    
    // Check for collisions
    if (checkCollisions()) {
      playHit();
      loseLife();
      // Check lives after losing one
      const updatedStats = useQuiz.getState().gameStats;
      if (updatedStats.lives <= 0) {
        end();
        return;
      }
    }
    
    // End game if no lives left
    const currentStats = useQuiz.getState().gameStats;
    if (currentStats.lives <= 0) {
      end();
    }
  });
  
  return null;
}

export function GameScene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{
          position: [0, 15, 20],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          powerPreference: "default",
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[0, 10, 0]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <Road />
          <Car isPlayer={true} color="#ff6b6b" />
          <Traffic />
        </Suspense>
        
        <GameLogic />
        
        {/* Camera controls for debugging - remove in production */}
        {/* <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> */}
      </Canvas>
    </KeyboardControls>
  );
}
