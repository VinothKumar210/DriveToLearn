import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useDriving } from "@/lib/stores/useDriving";
import { LANE_POSITIONS } from "@/lib/constants/lanes";
import * as THREE from "three";

interface CarProps {
  isPlayer?: boolean;
  lane?: number;
  position?: number;
  color?: string;
}

export function Car({ isPlayer = false, lane = 0, position = 0, color = "#ff0000" }: CarProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { playerLane, playerPosition } = useDriving();
  
  // Use centralized lane positions
  const lanePositions = LANE_POSITIONS;
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    if (isPlayer) {
      // Smooth lane transitions for player
      const targetX = lanePositions[playerLane] || lanePositions[0];
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetX,
        0.1
      );
      meshRef.current.position.z = playerPosition;
    } else {
      // Static positioning for traffic cars
      meshRef.current.position.x = lanePositions[lane] || lanePositions[0];
      meshRef.current.position.z = position;
    }
  });

  return (
    <group ref={meshRef} position={[lanePositions[lane] || 0, 1, position]}>
      {/* Car body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, -0.5]}>
        <boxGeometry args={[1.6, 0.8, 2]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Wheels */}
      {[
        [-0.9, -0.3, 1.2],
        [0.9, -0.3, 1.2],
        [-0.9, -0.3, -1.2],
        [0.9, -0.3, -1.2],
      ].map((wheelPos, index) => (
        <mesh key={index} position={wheelPos as [number, number, number]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshLambertMaterial color="#222222" />
        </mesh>
      ))}
      
      {/* Headlights for player car */}
      {isPlayer && (
        <>
          <mesh position={[-0.6, 0.2, 2.1]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshLambertMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.6, 0.2, 2.1]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshLambertMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}
