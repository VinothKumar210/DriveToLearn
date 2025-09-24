import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useDriving } from "@/lib/stores/useDriving";
import { LANE_POSITIONS } from "@/lib/constants/lanes";
import { ParticleSystem } from "./ParticleSystem";
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
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  
  // Use centralized lane positions
  const lanePositions = LANE_POSITIONS;
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    if (isPlayer) {
      // Smooth lane transitions for player
      const targetX = lanePositions[playerLane] || lanePositions[0];
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetX,
        0.15
      );
      meshRef.current.position.z = playerPosition;
    } else {
      // Static positioning for traffic cars
      meshRef.current.position.x = lanePositions[lane] || lanePositions[0];
      meshRef.current.position.z = position;
    }
    
    // Animate wheels
    wheelRefs.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += delta * 10;
      }
    });
  });

  return (
    <group ref={meshRef} position={[lanePositions[lane] || 0, 1, position]}>
      {/* Car body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshPhongMaterial color={color} shininess={100} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.6, 0.8, 2]} />
        <meshPhongMaterial color={color} shininess={100} />
      </mesh>
      
      {/* Car details */}
      <mesh position={[0, 0.2, 2.2]} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.2]} />
        <meshPhongMaterial color="#333333" />
      </mesh>
      
      {/* Tail lights */}
      {!isPlayer && (
        <>
          <mesh position={[-0.7, 0.2, -2.1]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshLambertMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.7, 0.2, -2.1]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshLambertMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
      
      {/* Exhaust particles for player car */}
      {isPlayer && (
        <ParticleSystem
          count={10}
          color="#666666"
          size={0.05}
          speed={1}
          spread={0.5}
          position={[0, -0.2, -2.5]}
          type="trail"
        />
      )}
      
      {/* Wheels */}
      {[
        [-0.9, -0.3, 1.2],
        [0.9, -0.3, 1.2],
        [-0.9, -0.3, -1.2],
        [0.9, -0.3, -1.2],
      ].map((wheelPos, index) => (
        <mesh 
          key={index} 
          position={wheelPos as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          ref={(mesh) => {
            if (mesh) wheelRefs.current[index] = mesh;
          }}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshPhongMaterial color="#222222" shininess={30} />
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
