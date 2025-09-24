import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useDriving } from "@/lib/stores/useDriving";
import { Car } from "./Car";

export function Traffic() {
  const { traffic, addTrafficCar, updateTraffic, difficulty } = useDriving();
  
  // Generate traffic cars periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Spawn rate increases with difficulty
      const spawnChance = Math.min(0.7, 0.3 + (difficulty * 0.1));
      
      if (Math.random() < spawnChance) {
        const newCar = {
          id: `traffic_${Date.now()}_${Math.random()}`,
          lane: Math.floor(Math.random() * 4), // Random lane 0-3
          position: 50, // Start far ahead
          speed: 0.5 + Math.random() * 0.5, // Random speed
        };
        
        addTrafficCar(newCar);
      }
    }, Math.max(1000, 3000 - (difficulty * 200))); // Faster spawn with difficulty
    
    return () => clearInterval(interval);
  }, [difficulty, addTrafficCar]);
  
  // Update traffic positions
  useFrame((_, delta) => {
    updateTraffic(delta);
  });
  
  const carColors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#22c55e", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#f97316", // Orange
  ];

  return (
    <>
      {traffic.map((car) => (
        <Car
          key={car.id}
          lane={car.lane}
          position={car.position}
          color={carColors[parseInt(car.id.slice(-1)) % carColors.length]}
        />
      ))}
    </>
  );
}
