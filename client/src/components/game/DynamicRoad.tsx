import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { LANE_CONFIG } from "@/lib/constants/lanes";
import { useDriving } from "@/lib/stores/useDriving";
import * as THREE from "three";

export function DynamicRoad() {
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const roadRef = useRef<THREE.Mesh>(null);
  const { playerPosition, difficulty } = useDriving();
  
  // Configure texture for tiling and animation
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 20);
  
  // Pre-compute speed lines to avoid Math.random in render
  const speedLines = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 25,
      z: i * 10 - 100,
      rotation: Math.random() * Math.PI,
      size: 2 + Math.random() * 2
    }));
  }, []);
  
  // Animate road texture for movement effect
  useFrame((_, delta) => {
    if (asphaltTexture) {
      asphaltTexture.offset.y += delta * (0.5 + difficulty * 0.1);
    }
  });

  return (
    <group>
      {/* Main road surface with animation */}
      <mesh ref={roadRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 200]} />
        <meshLambertMaterial 
          map={asphaltTexture} 
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Dynamic lane dividers that pulse with difficulty */}
      {[-3, 0, 3].map((x, index) => (
        <group key={index}>
          {Array.from({ length: 40 }).map((_, i) => (
            <mesh
              key={i}
              position={[x, 0.01, i * 5 - 100]}
              scale={[1, 1, 1 + Math.sin(Date.now() * 0.001 + i) * 0.1]}
            >
              <boxGeometry args={[0.2, 0.1, 2]} />
              <meshLambertMaterial 
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.1 + difficulty * 0.05}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Enhanced road edges with glow effect */}
      <mesh position={[-10, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 200]} />
        <meshLambertMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[10, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 200]} />
        <meshLambertMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Enhanced lane markers with pulsing effect */}
      {LANE_CONFIG.map((lane, index) => (
        <group key={index} position={[lane.position, 0.02, playerPosition - 10]}>
          <mesh>
            <boxGeometry args={[3, 0.1, 1.5]} />
            <meshLambertMaterial 
              color={lane.color} 
              transparent 
              opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.2}
              emissive={lane.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
      
      {/* Speed lines for enhanced feeling of movement */}
      {speedLines.map((line) => (
        <mesh
          key={line.id}
          position={[
            line.x,
            0.05,
            playerPosition + line.z
          ]}
          rotation={[-Math.PI / 2, 0, line.rotation]}
        >
          <planeGeometry args={[0.1, line.size + difficulty]} />
          <meshLambertMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}