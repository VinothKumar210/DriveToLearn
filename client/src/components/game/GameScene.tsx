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
}

const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
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
    loseLife 
  } = useQuiz();
  const { end } = useGame();
  const { playHit, playSuccess } = useAudio();
  
  const [subscribe, getState] = useKeyboardControls<Controls>();
  const lastLaneChangeRef = useRef(0);
  const hasAnsweredRef = useRef(false);
  
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
    
    return () => {
      unsubscribeLeft();
      unsubscribeRight();
    };
  }, [subscribe, playerLane, setPlayerLane]);
  
  // Game loop
  useFrame((_, delta) => {
    // Update player position
    updatePlayerPosition(delta);
    
    // Check for collisions
    if (checkCollisions()) {
      playHit();
      loseLife();
      if (gameStats.lives <= 1) {
        end();
        return;
      }
    }
    
    // Auto-answer questions after some time (simulating reaching the answer zone)
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !hasAnsweredRef.current) {
      // Check if player has "driven through" the answer zone
      // This could be based on position or timer - using a simple timer for now
      setTimeout(() => {
        if (!hasAnsweredRef.current) {
          const isCorrect = answerQuestion(playerLane);
          
          if (isCorrect) {
            playSuccess();
          } else {
            playHit();
            loseLife();
          }
          
          hasAnsweredRef.current = true;
          
          // Move to next question or end game
          setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
              nextQuestion();
              hasAnsweredRef.current = false;
              
              // Increase difficulty every few questions
              if ((currentQuestionIndex + 1) % 3 === 0) {
                increaseDifficulty();
              }
            } else {
              end();
            }
          }, 2000);
        }
      }, 3000); // 3 seconds to answer
    }
    
    // End game if no lives left
    if (gameStats.lives <= 0) {
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
