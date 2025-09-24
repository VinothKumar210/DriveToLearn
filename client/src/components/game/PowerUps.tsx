import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useDriving } from "@/lib/stores/useDriving";
import { useQuiz } from "@/lib/stores/useQuiz";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface PowerUp {
  id: string;
  type: "speed" | "shield" | "time" | "points";
  position: [number, number, number];
  collected: boolean;
}

interface PowerUpProps {
  powerup: PowerUp;
  onCollect: (id: string, type: string) => void;
}

function PowerUpItem({ powerup, onCollect }: PowerUpProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { playerLane, playerPosition } = useDriving();
  
  const powerUpConfig = {
    speed: { color: "#00ff00", symbol: "⚡", effect: "Speed Boost" },
    shield: { color: "#0088ff", symbol: "🛡", effect: "Shield" },
    time: { color: "#ff8800", symbol: "⏰", effect: "+5 Seconds" },
    points: { color: "#ffff00", symbol: "★", effect: "+50 Points" }
  };
  
  const config = powerUpConfig[powerup.type];
  
  useFrame((_, delta) => {
    if (!meshRef.current || powerup.collected) return;
    
    // Rotate the power-up
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.3;
    
    // Check for collection
    const distance = Math.abs(powerup.position[2] - playerPosition);
    const laneMatch = Math.abs(powerup.position[0] - (playerLane * 6 - 9)) < 2;
    
    if (distance < 3 && laneMatch && !powerup.collected) {
      onCollect(powerup.id, powerup.type);
    }
  });
  
  if (powerup.collected) return null;
  
  return (
    <group ref={meshRef} position={powerup.position}>
      {/* Power-up base */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 8]} />
        <meshLambertMaterial 
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={[1.5, 0.1, 1.5]}>
        <cylinderGeometry args={[1, 1, 0.1, 8]} />
        <meshLambertMaterial 
          color={config.color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Symbol */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        font="/fonts/inter.json"
      >
        {config.symbol}
      </Text>
      
      {/* Effect text */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color={config.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        font="/fonts/inter.json"
      >
        {config.effect}
      </Text>
    </group>
  );
}

export function PowerUps() {
  const powerUpsRef = useRef<PowerUp[]>([]);
  const { difficulty, playerPosition } = useDriving();
  const { gameStats, setTimeRemaining, timeRemaining } = useQuiz();
  
  // Generate power-ups periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3 + difficulty * 0.1) {
        const types = ["speed", "shield", "time", "points"] as const;
        const randomType = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * 4);
        
        const newPowerUp: PowerUp = {
          id: `powerup_${Date.now()}_${Math.random()}`,
          type: randomType,
          position: [lane * 6 - 9, 1.5, playerPosition + 50],
          collected: false
        };
        
        powerUpsRef.current.push(newPowerUp);
        
        // Clean up old power-ups
        powerUpsRef.current = powerUpsRef.current.filter(
          (pu) => !pu.collected && pu.position[2] > playerPosition - 20
        );
      }
    }, 3000 - difficulty * 200);
    
    return () => clearInterval(interval);
  }, [difficulty, playerPosition]);
  
  const handleCollect = (id: string, type: string) => {
    // Mark as collected
    const powerUp = powerUpsRef.current.find(pu => pu.id === id);
    if (powerUp) {
      powerUp.collected = true;
      
      // Apply power-up effects
      switch (type) {
        case "speed":
          // Temporary speed boost (handled in useDriving)
          console.log("Speed boost collected!");
          break;
        case "shield":
          // Temporary invincibility
          console.log("Shield collected!");
          break;
        case "time":
          // Add time
          setTimeRemaining(Math.min(15, timeRemaining + 5));
          console.log("Time bonus collected!");
          break;
        case "points":
          // Add points (would need to modify useQuiz)
          console.log("Points bonus collected!");
          break;
      }
    }
  };
  
  return (
    <>
      {powerUpsRef.current.map((powerup) => (
        <PowerUpItem
          key={powerup.id}
          powerup={powerup}
          onCollect={handleCollect}
        />
      ))}
    </>
  );
}