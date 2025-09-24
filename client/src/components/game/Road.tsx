import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Road() {
  const asphaltTexture = useTexture("/textures/asphalt.png");
  
  // Configure texture for tiling
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 20);

  return (
    <group>
      {/* Main road surface */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 200]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>
      
      {/* Lane dividers */}
      {[-3, 0, 3].map((x, index) => (
        <group key={index}>
          {Array.from({ length: 40 }).map((_, i) => (
            <mesh
              key={i}
              position={[x, 0, i * 5 - 100]}
            >
              <boxGeometry args={[0.2, 0.1, 2]} />
              <meshLambertMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Road edges */}
      <mesh position={[-10, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 200]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh position={[10, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 200]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Lane labels (floating above road) */}
      {[
        { position: [-7.5, 2, -10], label: "A", color: "#ef4444" },
        { position: [-2.5, 2, -10], label: "B", color: "#3b82f6" },
        { position: [2.5, 2, -10], label: "C", color: "#22c55e" },
        { position: [7.5, 2, -10], label: "D", color: "#eab308" },
      ].map((lane, index) => (
        <group key={index} position={lane.position}>
          <mesh>
            <boxGeometry args={[3, 1, 0.1]} />
            <meshLambertMaterial color={lane.color} transparent opacity={0.8} />
          </mesh>
          {/* Text would need a text geometry or sprite - for now using colored box */}
        </group>
      ))}
    </group>
  );
}
