import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { Points, PointsMaterial } from "three";
import * as THREE from "three";

extend({ Points, PointsMaterial });

interface ParticleSystemProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  spread?: number;
  emissionRate?: number;
  position?: [number, number, number];
  type?: "success" | "collision" | "trail";
}

export function ParticleSystem({
  count = 50,
  color = "#ffffff",
  size = 0.1,
  speed = 2,
  spread = 3,
  position = [0, 0, 0],
  type = "success"
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();
  const lifetimeRef = useRef<Float32Array>();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Initial positions
      positions[i3] = position[0] + (Math.random() - 0.5) * spread;
      positions[i3 + 1] = position[1] + (Math.random() - 0.5) * spread;
      positions[i3 + 2] = position[2] + (Math.random() - 0.5) * spread;
      
      // Initial velocities based on particle type
      if (type === "success") {
        velocities[i3] = (Math.random() - 0.5) * speed;
        velocities[i3 + 1] = Math.random() * speed * 2;
        velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      } else if (type === "collision") {
        const angle = Math.random() * Math.PI * 2;
        velocities[i3] = Math.cos(angle) * speed;
        velocities[i3 + 1] = Math.random() * speed;
        velocities[i3 + 2] = Math.sin(angle) * speed;
      } else { // trail
        velocities[i3] = (Math.random() - 0.5) * speed * 0.5;
        velocities[i3 + 1] = (Math.random() - 0.5) * speed * 0.5;
        velocities[i3 + 2] = -speed;
      }
      
      // Random lifetime
      lifetimes[i] = Math.random() * 2;
    }
    
    velocitiesRef.current = velocities;
    lifetimeRef.current = lifetimes;
    
    return positions;
  }, [count, speed, spread, position, type]);
  
  useFrame((_, delta) => {
    if (!pointsRef.current || !velocitiesRef.current || !lifetimeRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimeRef.current;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] -= delta;
      
      if (lifetimes[i] <= 0) {
        // Reset particle
        positions[i3] = position[0] + (Math.random() - 0.5) * spread;
        positions[i3 + 1] = position[1] + (Math.random() - 0.5) * spread;
        positions[i3 + 2] = position[2] + (Math.random() - 0.5) * spread;
        lifetimes[i] = Math.random() * 2;
      } else {
        // Update position
        positions[i3] += velocities[i3] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;
        positions[i3 + 2] += velocities[i3 + 2] * delta;
        
        // Apply gravity for success particles
        if (type === "success") {
          velocities[i3 + 1] -= 9.81 * delta * 0.1;
        }
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}