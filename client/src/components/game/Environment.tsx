import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function Environment() {
  const skyTexture = useTexture("/textures/sky.png");
  const grassTexture = useTexture("/textures/grass.png");
  const skyboxRef = useRef<THREE.Mesh>(null);
  
  // Configure grass texture for tiling
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 50);
  
  // Animate skybox for dynamic feeling
  useFrame(({ clock }) => {
    if (skyboxRef.current) {
      skyboxRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });
  
  return (
    <group>
      {/* Skybox */}
      <mesh ref={skyboxRef} scale={[200, 200, 200]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          map={skyTexture} 
          side={THREE.BackSide}
          color="#87CEEB"
        />
      </mesh>
      
      {/* Ground on both sides of the road */}
      <mesh position={[-15, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 200]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>
      <mesh position={[15, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 200]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#0f172a", 50, 120]} />
    </group>
  );
}