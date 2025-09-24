import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls, useKeyboardControls } from "@react-three/drei";
import { Road } from "./Road";
import { DynamicRoad } from "./DynamicRoad";
import { Car } from "./Car";
import { Traffic } from "./Traffic";
import { FloatingAnswers } from "./FloatingAnswers";
import { Environment } from "./Environment";
import { ParticleSystem } from "./ParticleSystem";
import { PowerUps } from "./PowerUps";
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
    difficulty,
    playerPosition
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
  const { playHit, playSuccess, playLaneChange, playEngine, stopEngine } = useAudio();
  
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const lastLaneChangeRef = useRef(0);
  const hasAnsweredRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [showSuccessParticles, setShowSuccessParticles] = useState(false);
  const [showCollisionParticles, setShowCollisionParticles] = useState(false);
  
  // Handle lane changes
  useEffect(() => {
    const unsubscribeLeft = subscribe(
      (state: any) => state.left,
      (pressed: boolean) => {
        if (pressed && Date.now() - lastLaneChangeRef.current > 200) {
          setPlayerLane(playerLane - 1);
          lastLaneChangeRef.current = Date.now();
          playLaneChange();
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
          playLaneChange();
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
            setShowSuccessParticles(true);
            setTimeout(() => setShowSuccessParticles(false), 2000);
          } else {
            playHit();
            loseLife();
            setShowCollisionParticles(true);
            setTimeout(() => setShowCollisionParticles(false), 2000);
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
        setShowSuccessParticles(true);
        setTimeout(() => setShowSuccessParticles(false), 2000);
      } else {
        playHit();
        loseLife();
        setShowCollisionParticles(true);
        setTimeout(() => setShowCollisionParticles(false), 2000);
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

  // Start engine sound when game begins
  useEffect(() => {
    playEngine();
    return () => stopEngine();
  }, [playEngine, stopEngine]);

  // Game loop
  useFrame((_, delta) => {
    // Update player position
    updatePlayerPosition(delta);
    
    // Check for collisions
    if (checkCollisions()) {
      playHit();
      loseLife();
      setShowCollisionParticles(true);
      setTimeout(() => setShowCollisionParticles(false), 2000);
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
  
  return (
    <>
      {/* Success particle effects */}
      {showSuccessParticles && (
        <ParticleSystem
          count={30}
          color="#22c55e"
          size={0.15}
          speed={3}
          spread={2}
          position={[playerPosition * 0.1, 2, playerPosition]}
          type="success"
        />
      )}
      
      {/* Collision particle effects */}
      {showCollisionParticles && (
        <ParticleSystem
          count={25}
          color="#ef4444"
          size={0.12}
          speed={2.5}
          spread={1.5}
          position={[playerPosition * 0.1, 1.5, playerPosition]}
          type="collision"
        />
      )}
    </>
  );
}

export function GameScene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{
          position: [0, 8, 15],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          alpha: false,
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.3} color="#404080" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          color="#ffffff"
        />
        {/* Road lighting */}
        <spotLight
          position={[0, 15, 0]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={0.5}
          castShadow
          target-position={[0, 0, 0]}
        />
        {/* Dynamic side lighting */}
        <pointLight position={[-20, 5, 10]} intensity={0.3} color="#ff6600" />
        <pointLight position={[20, 5, 10]} intensity={0.3} color="#0066ff" />
        
        <Suspense fallback={null}>
          <DynamicRoad />
          <Car isPlayer={true} color="#ff6b6b" />
          <Traffic />
          <FloatingAnswers />
        </Suspense>
        
        <GameLogic />
        
        {/* Camera controls for debugging - remove in production */}
        {/* <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> */}
      </Canvas>
    </KeyboardControls>
  );
}
