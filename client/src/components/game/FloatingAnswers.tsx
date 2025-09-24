import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import { useQuiz } from "@/lib/stores/useQuiz";
import { useDriving } from "@/lib/stores/useDriving";
import { LANE_POSITIONS, LANE_CONFIG } from "@/lib/constants/lanes";
import * as THREE from "three";

export function FloatingAnswers() {
  const { questions, currentQuestionIndex } = useQuiz();
  const { playerLane, playerPosition } = useDriving();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) return null;

  // Use centralized lane configuration
  const lanePositions = LANE_POSITIONS;
  const lanes = LANE_CONFIG;

  return (
    <group>
      {currentQuestion.options.map((option, index) => {
        const isSelected = playerLane === index;
        const lane = lanes[index];
        
        return (
          <group 
            key={index} 
            position={[lane.position, 3, playerPosition - 15]}
          >
            <Billboard>
              {/* Background plane for better text visibility */}
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[6, 2]} />
                <meshBasicMaterial 
                  color={isSelected ? lane.color : "#1f2937"} 
                  transparent 
                  opacity={0.9}
                />
              </mesh>
              
              {/* Lane label (A, B, C, D) */}
              <Text
                position={[0, 0.6, 0]}
                fontSize={0.8}
                color={isSelected ? "#ffffff" : "#9ca3af"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                font="/fonts/inter.json"
              >
                {lane.label}
              </Text>
              
              {/* Answer text */}
              <Text
                position={[0, -0.2, 0]}
                fontSize={0.4}
                color={isSelected ? "#ffffff" : "#d1d5db"}
                anchorX="center"
                anchorY="middle"
                maxWidth={5}
                textAlign="center"
                outlineWidth={0.01}
                outlineColor="#000000"
                font="/fonts/inter.json"
              >
                {option}
              </Text>
              
              {/* Selection indicator */}
              {isSelected && (
                <mesh position={[0, -1.2, 0]}>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              )}
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}