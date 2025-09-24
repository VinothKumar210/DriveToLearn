import { create } from "zustand";
import { TrafficCar } from "@/types/game";

interface DrivingState {
  playerLane: number; // 0-3
  playerPosition: number;
  traffic: TrafficCar[];
  gameSpeed: number;
  difficulty: number;
  
  // Actions
  setPlayerLane: (lane: number) => void;
  updatePlayerPosition: (delta: number) => void;
  addTrafficCar: (car: TrafficCar) => void;
  updateTraffic: (delta: number) => void;
  removeTrafficCar: (id: string) => void;
  increaseDifficulty: () => void;
  resetDriving: () => void;
  checkCollisions: () => boolean;
}

export const useDriving = create<DrivingState>((set, get) => ({
  playerLane: 1, // Start in lane 1 (B)
  playerPosition: 0,
  traffic: [],
  gameSpeed: 1.0,
  difficulty: 1,
  
  setPlayerLane: (lane) => {
    // Clamp lane between 0-3
    const clampedLane = Math.max(0, Math.min(3, lane));
    set({ playerLane: clampedLane });
  },
  
  updatePlayerPosition: (delta) => {
    const { playerPosition, gameSpeed } = get();
    set({ playerPosition: playerPosition + delta * gameSpeed * 20 });
  },
  
  addTrafficCar: (car) => {
    const { traffic } = get();
    set({ traffic: [...traffic, car] });
  },
  
  updateTraffic: (delta) => {
    const { traffic, gameSpeed } = get();
    const updatedTraffic = traffic
      .map(car => ({
        ...car,
        position: car.position - car.speed * delta * gameSpeed * 30
      }))
      .filter(car => car.position > -50); // Remove cars that are too far behind
    
    set({ traffic: updatedTraffic });
  },
  
  removeTrafficCar: (id) => {
    const { traffic } = get();
    set({ traffic: traffic.filter(car => car.id !== id) });
  },
  
  checkCollisions: () => {
    const { playerLane, playerPosition, traffic } = get();
    
    // Check for collisions with traffic cars
    for (const car of traffic) {
      const sameLane = car.lane === playerLane;
      const closePosition = Math.abs(car.position - playerPosition) < 8;
      
      if (samelane && closePosition) {
        return true;
      }
    }
    
    return false;
  },
  
  increaseDifficulty: () => {
    const { difficulty } = get();
    set({
      difficulty: difficulty + 1,
      gameSpeed: Math.min(2.0, 1.0 + (difficulty * 0.1))
    });
  },
  
  resetDriving: () => set({
    playerLane: 1,
    playerPosition: 0,
    traffic: [],
    gameSpeed: 1.0,
    difficulty: 1,
  }),
}));
