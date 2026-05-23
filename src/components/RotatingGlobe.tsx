import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />

      <meshBasicMaterial
        color="#00d9ff"
        wireframe
      />
    </mesh>
  );
}
